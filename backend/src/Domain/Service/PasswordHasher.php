<?php

namespace App\Domain\Service;

interface PasswordHasher
{
    public function hash(string $plainPassword): string;

    public function verify(string $hashedPassword, string $plainPassword): bool;
}
