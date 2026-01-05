<?php

namespace App\Application\UseCase\Document\GenerateDocument;

use App\Domain\Entity\DocumentGeneration;
use App\Domain\Repository\DocumentGenerationRepository;
use App\Domain\Repository\TemplateRepository;
use App\Domain\Repository\ApiSourceRepository;
use App\Domain\Service\DocumentGenerator;
use App\Domain\Service\ApiClient;
use App\Domain\ValueObject\DocumentGenerationId;
use App\Domain\ValueObject\TemplateId;
use App\Domain\ValueObject\ApiSourceId;
use App\Domain\ValueObject\UserId;
use App\Domain\Exception\TemplateNotFoundException;
use App\Domain\Exception\ApiSourceNotFoundException;

final class GenerateDocumentHandler
{
    public function __construct(
        private DocumentGenerationRepository $documentGenerationRepository,
        private TemplateRepository $templateRepository,
        private ApiSourceRepository $apiSourceRepository,
        private DocumentGenerator $documentGenerator,
        private ApiClient $apiClient,
        private \App\Domain\Service\AuditService $auditService
    ) {}

    public function handle(GenerateDocumentCommand $command): array
    {
        // 1. Fetch Template
        $templateId = TemplateId::fromString($command->getTemplateId());
        $template = $this->templateRepository->findById($templateId);
        if (!$template) {
            throw TemplateNotFoundException::fromId($command->getTemplateId());
        }

        // 2. Fetch data from API Sources
        $combinedData = $command->getOverrideData();
        foreach ($command->getApiSourceIds() as $sourceIdStr) {
            $sourceId = ApiSourceId::fromString($sourceIdStr);
            $source = $this->apiSourceRepository->findById($sourceId);
            if (!$source) {
                throw ApiSourceNotFoundException::fromId($sourceIdStr);
            }

            $sourceData = $this->apiClient->fetchData($source);
            $combinedData = array_merge($combinedData, $sourceData);
        }

        // 3. Generate Document
        try {
            $content = $this->documentGenerator->generate(
                $template,
                $combinedData,
                $command->getOutputFormat()
            );
            $status = 'COMPLETED';
        } catch (\Exception $e) {
            $content = '';
            $status = 'FAILED';
        }

        // 4. Log Generation
        $generation = new DocumentGeneration(
            DocumentGenerationId::generate(),
            $status,
            $command->getOutputFormat(),
            $command->getUserId() ? UserId::fromString($command->getUserId()) : null,
            $templateId,
            array_map(fn($id) => ApiSourceId::fromString($id), $command->getApiSourceIds())
        );

        $this->documentGenerationRepository->save($generation);

        $this->auditService->log(
            'GENERATE_DOCUMENT',
            'Template',
            $templateId->value(),
            sprintf('Document generated with format %s. Status: %s', $command->getOutputFormat(), $status),
            $command->getUserId() ? UserId::fromString($command->getUserId()) : null
        );

        return [
            'generationId' => $generation->id()->value(),
            'status' => $generation->status(),
            'content' => $content, // This might be base64 if binary
            'format' => $generation->outputFormat()
        ];
    }
}
