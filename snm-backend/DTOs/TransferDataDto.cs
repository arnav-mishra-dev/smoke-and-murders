using System.Text.Json;

namespace snm.api.DTOs;

public record TransferDataDto
{
    public required string Type { get; init; }
    public JsonElement Payload { get; init; }
}