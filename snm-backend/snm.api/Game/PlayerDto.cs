namespace snm.api.Game;

public record PlayerDto
{
    public required string Name { get; init; }
    public required Role Role { get; set; }
    public required bool IsMafia { get; init; }
    public required CardDto[] Hand { get; init; }
    public required bool Living { get; set; } 
    public required bool Jailed { get; set; }
}