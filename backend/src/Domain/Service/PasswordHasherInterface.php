<?php

declare(strict_types=1);

namespace App\Domain\Service;

use App\Domain\Entity\User;

interface PasswordHasherInterface
{
    public function hash(string $plainPassword): string;

    public function isValid(User $user, string $plainPassword): bool;
}

