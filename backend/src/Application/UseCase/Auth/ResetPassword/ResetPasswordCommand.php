<?php

namespace App\Application\UseCase\Auth\ResetPassword;

final class ResetPasswordCommand
{
    public function __construct(
        public string $token,
        public string $newPassword
    ) {}
}
