using snm.api.Game;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var api = app.MapGroup("/api");

api.MapGet("/", () => "Hello World!");

app.Run();