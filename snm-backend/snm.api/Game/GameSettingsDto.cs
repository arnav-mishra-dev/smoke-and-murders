using System.ComponentModel.DataAnnotations;

namespace snm.api.Game;

public record GameSettingsDto
{
    [Range(4, 20)]
    public required int PlayerCapacity { get; set; }
    
    public int MafiaCount { get; set; }
}