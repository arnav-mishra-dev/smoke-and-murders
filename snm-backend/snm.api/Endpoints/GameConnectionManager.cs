using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using snm.api.Game;

namespace snm.api.Endpoints;

public static class GameConnectionManager
{
    public static void SetupGameWebSockets(this WebApplication app)
    {
        var api = app.MapGroup("/api");

        api.Map("/ws", async (context) =>
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                string? username = context.Request.Query["username"];
                string? room = context.Request.Query["room"];
                
                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(room)) throw new HttpRequestException(StatusCodes.Status400BadRequest.ToString());
                
                WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                await HandleGameConnections(webSocket, username, room);
            }
            else
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        });
    }

    private static async Task HandleGameConnections(WebSocket webSocket, string username, string roomCode)
    {
        byte[] receiveBuffer = new byte[1024];
        string uid = Guid.NewGuid().ToString();
        
        while (!webSocket.CloseStatus.HasValue)
        {
            await webSocket.SendAsync(new ArraySegment<byte>([]), WebSocketMessageType.Text, true, CancellationToken.None);
            
            await webSocket.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);
        }
        await webSocket.CloseAsync(webSocket.CloseStatus.Value, webSocket.CloseStatusDescription, CancellationToken.None);
    }
}