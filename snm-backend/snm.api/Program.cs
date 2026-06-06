using snm.api.Game;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var api = app.MapGroup("/api");

List<string> playerNames = ["A", "b", "C", "D", "E"];

GameManager gameManager = new GameManager(playerNames, 3);

api.MapGet("/", () =>
{
});

app.Run();