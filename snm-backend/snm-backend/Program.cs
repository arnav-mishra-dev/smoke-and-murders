var app = WebApplication.Create(args);

app.MapGet("/", () => "Test");

app.Run();