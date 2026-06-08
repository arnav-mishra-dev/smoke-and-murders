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
                string? room = context.Request.Query["room"];
                
                if (string.IsNullOrEmpty(username))
                    throw new HttpRequestException(StatusCodes.Status400BadRequest.ToString());
                
                if (room == null)
                {
                    do room = RandomNumberGenerator.GetHexString(6);
                    while (!roomManager.AddRoom(room, username));
                }
                else
                {
                    if (!roomManager.RoomExists(room))
                        throw new HttpRequestException(StatusCodes.Status404NotFound.ToString());
                }
                
                string uid = Guid.NewGuid().ToString();
                WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();

                await roomManager.HandleGameConnections(webSocket, uid, username, room);
            }
            else
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        });
    }
}