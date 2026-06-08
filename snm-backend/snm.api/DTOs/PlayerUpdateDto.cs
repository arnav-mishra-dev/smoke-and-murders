using snm.api.Game;

namespace snm.api.DTOs;

public record PlayerUpdateDto
(
    Role Role,
    bool Living,
    bool Jailed
);