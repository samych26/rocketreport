<?php

namespace App\Domain\Entity;

use App\Domain\ValueObject\RefreshTokenId;
use App\Domain\ValueObject\UserId;
use DateTimeImmutable;

final class RefreshToken
{
    private RefreshTokenId $id;
    private UserId $userId;
    private string $token;
    private DateTimeImmutable $expiresAt;
    private bool $revoked;

    public function __construct(
        RefreshTokenId $id,
        UserId $userId,
        string $token,
        DateTimeImmutable $expiresAt,
        bool $revoked = false
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->token = $token;
        $this->expiresAt = $expiresAt;
        $this->revoked = $revoked;
    }

    public function id(): RefreshTokenId
    {
        return $this->id;
    }

    public function userId(): UserId
    {
        return $this->userId;
    }

    public function token(): string
    {
        return $this->token;
    }

    public function expiresAt(): DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function revoked(): bool
    {
        return $this->revoked;
    }

    public function revoke(): void
    {
        $this->revoked = true;
    }
}
