using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using snm.api.Game;

namespace snm.api.Endpoints;

public class RoomManager
{
    private const string GameStartedNotif = "{\"type\":\"game-start\"}";
    
    private record RoomData
    {
        public string? OwnerId;
        public readonly GameManager GameManager = new();
        public readonly ConcurrentDictionary<string, WebSocket> Connections = new();
    }
    
    private readonly ConcurrentDictionary<string, RoomData> _rooms = new();
    
    // Handles initial user connection and maintaining room
    public async Task HandleGameConnections(WebSocket webSocket, string uid, string username, string roomCode)
    {
        byte[] receiveBuffer = new byte[1024];
        
        AddPlayer(webSocket, roomCode, uid, username);
        SetOwner(roomCode, uid);
        
        if (uid != GetOwnerId(roomCode))
            AddPlayer(webSocket, roomCode, uid, username);
        
        await webSocket.SendAsync(Encoding.UTF8.GetBytes(roomCode), WebSocketMessageType.Text, true, CancellationToken.None);
        await BroadcastAsync(roomCode, JsonSerializer.Serialize(GetPlayers(roomCode)));
        
        var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);
        while (!webSocket.CloseStatus.HasValue)
        {
            if (result.MessageType == WebSocketMessageType.Close) break;
            
            GameSettingsDto? gameSettings = JsonSerializer.Deserialize<GameSettingsDto>(new ArraySegment<byte>(receiveBuffer, 0, result.Count));
            if (gameSettings != null && uid == GetOwnerId(roomCode))
            {
                if (!_rooms[roomCode].GameManager.GameStarted && GetPlayers(roomCode).Count > 3)
                {
                    try
                    {
                        _ = Task.Run(() => RunGame(roomCode, gameSettings));
                    }
                    catch
                    {
                        throw new HttpRequestException("Invalid game settings");
                    }
                }
            }
            
            result = await webSocket.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);
        }
        
        // Cleanly close a connection and close the room if it's empty
        RemovePlayer(roomCode, uid);
        if (GetPlayers(roomCode).Count == 0) CloseRoom(roomCode);
        if (!_rooms[roomCode].GameManager.GetPlayers().ContainsKey(GetOwnerId(roomCode)))
            foreach(var connections in _rooms[roomCode].Connections)
            {
                _rooms[roomCode].OwnerId = connections.Key;
                break;
            }
        await BroadcastAsync(roomCode, JsonSerializer.Serialize(GetPlayers(roomCode)));
        WebSocketCloseStatus websocketCloseStatus = webSocket.CloseStatus ?? WebSocketCloseStatus.NormalClosure;
        string closeDescription = webSocket.CloseStatusDescription ?? "Closed abruptly";
        await webSocket.CloseAsync(websocketCloseStatus, closeDescription, CancellationToken.None);
    }

    // The main game loop runs here
    private async Task RunGame(string roomCode, GameSettingsDto gameSettings)
    {
        _rooms[roomCode].GameManager.InitializeGame(gameSettings);
        await BroadcastAsync(roomCode, GameStartedNotif);
    }
    
    private string GetOwnerId(string roomId)
    {
        string? owner = _rooms[roomId].OwnerId;
        
        if (owner == null)
            throw new HttpRequestException("Owner not found");
        
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
        
        await Task.WhenAll(tasks.ToArray());
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