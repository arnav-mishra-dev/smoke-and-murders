using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using snm.api.DTOs;
using snm.api.Game;

namespace snm.api.Endpoints;

public class RoomManager
{
    private record RoomData
    {
        public string? OwnerId;
        public readonly GameManager GameManager = new();
        public readonly ConcurrentDictionary<string, WebSocket> Connections = new();
    }
    
    private readonly ConcurrentDictionary<string, RoomData> _rooms = new();
    private readonly ConcurrentQueue<(string uid, TransferDataDto data)> _actions = new();
    
    // Handles initial user connection and maintaining room
    public async Task HandleGameConnections(WebSocket webSocket, string uid, string username, string roomCode, bool isHost)
    {
        byte[] receiveBuffer = new byte[512];
        
        AddPlayer(webSocket, roomCode, uid, username);
        
        if (isHost)
            SetOwner(roomCode, uid);

        var roomCodeJson = new
        {
            Type = "room-code",
            Payload = roomCode,
        };
        await webSocket.SendAsync(JsonSerializer.SerializeToUtf8Bytes(roomCodeJson), WebSocketMessageType.Text, true, CancellationToken.None);
        var playerList = new
        {
            Type = "player-list",
            Payload = GetPlayers(roomCode)
        };
        await BroadcastAsync(roomCode, JsonSerializer.Serialize(playerList));
        
        var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);
        while (!webSocket.CloseStatus.HasValue)
        {
            if (result.MessageType == WebSocketMessageType.Close) break;
            try
            {
                TransferDataDto? transferData =
                    JsonSerializer.Deserialize<TransferDataDto>(Encoding.UTF8.GetString(receiveBuffer, 0, result.Count));
                if (transferData != null)
                {
                    Console.WriteLine($"Sent message {transferData.Type}");
                    switch (transferData.Type)
                    {
                        case "game-settings":
                            GameSettingsDto? gameSettings = transferData.Payload.Deserialize<GameSettingsDto>();
                            Console.WriteLine("Deserialized game settings");
                            Console.WriteLine(gameSettings);
                            if (gameSettings != null
                                && isHost
                                && !_rooms[roomCode].GameManager.GameStarted
                                && GetPlayers(roomCode).Count > 3)
                            {
                                Console.WriteLine("Game settings conditions are met");
                                try
                                {
                                    var settings = gameSettings;
                                    _ = Task.Run(() => RunGame(roomCode, settings));
                                }
                                catch
                                {
                                    Console.WriteLine("Invalid game settings");
                                }
                            }

                            break;

                        case "target":
                            if (_rooms[roomCode].GameManager.IsNightfall)
                                if (_actions.All(p => p.uid != uid))
                                    _actions.Enqueue((uid, transferData));
                            break;

                        case "vote":
                            if (!_rooms[roomCode].GameManager.IsNightfall)
                                if (_actions.All(p => p.uid != uid))
                                    _actions.Enqueue((uid, transferData));
                            break;
                    }
                }
                else
                {
                    Console.WriteLine("Received null value");
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error: {e.Message}");
            }

            result = await webSocket.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);
        }
        
        // Cleanly close a connection and close the room if it's empty
        RemovePlayer(roomCode, uid);
        if (GetPlayers(roomCode).Count == 0) CloseRoom(roomCode);
        else if (!_rooms[roomCode].GameManager.GetPlayers().ContainsKey(GetOwnerId(roomCode)))
        {
            foreach (var connections in _rooms[roomCode].Connections)
            {
                _rooms[roomCode].OwnerId = connections.Key;
                break;
            }
            await BroadcastAsync(roomCode, JsonSerializer.Serialize(GetPlayers(roomCode)));
        }
        WebSocketCloseStatus websocketCloseStatus = webSocket.CloseStatus ?? WebSocketCloseStatus.NormalClosure;
        string closeDescription = webSocket.CloseStatusDescription ?? "Closed abruptly";
        await webSocket.CloseAsync(websocketCloseStatus, closeDescription, CancellationToken.None);
    }

    // The main game loop runs here
    private async Task RunGame(string roomCode, GameSettingsDto gameSettings)
    {
        // Initialize game
        _rooms[roomCode].GameManager.InitializeGame(gameSettings);
        await BroadcastAsync(roomCode, JsonSerializer.Serialize(new { Type = "start-game", Payload = "" }));
        while (true)
        {
            if (gameSettings.MafiaCount <= _rooms[roomCode].GameManager.LivingPlayerCount() / 4) break;
            
            // Deal nighttime cards
            _rooms[roomCode].GameManager.DealNightCards();
            var communityCards = new
            {
                Type = "community-cards",
                Payload = _rooms[roomCode].GameManager.GetCommunityCards()
            };
            await BroadcastAsync(roomCode, JsonSerializer.Serialize(communityCards));

            // Send hand details to players
            List<Task> handOut = new List<Task>();
            foreach (var connection in _rooms[roomCode].Connections)
            {
                CardDto[] hand = _rooms[roomCode].GameManager.GetPlayerData(connection.Key).Hand;
                var payload = new
                {
                    Type = "card-hand",
                    Payload = hand
                };
                string message = JsonSerializer.Serialize(payload);
                handOut.Add(SendMessageToConnectionAsync(connection.Value, message));
            }
            await Task.WhenAll(handOut);

            foreach (var connection in _rooms[roomCode].Connections)
            {
                var roleMessage = new
                {
                    Type = "role-message",
                    Payload = new
                    {
                        _rooms[roomCode].GameManager.GetPlayerData(connection.Key).IsMafia,
                        _rooms[roomCode].GameManager.GetPlayerData(connection.Key).Role
                    }
                };
                await SendMessageToConnectionAsync(connection.Value, JsonSerializer.Serialize(roleMessage));
            }

            // Nightfall
            Dictionary<Role, List<string>> roleActions = new Dictionary<Role, List<string>>();
            List<string> mafiaTargets = new List<string>();

            _actions.Clear();
            int turnCountdown = gameSettings.TurnPlayTime;
            while (true)
            {
                if (turnCountdown <= 0 || _actions.Count == _rooms[roomCode].GameManager.TurnTakerCount) break;

                //Timer
                await Task.Delay(1000);
                turnCountdown--;
                if (turnCountdown <= 0) break;
                await BroadcastAsync(roomCode,
                    JsonSerializer.Serialize(new { Type = "time", Payload = turnCountdown }));
            }

            foreach (Role role in Enum.GetValues(typeof(Role)))
                roleActions.Add(role, new List<string>());
            while (_actions.TryDequeue(out var action))
            {
                if (action.data.Type == "target")
                {
                    string? targetUid = action.data.Payload.Deserialize<string>();
                    if (targetUid == null) break;
                    if (_rooms[roomCode].GameManager.GetPlayerData(action.uid).IsMafia)
                    {
                        mafiaTargets.Add(targetUid);
                    }
                    else
                    {
                        Role targeterRole = _rooms[roomCode].GameManager.GetPlayerData(action.uid).Role;
                        roleActions[targeterRole].Add(targetUid);
                    }
                }
            }

            var playerStatusUpdates = new
            {
                Type = "death-updates",
                Payload = _rooms[roomCode].GameManager.UpdatePlayerActions(mafiaTargets, roleActions)
            };
            
            await BroadcastAsync(roomCode, JsonSerializer.Serialize(playerStatusUpdates));
            Console.WriteLine("Broadcasted night deaths");

            // Daytime
            Dictionary<string, int> votes = new Dictionary<string, int>();
            foreach (string playerId in _rooms[roomCode].GameManager.GetPlayers().Keys)
                votes.Add(playerId, 0);
            votes.Add("skip", 0);

            _actions.Clear();
            int voteCountdown = gameSettings.VoteTime;
            while (true)
            {
                if (voteCountdown <= 0 || _actions.Count == _rooms[roomCode].GameManager.LivingPlayerCount()) break;

                //Timer
                await Task.Delay(1000);
                voteCountdown--;
                if (voteCountdown <= 0) break;
                await BroadcastAsync(roomCode,
                    JsonSerializer.Serialize(new { Type = "time", Payload = voteCountdown }));
            }
            
            while (_actions.TryDequeue(out var action))
            {
                string? voteUid = action.data.Payload.Deserialize<string>();
                if (voteUid == null) break;
                if (action.data.Type == "vote")
                    if (votes.ContainsKey(voteUid) || voteUid == "skip")
                        votes[voteUid]++;
            }

            int tiedGreatest = 0;
            int largestVote = 0;
            string? greatestValue = null;
            foreach (var vote in votes)
            {
                greatestValue ??= vote.Key;
                if (vote.Value == largestVote) tiedGreatest++;
                if (vote.Value > largestVote)
                {
                    largestVote = vote.Value;
                    greatestValue = vote.Key;
                    tiedGreatest = 0;
                }
            }

            if (greatestValue != "skip" && tiedGreatest == 0 && largestVote > 0 && greatestValue != null)
            {
                _rooms[roomCode].GameManager.KillPlayer(greatestValue);
                Dictionary<string, bool> votedPlayer = new() { { greatestValue, false } };
                var voteUpdate = new
                {
                    Type = "death-updates",
                    Payload = votedPlayer
                };
                await BroadcastAsync(roomCode, JsonSerializer.Serialize(voteUpdate));
            }
            
            var endRoundMessage = new
            {
                Type = "round-over",
                Payload = ""
            };
            await BroadcastAsync(roomCode, JsonSerializer.Serialize(endRoundMessage));
        }
        
        var endGameMessage = new
        {
            Type = "game-over",
            Payload = ""
        };
        await BroadcastAsync(roomCode, JsonSerializer.Serialize(endGameMessage));
        _rooms[roomCode].GameManager.ResetGameState();
    }
    
    private string GetOwnerId(string roomId)
    {
        string? owner = _rooms[roomId].OwnerId;
        
        if (owner == null)
        {
            Console.WriteLine("Owner not found");
            return  string.Empty;
        }
        
        return owner;
    }

    private void AddPlayer(WebSocket webSocket, string roomId, string uid, string username)
    {
        _rooms[roomId].GameManager.AddPlayer(uid, username);
        _rooms[roomId].Connections.TryAdd(uid, webSocket);
    }

    private void RemovePlayer(string roomId, string uid)
    {
        _rooms[roomId].GameManager.RemovePlayer(uid);
        _rooms[roomId].Connections.TryRemove(uid, out _);
        
        _ = BroadcastAsync(roomId, JsonSerializer.Serialize(GetPlayers(roomId)));
    }
    
    private Dictionary<string, string> GetPlayers(string roomId) =>
        _rooms[roomId].GameManager.GetPlayers();
    
    public bool RoomExists(string room) =>
        _rooms.ContainsKey(room);

    public bool AddRoom(string roomId, string username) =>
        _rooms.TryAdd(roomId, new RoomData());

    public void SetOwner(string roomId, string uid) =>
        _rooms[roomId].OwnerId = uid;
    
    private void CloseRoom(string roomId)
    {
        foreach (string player in _rooms[roomId].Connections.Keys)
            _rooms[roomId].Connections.TryRemove(player, out _);
        _rooms.TryRemove(roomId, out _);
    }

    private async Task BroadcastAsync(string roomId, string message)
    {
        List<Task> tasks = new List<Task>();
        
        foreach (var connection in _rooms[roomId].Connections.Values)
            if (!connection.CloseStatus.HasValue)
                tasks.Add(SendMessageToConnectionAsync(connection, message));
        
        await Task.WhenAll(tasks);
    }
    
    private static async Task SendMessageToConnectionAsync(WebSocket webSocket, string message)
    {
        try
        {
            var bytes = Encoding.UTF8.GetBytes(message);
            await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending message: {ex.Message}");
        }
    }
}