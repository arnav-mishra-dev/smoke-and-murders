namespace snm.api.Game;

public class GameManager
{
    private readonly Deck _deck;
    private readonly PlayerDto[] _players;
    private readonly int _playerCount;
    private Stage _currentStage;
    private List<CardDto> _communityCards;

    // Initialize Game
    public GameManager(in List<string> playerNames, int mafiaCount)
    {
        _currentStage = Stage.Initial;
        _playerCount = playerNames.Count;
        _deck = new Deck();
        _communityCards = new List<CardDto>();
        _players = new PlayerDto[_playerCount];

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
                _players[playerIndex] = new PlayerDto(playerNames[playerIndex], Role.None, true, hand, true);
            else
                _players[playerIndex] = new PlayerDto(playerNames[playerIndex], Role.None, false, hand, true);
        }
    }
    
    // Gets all player data
    public PlayerDto[] GetPlayers => _players;

    // Progress to the next level and handle current level
    // Returns updated game information
    public PlayerUpdateDto[] ProgressNextLevel(Dictionary<Role, List<int>> targets)
    {
        PlayerUpdateDto[] updates = [];
        switch (_currentStage)
        {
            case Stage.Initial:
                break;
            
            case Stage.Flop:
                for (int i = 0; i < 3; i++)
                    _communityCards.Add(_deck.DrawRandomCard());
                break;
            
            case Stage.Turn:
                break;
            
            case Stage.River:
                break;
        }

        if (_currentStage != Stage.River)
            _currentStage++;
        
        return updates;
    }

    // Returns player role based on 2 card hand passed to it and community cards member
    private Role GetRoleFromHand(CardDto[] player)
    {
        int cardCount = 2 + _communityCards.Count;
        List<CardValue> values = new List<CardValue>();
        List<CardSuit> suits  = new List<CardSuit>();
        
        foreach (CardDto card in player)
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
                        if (nextVal == CardValue.King && sortedVals.Contains(CardValue.Ace)) count++;
                        if (sortedVals.Contains(nextVal)) count++;
                    }

                    if (count == 5) return true;
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