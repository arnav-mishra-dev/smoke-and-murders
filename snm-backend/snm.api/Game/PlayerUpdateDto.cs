namespace snm.api.Game;

public record PlayerUpdateDto
(
    Role Role,
    bool Living,
    bool Jailed
);