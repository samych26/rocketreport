<?php

namespace App\Application\UseCase\Auth\ResetPassword;

final class RequestResetCommand
{
    public function __construct(
        public string $email
    ) {}
}
