<?php

namespace App\Application\UseCase\Auth\Logout;

final class LogoutCommand
{
    public function __construct(
        public string $refreshToken
    ) {}
}
