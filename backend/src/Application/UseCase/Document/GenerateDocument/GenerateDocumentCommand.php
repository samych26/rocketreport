<?php

namespace App\Application\UseCase\Document\GenerateDocument;

final class GenerateDocumentCommand
{
    public function __construct(
        private string $templateId,
        private array $apiSourceIds,
        private string $outputFormat,
        private ?string $userId = null,
        private array $overrideData = []
    ) {}

    public function getTemplateId(): string
    {
        return $this->templateId;
    }

    public function getApiSourceIds(): array
    {
        return $this->apiSourceIds;
    }

    public function getOutputFormat(): string
    {
        return $this->outputFormat;
    }

    public function getUserId(): ?string
    {
        return $this->userId;
    }

    public function getOverrideData(): array
    {
        return $this->overrideData;
    }
}
