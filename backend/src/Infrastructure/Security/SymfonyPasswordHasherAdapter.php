<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Domain\Entity\User;
use App\Domain\Service\PasswordHasherInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class SymfonyPasswordHasherAdapter implements PasswordHasherInterface
{
    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function hash(string $plainPassword): string
    {
        // We create a temporary user instance just for hashing;
        // Symfony only needs the class to look up the hasher config.
        $user = new User(email: 'hash@example.com', password: '', name: 'hash');

        return $this->passwordHasher->hashPassword($user, $plainPassword);
    }

    public function isValid(User $user, string $plainPassword): bool
    {
        return $this->passwordHasher->isPasswordValid($user, $plainPassword);
    }
}

