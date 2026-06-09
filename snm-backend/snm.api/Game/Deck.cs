using snm.api.DTOs;

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

    public void ResetDeck()
    {
        _cards.Clear();
        for (int s = 1; s <= 4; s++)
            for (int v = 1; v <= 13; v++)
                _cards.Add(new CardDto((CardSuit)s, (CardValue)v));
    }

    public CardDto DrawRandomCard()
    {
        int position = UniversalRandom.Rand.Next(0, _cards.Count);
        CardDto card = _cards[position];
        
        _cards.RemoveAt(position);
        
        return card;
    }
}