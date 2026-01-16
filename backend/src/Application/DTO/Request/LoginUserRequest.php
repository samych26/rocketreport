<?php

declare(strict_types=1);

namespace App\Application\DTO\Request;

class LoginUserRequest
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
    ) {
    }
}

