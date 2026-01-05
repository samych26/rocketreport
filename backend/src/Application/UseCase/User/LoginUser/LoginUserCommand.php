<?php

namespace App\Application\UseCase\User\LoginUser;

final class LoginUserCommand
{
    public function __construct(
        public string $email,
        public string $password
    ) {}
}
