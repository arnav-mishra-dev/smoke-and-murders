using System.Collections.Concurrent;
using snm.api.Game;

namespace snm.api.Endpoints;

public class RoomManager
{
    private readonly ConcurrentDictionary<string, GameManager> _rooms = new();

    public string GetOwnerId(string roomId)
    {
        return _rooms[roomId].OwnerId;
    }

    public void AddPlayer(string roomId, string uid, string username) =>
        _rooms[roomId].AddPlayer(uid, username);
    
    public Dictionary<string, string> GetPlayers(string roomId) =>
        _rooms[roomId].GetPlayers();
    
    public bool RoomExists(string room) =>
        _rooms.ContainsKey(room);

    public bool AddRoom(string roomId, string ownerId, string username)
    {
        if (_rooms.TryAdd(roomId, new GameManager(ownerId)))
        {
            _rooms[roomId].AddPlayer(ownerId, username);
            return true;
        }
        return false;
    }
    
    public void CloseRoom(string roomId) =>
        _rooms.TryRemove(roomId, out _);
}