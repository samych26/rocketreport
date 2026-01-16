<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Domain\Entity\RefreshToken;
use App\Domain\Entity\User;
use App\Domain\Service\RefreshTokenGeneratorInterface;

class RefreshTokenGenerator implements RefreshTokenGeneratorInterface
{
    public function __construct(
        private readonly int $ttlDays = 7,
    ) {
    }

    public function generate(User $user): array
    {
        $rawToken = bin2hex(random_bytes(64));
        $hash = hash('sha256', $rawToken);

        $expiresAt = new \DateTimeImmutable(sprintf('+%d days', $this->ttlDays));

        $entity = new RefreshToken($user, $hash, $expiresAt);

        return [$entity, $rawToken];
    }
}

