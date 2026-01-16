<?php

declare(strict_types=1);

namespace App\Application\DTO\Response;

class LoginResponse
{
    public function __construct(
        public readonly string $token,
        public readonly UserResponse $user,
    ) {
    }
}

