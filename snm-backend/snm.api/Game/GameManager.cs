using snm.api.DTOs;

namespace snm.api.Game;

public class GameManager
{
    private readonly Deck _deck = new();
    private readonly List<CardDto> _communityCards = new();
    private readonly Dictionary<string, Player> _players = new();
    private Stage _currentStage = Stage.Initial;
    private GameSettingsDto? _gameSettings;
    
    public bool GameStarted { get; private set; }
    public bool IsNightfall { get; private set; }
    public int TurnTakerCount { get; private set; }

    // Called after adding all players
    public void InitializeGame(GameSettingsDto gameSettings)
    {
        _gameSettings = gameSettings;
        GameStarted = true;
        
        int playerCount = _players.Count;
        if (_gameSettings.MafiaCount > playerCount / 4) throw new ArgumentOutOfRangeException();

        int mafias = 0;
        do
        {
            foreach (string pid in _players.Keys)
            {
                bool isMafia = Random.Shared.Next(0, playerCount) < _gameSettings.MafiaCount;
                _players[pid].IsMafia = isMafia;
                if (isMafia)
                {
                    mafias++;
                    if (mafias == _gameSettings.MafiaCount) break;
                }
            }
        }
        while (mafias < _gameSettings.MafiaCount);
    }
    
    public CardDto[] GetCommunityCards() => _communityCards.ToArray();
    public Player GetPlayerData(string pid) => _players[pid];
    public int LivingPlayerCount() => _players.Values.Count(p => p.Living);
    public int LivingMafiaCount() => _players.Values.Count(p => p is { IsMafia: true, Living: true });
    
    public void RemovePlayer(string pid) => _players.Remove(pid);
    public void KillPlayer(string pid) => _players[pid].Living = false;

    // Adds a player to the game
    public void AddPlayer(string pid, string name)
    {
        if (name.Length > 15) throw new ArgumentOutOfRangeException();
        
        CardDto[] playerHand = new CardDto[2];
        
        for (int i = 0; i < 2; i++)
            playerHand[i] = _deck.DrawRandomCard();
        
        Player playerData = new Player
        {
            Name = name,
            Role = GetRoleFromHand(playerHand),
            Hand = playerHand,
            Jailed = false,
            Living = true
        };
        _players.Add(pid, playerData);
    }
    
    // Gets player names and uuids
    public Dictionary<string, string> GetPlayers(string type = "All")
    {
        Dictionary<string, string> players = new Dictionary<string, string>();
        switch (type)
        {
            case "All":
                foreach (var player in _players)
                    players.Add(player.Key, player.Value.Name);
                break;
            
            case "Mafias":
                foreach (var player in _players)
                    if (player.Value.IsMafia)
                        players.Add(player.Key, player.Value.Name);
                break;
            
            case "Civilians":
                foreach (var player in _players)
                    if (!player.Value.IsMafia)
                        players.Add(player.Key, player.Value.Name);
                break;
        }
        
        return players;
    }

    public void DealNightCards()
    {
        switch (_currentStage)
        {
            case Stage.Initial:
                break;
            
            case Stage.Flop:
                for (int i = 0; i < 3; i++)
                    _communityCards.Add(_deck.DrawRandomCard());
                break;
            
            case Stage.Turn:
                _communityCards.Add(_deck.DrawRandomCard());
                break;
            
            case Stage.River:
                _communityCards.Add(_deck.DrawRandomCard());
                break;
            
            case Stage.Showdown: break;
        }

        // Count players who can take turns
        int turnTakers = 0;
        foreach (string pid in _players.Keys)
        {
            _players[pid].Role = GetRoleFromHand(_players[pid].Hand);
            if (_players[pid].IsMafia
            || _players[pid].Role is
                    Role.Doctor or
                    Role.Detective or
                    Role.Jailer or
                    Role.Vigilante
            && !_players[pid].Jailed)
            {
                turnTakers++;
            }
        }

        TurnTakerCount = turnTakers;
        
        if (_currentStage != Stage.Showdown)
            _currentStage = (Stage)((int)_currentStage + 1);

        IsNightfall = true;
    }

    // Progress to the next level and handle current level
    // Returns updated game information
    public string[] UpdatePlayerActions(HashSet<string> mafiaTargets, Dictionary<Role, HashSet<string>> civTargets)
    {
        Dictionary<string, bool> deathUpdates = new Dictionary<string, bool>();

        foreach (string playerUid in _players.Keys) // Free jailed players so they can perform actions on the next turn
        {
            _players[playerUid].Jailed = false;
        }
        
        foreach (string pid in civTargets[Role.Vigilante])
        {
            _players[pid].Living = false;
            deathUpdates.TryAdd(pid, true);
        }

        foreach (string target in mafiaTargets)
        {
            _players[target].Living = false;
            deathUpdates.TryAdd(target, true);
        }
        
        foreach (string pid in civTargets[Role.Doctor])
        {
            _players[pid].Living = true;
            if (!deathUpdates.TryAdd(pid, false))
            {
                deathUpdates[pid] = false;
            }
        }
        
        foreach (string pid in civTargets[Role.Jailer])
        {
            _players[pid].Jailed = true;
        }

        IsNightfall = false;
        
        return deathUpdates.Keys.Where(key => deathUpdates[key]).ToArray();
    }

    // Returns player role based on 2 card hand passed to it and community cards member
    private Role GetRoleFromHand(CardDto[] playerCards)
    {
        int cardCount = 2 + _communityCards.Count;
        List<CardValue> values = new List<CardValue>();
        List<CardSuit> suits  = new List<CardSuit>();
        
        foreach (CardDto card in playerCards)
        {
            values.Add(card.Value);
            suits.Add(card.Suit);
        }
        
        foreach (CardDto card in _communityCards)
        {
            values.Add(card.Value);
            suits.Add(card.Suit);
        }

        if (cardCount == 2)
        {
            // One Pair
            if (values[0] == values[1])
                return Role.Doctor;
        }
        else
        {
            // Royal flush - vigilante
            if (values.Contains(CardValue.Ace)
                && values.Contains(CardValue.King)
                && values.Contains(CardValue.Queen)
                && values.Contains(CardValue.Jack)
                && values.Contains(CardValue.Ten))
                return Role.Vigilante;
            
            // Frequency of every suit
            Dictionary<CardSuit, int> suitFrequency = new Dictionary<CardSuit, int>
            {
                { CardSuit.Spades, 0 },
                { CardSuit.Hearts, 0 },
                { CardSuit.Diamonds, 0 },
                { CardSuit.Clubs, 0 }
            };
            foreach (CardSuit suit in suits)
                suitFrequency[suit]++;
            
            // Frequency of every value
            Dictionary<CardValue, int> valueFrequency = new Dictionary<CardValue, int>
            {
                { CardValue.Ace, 0 },
                { CardValue.King, 0 },
                { CardValue.Queen, 0 },
                { CardValue.Jack, 0 },
                { CardValue.Ten, 0 },
                { CardValue.Nine, 0 },
                { CardValue.Eight, 0 },
                { CardValue.Seven, 0 },
                { CardValue.Six, 0 },
                { CardValue.Five, 0 },
                { CardValue.Four, 0 },
                { CardValue.Three, 0 },
                { CardValue.Two, 0 },
            };
            foreach (CardValue val in values)
                valueFrequency[val]++;

            bool IsStraight()
            {
                List<CardValue> sortedVals = values;
                sortedVals.Sort();

                foreach (CardValue val in sortedVals)
                {
                    if ((int)val > 10) break;
                    int count = 1;
                    for (int i = 1; i <= 4; i++)
                    {
                        if ((int)val + i > 13) break;
                        CardValue nextVal = (CardValue)((int)val + i);
                        if (nextVal is CardValue.King && sortedVals.Contains(CardValue.Ace)) count++;
                        if (sortedVals.Contains(nextVal)) count++;
                    }

                    if (count > 4) return true;
                }

                return false;
            }

            // Every hand boolean
            bool straight = IsStraight();
            bool flush = suitFrequency.Values.Count(i => i >= 4) > 0;
            bool fourOfKind = valueFrequency.Values.Count(i => i >= 4) > 0;
            bool threeOfKind = valueFrequency.ContainsValue(3);
            bool twoPair = valueFrequency.Values.Count(i => i == 2) >= 2;
            bool onePair = valueFrequency.Values.Count(i => i == 2) >= 1;
            
            if ((straight && flush) || fourOfKind) return Role.Jailer;
            if ((threeOfKind && onePair) || flush) return Role.Mayor;
            if (straight || threeOfKind) return Role.Detective;
            if (onePair || twoPair) return Role.Doctor;
        }
        
        return Role.None;
    }
    
    public void ResetGameState()
    {
        IsNightfall = false;
        GameStarted = false;
        _deck.ResetDeck();
        _communityCards.Clear();
        foreach (string player in _players.Keys)
        {
            CardDto[] playerHand = new CardDto[2];
        
            for (int i = 0; i < 2; i++)
                playerHand[i] = _deck.DrawRandomCard();
        
            _players[player].Hand = playerHand;
            _players[player].Role = GetRoleFromHand(playerHand);
            _players[player].Jailed = false;
            _players[player].Living = true;
        }
    }
}