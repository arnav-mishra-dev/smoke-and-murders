using snm.api.Endpoints;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<RoomManager>();

var app = builder.Build();
app.UseWebSockets();

app.SetupGameWebSockets();

await app.RunAsync();