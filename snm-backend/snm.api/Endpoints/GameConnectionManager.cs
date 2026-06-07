using System.Net.WebSockets;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using snm.api.Game;

namespace snm.api.Endpoints;

public static class GameConnectionManager
{
    public static void SetupGameWebSockets(this WebApplication app)
    {
        var api = app.MapGroup("/api");

        api.Map("/ws", async (HttpContext context, RoomManager roomManager) =>
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                string? username = context.Request.Query["username"];
                string? room = context.Request.Query["room"];
                
                if (string.IsNullOrEmpty(username))
                    throw new HttpRequestException(StatusCodes.Status400BadRequest.ToString());
                
                string uid = Guid.NewGuid().ToString();

                if (room == null)
                {
                    do room = RandomNumberGenerator.GetHexString(6);
                    while (!roomManager.AddRoom(room, uid, username));
                }
                
                if (!roomManager.RoomExists(room))
                    throw new HttpRequestException(StatusCodes.Status404NotFound.ToString());
                
                WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                await HandleGameConnections(webSocket, roomManager, uid, username, room);
            }
            else
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        });
    }

    private static async Task HandleGameConnections(WebSocket webSocket, RoomManager roomManager, string uid, string username, string roomCode)
    {
        byte[] receiveBuffer = new byte[1024];
        
        byte[] playerList = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(roomManager.GetPlayers(roomCode)));
        await webSocket.SendAsync(new ArraySegment<byte>(playerList), WebSocketMessageType.Text, true, CancellationToken.None);
        
        while (!webSocket.CloseStatus.HasValue)
        {
            if (uid != roomManager.GetOwnerId(roomCode))
            {
                roomManager.AddPlayer(roomCode, uid, username);
            }
            
            await webSocket.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);
        }
        await webSocket.CloseAsync(webSocket.CloseStatus.Value, webSocket.CloseStatusDescription, CancellationToken.None);
    }
}