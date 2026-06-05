namespace snm.api.Game;

public record PlayerDto
(
    string Name,
    Role Role,
    bool IsMafia,
    CardDto[] Hand,
    bool Living
);