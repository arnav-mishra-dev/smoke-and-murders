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
Every time a new player joins or leaves (even mid game), the list is resent to the players.

*Note: This list includes the player themselves too. The host also receives this list with a single value on room creation*

If the host leaves at any time, a new host is assigned if the room isn't empty. The message broadcasted to players is in the following form:
```json
{
  "Type": "new-host",
  "Payload": "[new-host-id]"
}
```
This message is also broadcasted after player-list upon joining.

## Starting a game
The game has to be started by the host. This is done by sending 3 values in the payload with the type "game-settings".
The values are: MafiaCount, TurnPlayTime, VoteTime.
```json
{
  "Type": "game-settings",
  "Payload": {
    "MafiaCount": "[integer less than or equal to a quarter of the players in the game]",
    "TurnPlayTime": "[max time in seconds for all players to take their nightfall turns]",
    "VoteTime": "[max time in seconds for all players to vote]"
  }
}
```
## Messaging
A message of type "message" with a string payload can be sent at any point except for nightfall.
```json
{
  "Type": "message",
  "Payload": "This is my message"
}
```
This exact message is broadcasted to all players in the same format.

## Gameplay
A card DTO (data transfer object) is represented as JSON with integers as the "Suit" and "Value". The suits are spades, hearts, diamonds and clubs going from 1 to 4 in that order, while values go from the ace to the king, 1 to 13.

On game start,
* Everyone receives a message with "Type": "start-game" and the "Payload" is an empty string "".
* A message of "Type": "mafia-state" with the "Payload" being an "IsMafia" key with a boolean value is sent to each player.
* A message of "Type": "card-hand" with the "Payload" being a 2 element array of cards is sent to each player. This is their hand for the rest of the game.

The following stages repeat until either the mafia count is less than a quarter of the player count, or all mafias are
executed.

1. "Type": "community-cards" with a Payload of an array of cards is broadcasted to all players. This value is empty in the first round.
2. Every player receives a "role-message" with the payload having an integral Role value.
3. Nightfall starts, and every second, every player receives a message of type "time" and with an integer of the remaining time left.
4. During nightfall, each turn-taking player must send a message of type "target" and with the payload being the target's uid.
5. Message type "death-updates" is broadcasted.
6. Message type "jailed" is broadcasted to appropriate players.
7. Daytime immediately begins, and the same time message type sends time remaining every second.
8. Each living player must send a "vote" type message. The payload is the target uid. Mayor votes count for two and jailed player votes are not accepted. *the vote goes to skipping the voting round if the payload is "skip"*
9. "death-updates" with the voted out player's uid as the only item is broadcasted as the payload if not skipped.
10. Message type "round-over" with an empty string payload is broadcasted and the cycle repeats.

A "game-over" message is broadcasted. The "Payload" has two keys:
* "Winner" with value "civilians" or "mafias"
* "WinnerList" containing a list of key-values in the form `[uid]: [name]`

The game can then be restarted by sending another "game-settings" message.