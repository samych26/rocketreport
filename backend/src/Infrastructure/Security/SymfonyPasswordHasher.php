<?php

namespace App\Infrastructure\Security;

use App\Domain\Service\PasswordHasher;
use Symfony\Component\PasswordHasher\Hasher\NativePasswordHasher;

final class SymfonyPasswordHasher implements PasswordHasher
{
    private NativePasswordHasher $hasher;

    public function __construct()
    {
        $this->hasher = new NativePasswordHasher();
    }

    public function hash(string $plainPassword): string
    {
        return $this->hasher->hash($plainPassword);
    }

    public function verify(string $hashedPassword, string $plainPassword): bool
    {
        return $this->hasher->verify($hashedPassword, $plainPassword);
    }
}
