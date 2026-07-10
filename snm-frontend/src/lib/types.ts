export enum CardSuit
{
    Spades = 1,
    Hearts = 2,
    Diamonds = 3,
    Clubs = 4
}

export enum CardValue
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

export enum Role
{
    None = 0,
    Mayor = 1,
    Detective = 2,
    Doctor = 3,
    Jailer = 4,
    Vigilante = 5
}

export interface Card
{
    Suit: CardSuit,
    Value: CardValue
}

export enum Page
{
    Home = 1,
    Game = 2
}

export interface PlayerData
{
    [uid: string]: string
}