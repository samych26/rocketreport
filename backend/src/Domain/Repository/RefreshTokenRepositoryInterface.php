<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\RefreshToken;
use App\Domain\Entity\User;

interface RefreshTokenRepositoryInterface
{
    public function save(RefreshToken $token): void;

    public function findValidToken(string $tokenHash): ?RefreshToken;

    public function revokeAllForUser(User $user): void;
}

