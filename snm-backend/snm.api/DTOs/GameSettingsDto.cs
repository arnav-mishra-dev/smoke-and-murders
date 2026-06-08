namespace snm.api.DTOs;

public record GameSettingsDto
{
    public int MafiaCount { get; init; }
    public int TurnPlayTime { get; init; }
    public int VoteTime { get; init; }
}