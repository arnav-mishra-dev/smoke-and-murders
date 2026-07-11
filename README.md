# Smoke and murders
Smoke and murders is a simple card game I made based on poker and mafia.

## Requirements
- git
- Docker

## Usage
1. Clone the repository: `git clone git@github.com:arnav-mishra-dev/smoke-and-murders.git`

2. Navigate to the cloned directory `cd smoke-and-murders`

3. Configure your `.env` file as a sibling of `docker-compose.yml`. Use the `.env.example` file as a reference.

4. Run `docker compose up` to start up the container.

5. Your server is up and ready to be connected to.

## Game
The game is won when all mafias are removed, or the amount of mafias is equal to the amount of civilians.

The game has two stages: nightfall and daytime. Players perform their role actions during nightfall and vote during daytime.

Community cards are handed out at the start of nightfall. No cards in the first round, 3 cards in the second, then one card each round up to a maximum of 5.

Every player's role is based on their highest current hand. The roles assigned based on your hand are listed below.
#### Mayor - Vote counts as 2
- One pair - A pair of cards with the same rank
#### Detective - Finds out whether a target is a mafia at the end of nightfall 
- Two pairs - Two pairs of cards with the same rank
#### Doctor - Prevents a target from dying during nightfall
- Straight - 5 cards of consecutive ranks (an ace can be higher than a king or lower than a 2)
- Three of a kind - Three cards with the same rank
#### Jailer - Stops a target from performing their action the next nightfall
- Flush - 5 cards of the same suit
#### Vigilante - A non-mafia that can choose to kill any player
- Full house - A Three of a kind and a pair
- Four of a kind - 5 cards with the same rank
- Straight Flush - 5 cards of the same suit and consecutive rank (an ace can be higher than a king or lower than a 2)

## Start playing
A player sets their username and presses the "Create room" button to create a new room. The room code is displayed on screen and they are made the host of this room.

The other players can use this code to join the room by clicking on the "Join room" button.