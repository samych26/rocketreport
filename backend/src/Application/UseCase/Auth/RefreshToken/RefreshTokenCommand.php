<?php

namespace App\Application\UseCase\Auth\RefreshToken;

final class RefreshTokenCommand
{
    public function __construct(
        public string $refreshToken
    ) {}
}
