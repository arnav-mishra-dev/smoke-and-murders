using System.Net.WebSockets;
using System.Security.Cryptography;

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
                string? roomCode = context.Request.Query["room"];
                bool isHost = false;
                
                if (string.IsNullOrEmpty(username))
                    throw new HttpRequestException(StatusCodes.Status400BadRequest.ToString());
                
                if (roomCode == null)
                {
                    do roomCode = RandomNumberGenerator.GetHexString(6);
                    while (!roomManager.AddRoom(roomCode, username));
                    isHost = true;
                }
                else
                {
                    if (!roomManager.RoomExists(roomCode))
                        throw new HttpRequestException(StatusCodes.Status404NotFound.ToString());
                }
                
                string uid = Guid.NewGuid().ToString();
                WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();

                await roomManager.HandleGameConnections(webSocket, uid, username, roomCode, isHost);
            }
            else
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        });
    }
}