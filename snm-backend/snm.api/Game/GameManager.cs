using snm.api.DTOs;

namespace snm.api.Game;

public class GameManager
{
    private static readonly Role[] OrderedRoles =
    [
        Role.Detective,
        Role.Doctor,
        Role.Mayor,
        Role.Jailer,
        Role.Vigilante
    ];
    
    private readonly Deck _deck = new();
    private readonly List<CardDto> _communityCards = new();
    private readonly Dictionary<string, Player> _players = new();
    private Stage _currentStage = Stage.Initial;
    private GameSettingsDto? _gameSettings;
    
    public bool GameStarted { get; private set; }
    public bool IsNightfall { get; private set; }

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
    
    public List<CardDto> GetCommunityCards() => _communityCards.ToList();
    public Player GetPlayerData(string pid) => _players[pid];
    public int LivingPlayerCount() => _players.Values.Count(p => p.Living);
    public int LivingCivilianCount() => _players.Values.Count(p => p is { Living: true, IsMafia: false });
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
        
        if (_currentStage != Stage.Showdown)
            _currentStage = (Stage)((int)_currentStage + 1);

        IsNightfall = true;
    }

    public int TurnTakerCount()
    {
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

        return turnTakers;
    }

    // Progress to the next level and handle current level
    // Returns updated game information
    public List<string> UpdatePlayerActions(HashSet<string> mafiaTargets, Dictionary<Role, HashSet<string>> civTargets)
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
        
        return deathUpdates.Keys.Where(key => deathUpdates[key]).ToList();
    }

    // Returns player role based on 2 card hand passed to it and community cards member
    private Role GetRoleFromHand(CardDto[] playerCards)
    {
        List<CardDto> cards = playerCards.Concat(_communityCards).ToList();
        List<CardValue> values = cards.Select(c => c.Value).ToList();
        List<CardSuit> suits  = cards.Select(c => c.Suit).ToList();

        if (cards.Count == 2)
        {
            // One Pair
            if (values[0] == values[1])
            {
                return OrderedRoles[0];
            }
        }
        else
        {
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

            bool IsStraight(List<CardValue> valsToCheck)
            {
                List<CardValue> sortedVals = valsToCheck.Distinct().OrderBy(v => v).ToList();
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
                        else break;
                    }

                    if (count >= 5) return true;
                }
                return false;
            }

            bool IsStraightFlush()
            {
                foreach (CardSuit suit in suits.Distinct())
                {
                    List<CardValue> suitValues = cards.Where(c => c.Suit == suit).Select(c => c.Value).ToList();
                    if (IsStraight(suitValues)) return true;
                }
                return false;
            }

            // Every hand boolean
            bool fourOfKind = valueFrequency.Values.Any(i => i >= 4);
            bool straightFlush = IsStraightFlush();
            bool threeOfKind = valueFrequency.Values.Any(i => i >= 3);
            bool flush = suitFrequency.Values.Any(i => i >= 5);
            bool fullHouse = valueFrequency.Values.Any(i => i >= 3)
                             && valueFrequency.Values.Count(i => i >= 2) >= 2;
            bool straight = IsStraight(values);
            bool twoPairs = valueFrequency.Values.Count(i => i >= 2) >= 2;
            bool onePair = valueFrequency.Values.Count(i => i == 2) == 1;
            
            if (straightFlush || fourOfKind) return OrderedRoles[4];
            if (fullHouse || flush) return OrderedRoles[3];
            if (straight || threeOfKind) return OrderedRoles[2];
            if (twoPairs) return OrderedRoles[1];
            if (onePair) return OrderedRoles[0];
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