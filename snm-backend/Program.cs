using snm.api.Endpoints;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<RoomManager>();
var app = builder.Build();

string allowedOrigins = builder.Configuration["AllowedOrigins"] ?? "http://localhost:3000";
WebSocketOptions webSocketOptions = new()
{
    KeepAliveInterval = TimeSpan.FromSeconds(120)
};
webSocketOptions.AllowedOrigins.Add(allowedOrigins.Trim());
app.UseWebSockets(webSocketOptions);

app.SetupGameWebSockets();

await app.RunAsync();