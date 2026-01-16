<?php

declare(strict_types=1);

namespace App\Application\DTO\Request;

class RegisterUserRequest
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
        public readonly string $name,
    ) {
    }
}

