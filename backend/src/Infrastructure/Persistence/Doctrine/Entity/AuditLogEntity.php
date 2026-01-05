<?php

namespace App\Infrastructure\Persistence\Doctrine\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: "audit_logs")]
class AuditLogEntity
{
    #[ORM\Id]
    #[ORM\Column(type: "uuid")]
    private string $id;

    #[ORM\Column]
    private string $action;

    #[ORM\Column]
    private string $entityType;

    #[ORM\Column]
    private string $entityId;

    #[ORM\Column(type: "text")]
    private string $details;

    #[ORM\Column(type: "datetime_immutable")]
    private \DateTimeImmutable $timestamp;

    #[ORM\Column(type: "uuid", nullable: true)]
    private ?string $userId = null;

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string $id): void
    {
        $this->id = $id;
    }

    public function getAction(): string
    {
        return $this->action;
    }

    public function setAction(string $action): void
    {
        $this->action = $action;
    }

    public function getEntityType(): string
    {
        return $this->entityType;
    }

    public function setEntityType(string $entityType): void
    {
        $this->entityType = $entityType;
    }

    public function getEntityId(): string
    {
        return $this->entityId;
    }

    public function setEntityId(string $entityId): void
    {
        $this->entityId = $entityId;
    }

    public function getDetails(): string
    {
        return $this->details;
    }

    public function setDetails(string $details): void
    {
        $this->details = $details;
    }

    public function getTimestamp(): \DateTimeImmutable
    {
        return $this->timestamp;
    }

    public function setTimestamp(\DateTimeImmutable $timestamp): void
    {
        $this->timestamp = $timestamp;
    }

    public function getUserId(): ?string
    {
        return $this->userId;
    }

    public function setUserId(?string $userId): void
    {
        $this->userId = $userId;
    }
}
