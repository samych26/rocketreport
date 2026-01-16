<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\CodeProcessor;
use App\Domain\Entity\Document;
use App\Domain\Repository\CodeProcessorRepositoryInterface;

final class CodeProcessorService
{
    public function __construct(
        private CodeProcessorRepositoryInterface $codeProcessorRepository,
    ) {}

    /**
     * Crée un nouveau code processor
     */
    public function createCodeProcessor(
        Document $document,
        string $code,
        ?string $description = null,
    ): CodeProcessor {
        $codeProcessor = new CodeProcessor($document, $code);
        
        if ($description !== null) {
            $codeProcessor->setDescription($description);
        }

        $this->codeProcessorRepository->save($codeProcessor);

        return $codeProcessor;
    }

    /**
     * Met à jour un code processor
     */
    public function updateCodeProcessor(CodeProcessor $codeProcessor, array $data): CodeProcessor
    {
        if (isset($data['code'])) {
            $codeProcessor->setCode($data['code']);
        }
        if (isset($data['description'])) {
            $codeProcessor->setDescription($data['description']);
        }
        if (isset($data['status'])) {
            $codeProcessor->setStatus($data['status']);
        }

        $this->codeProcessorRepository->save($codeProcessor);

        return $codeProcessor;
    }

    /**
     * Récupère le code processor d'un document
     */
    public function getCodeProcessorByDocument(Document $document): ?CodeProcessor
    {
        return $this->codeProcessorRepository->findByDocument($document);
    }

    /**
     * Récupère un code processor par ID
     */
    public function getCodeProcessor(int $id): ?CodeProcessor
    {
        return $this->codeProcessorRepository->findById($id);
    }

    /**
     * Supprime un code processor
     */
    public function deleteCodeProcessor(CodeProcessor $codeProcessor): void
    {
        $this->codeProcessorRepository->delete($codeProcessor);
    }
}
