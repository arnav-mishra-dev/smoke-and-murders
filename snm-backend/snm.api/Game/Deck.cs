namespace snm.api.Game;

public class Deck
{
    private readonly List<CardDto> _cards;

    // Initializes the deck with all 52 cards
    public Deck()
    {
        _cards = new List<CardDto>();
        for (int s = 1; s <= 4; s++)
            for (int v = 1; v <= 13; v++)
                _cards.Add(new CardDto((CardSuit)s, (CardValue)v));
    }

    public CardDto DrawRandomCard()
    {
        Random rand = new();
        
        int position = rand.Next(0, _cards.Count);
        CardDto card = _cards[position];
        
        _cards.RemoveAt(position);
        
        return card;
    }

    // Collects card pairs in a 2D array and removes them from the deck
    // Returns the pairs
    public CardDto[][] DealCards(in int playerCount)
    {
        Random rand = new Random();
        CardDto[][] hands = new CardDto[playerCount][];
        
        for (int end = 0; end < playerCount; end++)
        {
            hands[end] = new CardDto[2];
            for (int pairPos = 0; pairPos < 2; pairPos++)
            {
                int position = rand.Next(0, _cards.Count);
                hands[end][pairPos] = _cards[position];
                _cards.RemoveAt(position);
            }
        }

        return hands;
    }
}