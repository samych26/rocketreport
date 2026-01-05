<?php

namespace App\Domain\Repository;

use App\Domain\Entity\RefreshToken;
use App\Domain\ValueObject\RefreshTokenId;
use App\Domain\ValueObject\UserId;

interface RefreshTokenRepository
{
    public function save(RefreshToken $refreshToken): void;

    public function findById(RefreshTokenId $id): ?RefreshToken;

    public function findByToken(string $token): ?RefreshToken;
    
    public function revokeAllForUser(UserId $userId): void;

    public function delete(RefreshToken $refreshToken): void;
}
