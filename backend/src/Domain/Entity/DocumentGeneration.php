<?php

namespace App\Domain\Entity;

use App\Domain\ValueObject\DocumentGenerationId;
use App\Domain\ValueObject\UserId;
use App\Domain\ValueObject\TemplateId;
use App\Domain\ValueObject\ApiSourceId;
use DateTimeImmutable;

final class DocumentGeneration
{
    private DocumentGenerationId $id;
    private string $status; // e.g., "PENDING", "COMPLETED", "FAILED"
    private string $outputFormat; // e.g. "PDF", "DOCX"
    private DateTimeImmutable $createdAt;
    
    // Relations
    private ?UserId $userId;
    private ?TemplateId $templateId;
    private ?array $apiSourceIds; // Can use multiple sources? Diagram says "use 0..* ApiSource"

    public function __construct(
        DocumentGenerationId $id,
        string $status,
        string $outputFormat,
        ?UserId $userId = null,
        ?TemplateId $templateId = null,
        array $apiSourceIds = [],
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->id = $id;
        $this->status = $status;
        $this->outputFormat = $outputFormat;
        $this->userId = $userId;
        $this->templateId = $templateId;
        $this->apiSourceIds = $apiSourceIds; // List of ApiSourceId
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function id(): DocumentGenerationId
    {
        return $this->id;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function outputFormat(): string
    {
        return $this->outputFormat;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
    
    public function userId(): ?UserId
    {
        return $this->userId;
    }

    public function templateId(): ?TemplateId
    {
        return $this->templateId;
    }

    /** @return ApiSourceId[] */
    public function apiSourceIds(): array
    {
        return $this->apiSourceIds;
    }
}
