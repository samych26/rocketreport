<?php

namespace App\Infrastructure\Persistence\Doctrine\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: "document_generations")]
class DocumentGenerationEntity
{
    #[ORM\Id]
    #[ORM\Column(type: "uuid")]
    private string $id;

    #[ORM\Column]
    private string $status;

    #[ORM\Column]
    private string $outputFormat;

    #[ORM\Column(type: "datetime_immutable")]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: "uuid", nullable: true)]
    private ?string $userId = null;

    #[ORM\Column(type: "uuid", nullable: true)]
    private ?string $templateId = null;

    #[ORM\Column(type: "json")]
    private array $apiSourceIds = [];

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string $id): void
    {
        $this->id = $id;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    public function getOutputFormat(): string
    {
        return $this->outputFormat;
    }

    public function setOutputFormat(string $outputFormat): void
    {
        $this->outputFormat = $outputFormat;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUserId(): ?string
    {
        return $this->userId;
    }

    public function setUserId(?string $userId): void
    {
        $this->userId = $userId;
    }

    public function getTemplateId(): ?string
    {
        return $this->templateId;
    }

    public function setTemplateId(?string $templateId): void
    {
        $this->templateId = $templateId;
    }

    public function getApiSourceIds(): array
    {
        return $this->apiSourceIds;
    }

    public function setApiSourceIds(array $apiSourceIds): void
    {
        $this->apiSourceIds = $apiSourceIds;
    }
}
