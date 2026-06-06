namespace snm.api.Game;

public class GameManager
{
    private readonly Deck _deck;
    private readonly List<CardDto> _communityCards;
    private readonly Dictionary<int, PlayerDto> _players;
    private readonly int _playerCount;
    private Stage _currentStage;

    // Initialize Game
    public GameManager(in List<string> playerNames, int mafiaCount)
    {
        _currentStage = Stage.Initial;
        _playerCount = playerNames.Count;
        _deck = new Deck();
        _communityCards = new List<CardDto>();
        _players = new Dictionary<int, PlayerDto>(_playerCount);

        int[] mafiaIndices = new int[mafiaCount];
        
        Random rand = new();
        for (int i = 0; i < mafiaCount; i++) // Select random mafias
            mafiaIndices[i] = rand.Next(0, _playerCount);
        
        CardDto[][] hands = _deck.DealCards(_playerCount);
        
        // Assign player details: Name, Role, Hand and whether they're a mafia
        for (int playerIndex = 0; playerIndex < _playerCount; playerIndex++)
        {
            CardDto[] hand = hands[playerIndex];
            if (mafiaIndices.Contains(playerIndex))
                _players[playerIndex] = new PlayerDto
                {
                    Name = _players[playerIndex].Name,
                    Role = GetRoleFromHand(hand),
                    IsMafia = true,
                    Hand =  hand,
                    Living = true,
                    Jailed = false
                };
            else
                _players[playerIndex] = new PlayerDto
                {
                    Name = _players[playerIndex].Name,
                    Role = GetRoleFromHand(hand),
                    IsMafia = false,
                    Hand =  hand,
                    Living = true,
                    Jailed = false
                };
        }
    }
    
    // Gets all player data
    public Dictionary<int, PlayerDto> GetPlayers => _players;

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
        
        foreach (int pid in _players.Keys)
            _players[pid].Role = GetRoleFromHand(_players[pid].Hand);
        
        if (_currentStage != Stage.Showdown)
            _currentStage++;
    }

    // Progress to the next level and handle current level
    // Returns updated game information
    public Dictionary<int, PlayerUpdateDto> UpdatePlayerActions(List<int> mafiaTargets, Dictionary<Role, List<int>> civTargets)
    {
        Dictionary<int, PlayerUpdateDto> updates = new Dictionary<int, PlayerUpdateDto>();

        foreach (int target in mafiaTargets)
        {
            _players[target].Living = false;
            updates[target] =
                new PlayerUpdateDto(_players[target].Role, _players[target].Living, _players[target].Jailed);
        }
                
        foreach (int pid in civTargets[Role.Vigilante])
        {
            _players[pid].Living = false;
            updates[pid] = new PlayerUpdateDto(_players[pid].Role, _players[pid].Living, _players[pid].Jailed);
        }
        
        foreach (int pid in civTargets[Role.Jailer])
        {
            _players[pid].Jailed = true;
            updates[pid] = new PlayerUpdateDto(_players[pid].Role, _players[pid].Living, _players[pid].Jailed);
        }
        
        foreach (int pid in civTargets[Role.Doctor])
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