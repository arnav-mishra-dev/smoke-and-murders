using snm.api.Endpoints;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<RoomManager>();
var app = builder.Build();

WebSocketOptions webSocketOptions = new()
{
    KeepAliveInterval = TimeSpan.FromSeconds(120)
};
string? allowedOriginsEnv = builder.Configuration["AllowedOrigins"];
if (string.IsNullOrWhiteSpace(allowedOriginsEnv)) throw new InvalidOperationException("Do not attempt to start the server without an AllowedOrigins environment variable.");

string[] allowedOrigins = allowedOriginsEnv.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
foreach(string origin in allowedOrigins)
{
    webSocketOptions.AllowedOrigins.Add(origin);
}
app.UseWebSockets(webSocketOptions);
app.SetupGameWebSockets();

await app.RunAsync();