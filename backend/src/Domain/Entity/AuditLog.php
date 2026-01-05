<?php

namespace App\Domain\Entity;

use App\Domain\ValueObject\AuditLogId;
use App\Domain\ValueObject\UserId;
use DateTimeImmutable;

final class AuditLog
{
    private AuditLogId $id;
    private string $action;
    private string $entityType; // e.g., "User", "Template"
    private string $entityId;   // e.g., UUID string
    private DateTimeImmutable $timestamp;
    private string $details;
    private ?UserId $userId; // Optional, if action is performed by a user

    public function __construct(
        AuditLogId $id,
        string $action,
        string $entityType,
        string $entityId,
        string $details,
        ?UserId $userId = null,
        ?DateTimeImmutable $timestamp = null
    ) {
        $this->id = $id;
        $this->action = $action;
        $this->entityType = $entityType;
        $this->entityId = $entityId;
        $this->details = $details;
        $this->userId = $userId;
        $this->timestamp = $timestamp ?? new DateTimeImmutable();
    }

    public function id(): AuditLogId
    {
        return $this->id;
    }

    public function action(): string
    {
        return $this->action;
    }

    public function entityType(): string
    {
        return $this->entityType;
    }

    public function entityId(): string
    {
        return $this->entityId;
    }

    public function timestamp(): DateTimeImmutable
    {
        return $this->timestamp;
    }

    public function details(): string
    {
        return $this->details;
    }
    
    public function userId(): ?UserId
    {
        return $this->userId;
    }
}
