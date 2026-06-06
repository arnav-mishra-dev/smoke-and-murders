using System.Net.WebSockets;
using System.Text;
using snm.api.Game;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseWebSockets();

var api = app.MapGroup("/api");

api.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();

        await HandleGameConnections(webSocket);
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
    }
});

async Task HandleGameConnections(WebSocket webSocket)
{
    byte[] buffer = new byte[1024];
    var result = webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    
    while (!webSocket.CloseStatus.HasValue)
    {
        await webSocket.SendAsync("Received"u8.ToArray(), WebSocketMessageType.Text, true, CancellationToken.None);
        result = webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    }
    await webSocket.CloseAsync(webSocket.CloseStatus.Value, webSocket.CloseStatusDescription, CancellationToken.None);
}

await app.RunAsync();