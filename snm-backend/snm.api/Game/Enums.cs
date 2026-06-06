namespace snm.api.Game;

public enum CardSuit
{
    Spades = 1,
    Hearts = 2,
    Diamonds = 3,
    Clubs = 4
}

public enum CardValue
{
    Ace = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13,
}

public enum Stage
{
    Initial = 0,
    Flop = 1,
    Turn = 2,
    River = 3,
    Showdown = 4
}

public enum Role
{
    None = 0,
    Doctor = 1,
    Detective = 2,
    Mayor = 3,
    Jailer = 4,
    Vigilante = 5
}