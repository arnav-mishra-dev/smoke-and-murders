using System.ComponentModel.DataAnnotations;

namespace snm.api.Game;

public record GameSettingsDto
{
    public int MafiaCount { get; init; }
}