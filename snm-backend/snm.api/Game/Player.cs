namespace snm.api.Game;

public record Player
{
    public required string Name { get; init; }
    public required Role Role { get; set; }
    public bool IsMafia { get; set; }
    public required CardDto[] Hand { get; init; }
    public bool Jailed { get; set; }
    public bool Living { get; set; } 
}