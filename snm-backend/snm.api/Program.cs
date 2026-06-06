using System.Net.WebSockets;
using System.Text;
using snm.api.Game;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseWebSockets();

var api = app.MapGroup("/api");

api.Map("/ws", async (context) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("Client connected");
        
        while (true)
        {
            const string message = "web socket test";
            byte[] messageBytes = Encoding.UTF8.GetBytes(message);
            ArraySegment<Byte> segment = new ArraySegment<byte>(messageBytes, 0, messageBytes.Length);
            await webSocket.SendAsync(
                segment,
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
            if (webSocket.State is WebSocketState.Closed or WebSocketState.Aborted) break;
            Thread.Sleep(1000);
        }
        Console.WriteLine("Client disconnected");
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
    }
});

await app.RunAsync();