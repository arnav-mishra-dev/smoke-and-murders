namespace snm.api.Endpoints;

public sealed class RoomManagerService : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            Thread.Sleep(1000);
        }
        return Task.CompletedTask;
    }
}