using snm.api.Cards;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var api = app.MapGroup("/api");

Deck deck = new Deck();

api.MapGet("/", () => deck.DealCards(5));

app.Run();