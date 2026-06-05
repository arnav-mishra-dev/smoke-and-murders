namespace snm.api.Cards;

public class Deck
{
    private readonly List<Card> _cards;

    // Initializes the deck with all 52 cards
    public Deck()
    {
        _cards = new List<Card>();
        for (int s = 1; s <= 4; s++)
            for (int v = 1; v <= 13; v++)
                _cards.Add(new Card((CardSuit)s, (CardValue)v));
    }

    // Collects card pairs in a 2D array and removes them from the deck
    // Returns the pairs
    public Card[][] DealCards(in int playerCount)
    {
        Random rand = new Random();
        Card[][] hands = new Card[playerCount][];
        
        for (int end = 0; end < playerCount; end++)
        {
            hands[end] = new Card[2];
            for (int pairPos = 0; pairPos < 2; pairPos++)
            {
                int position = rand.Next(0, _cards.Count);
                hands[end][pairPos] = _cards[position];
            }
        }

        return hands;
    }
}