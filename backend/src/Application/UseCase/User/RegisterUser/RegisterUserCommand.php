<?php

namespace App\Application\UseCase\User\RegisterUser;

final class RegisterUserCommand
{
    public function __construct(
        public string $email,
        public string $password,
        public string $firstname,
        public string $lastname
    ) {}
}
