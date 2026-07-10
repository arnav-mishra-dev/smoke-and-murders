using snm.api.Game;

namespace snm.api.DTOs;

public record CardDto
(
    CardSuit Suit,
    CardValue Value
);