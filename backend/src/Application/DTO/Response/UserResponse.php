<?php

declare(strict_types=1);

namespace App\Application\DTO\Response;

use App\Domain\Entity\User;

class UserResponse
{
    public function __construct(
        public readonly string $id,
        public readonly string $email,
        public readonly string $name,
        public readonly array $roles,
        public readonly \DateTimeImmutable $createdAt,
        public readonly bool $emailVerified,
    ) {
    }

    public static function fromEntity(User $user): self
    {
        return new self(
            id: (string) $user->getId(),
            email: $user->getEmail(),
            name: $user->getName(),
            roles: $user->getRoles(),
            createdAt: $user->getCreatedAt(),
            emailVerified: $user->isEmailVerified(),
        );
    }
}

