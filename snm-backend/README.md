# API
This API is used to handle the backend of Smoke and Murders. It runs on websockets.

All data sent between the client and the server is in the following format:
```json
{
  "Type": "string-here",
  "Payload": {
    "key-1": "value-1",
    "key-2": "value-2"
  }
}
```
The payload key can consist of data in the form of a string or a JSON object.

## Joining and creating rooms
Rooms can be created by joining a websocket with the following queries:

`ws://[ip-address]:[port]/api/ws?username=[host-username]`

On creation, you will receive data with the "Type" "room-code" and the "Payload" value is the room code string.
Players can join a room by adding the 'room' query.

`ws://[ip-address]:[port]/api/ws?username=[player-username]&room=[room-code]`

This returns the room code value again, along with the list of players in the form:
```json
{
  "Type": "player-list",
  "Payload": {
    "[player-1-uuid]": "[player-1-name]",
    "[player-2-uuid]": "[player-2-name]"
  }
}
```
Every time a new player joins, the list is resent to the player.

*Note: This list includes the player themselves too. The host also receives this list with a single value on room creation*

## Starting a game
The game has to be started by the host. This is done by sending 3 values in the payload with the type "game-settings".
The values are: MafiaCount, TurnPlayTime, VoteTime.
```json
{
  "Type": "game-settings",
  "Payload": {
    "MafiaCount": [integer less than or equal to a quarter of the players in the game],
    "TurnPlayTime": [max time in seconds for all players to take their nightfall turns],
    "VoteTime": [max time in seconds for all players to vote]
  }
}
```

## Gameplay
On game start, everyone receives a message with "Type": "start-game" and the "Payload" is an empty string "".

A message of "Type": "card-hand" with the "Payload" being a 2 element array of cards is sent to each player. This is their hand for the rest of the game.

A card is represented as JSON with integers as the "Suit" and "Value". The suits are spades, hearts, diamonds and clubs going from 1 to 4 in that order, while values go from the ace to the king, 1 to 13.

The following stages repeat until either the mafia count is less than a quarter of the player count, or all mafias are executed.

- Write stages here later