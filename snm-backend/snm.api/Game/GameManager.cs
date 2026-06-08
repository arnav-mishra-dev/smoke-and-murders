namespace snm.api.Game;

public class GameManager
{
    private readonly Deck _deck = new();
    private readonly List<CardDto> _communityCards = new();
    private readonly Dictionary<string, Player> _players = new();
    private Stage _currentStage = Stage.Initial;
    private GameSettingsDto? _gameSettings;
    
    public bool GameStarted { get; private set; }

    // Called after adding all players
    public void InitializeGame(GameSettingsDto gameSettings)
    {
        _gameSettings = gameSettings;
        GameStarted = true;
        
        int playerCount = _players.Count;
        if (_gameSettings.MafiaCount > playerCount / 4) throw new ArgumentOutOfRangeException();

        int mafias = 0;
        while (true)
        {
            foreach (string pid in _players.Keys)
            {
                bool isMafia = UniversalRandom.Rand.Next(0, playerCount) < _gameSettings.MafiaCount;
                _players[pid].IsMafia = isMafia;
                if (isMafia)
                {
                    mafias++;
                    if (mafias == _gameSettings.MafiaCount) break;
                }
            }
        }
    }

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
    
    public void RemovePlayer(string pid) => _players.Remove(pid);
    
    // Gets all player data
    public Dictionary<string, string> GetPlayers()
    {
        Dictionary<string, string> players = new Dictionary<string, string>();
        
        foreach (var player in _players)
            players.Add(player.Key, player.Value.Name);
        
        return players;
    }

    public void DealNightCards()
    {
        switch (_currentStage)
        {
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
        
        foreach (string pid in _players.Keys)
            _players[pid].Role = GetRoleFromHand(_players[pid].Hand);
        
        if (_currentStage != Stage.Showdown)
            _currentStage++;
    }

    // Progress to the next level and handle current level
    // Returns updated game information
    public Dictionary<string, PlayerUpdateDto> UpdatePlayerActions(List<string> mafiaTargets, Dictionary<Role, List<string>> civTargets)
    {
        Dictionary<string, PlayerUpdateDto> updates = new Dictionary<string, PlayerUpdateDto>();

        foreach (string target in mafiaTargets)
        {
            _players[target].Living = false;
            updates[target] =
                new PlayerUpdateDto(_players[target].Role, _players[target].Living, _players[target].Jailed);
        }
                
        foreach (string pid in civTargets[Role.Vigilante])
        {
            _players[pid].Living = false;
            updates[pid] = new PlayerUpdateDto(_players[pid].Role, _players[pid].Living, _players[pid].Jailed);
        }
        
        foreach (string pid in civTargets[Role.Jailer])
        {
            _players[pid].Jailed = true;
            updates[pid] = new PlayerUpdateDto(_players[pid].Role, _players[pid].Living, _players[pid].Jailed);
        }
        
        foreach (string pid in civTargets[Role.Doctor])
        {
            _players[pid].Living = true;
            updates[pid] = new PlayerUpdateDto(_players[pid].Role, _players[pid].Living, _players[pid].Jailed);
        }
        
        return updates;
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
            Dictionary<CardSuit, int> suitFrequency  = new Dictionary<CardSuit, int>();
            foreach (CardSuit suit in suits)
                suitFrequency[suit]++;
            
            // Frequency of every value
            Dictionary<CardValue, int> valueFrequency  = new Dictionary<CardValue, int>();
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
}