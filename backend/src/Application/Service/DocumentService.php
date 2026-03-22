<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\Document;
use App\Domain\Entity\ApiSource;
use App\Domain\Entity\ApiEndpoint;
use App\Domain\Entity\User;
use App\Domain\Repository\DocumentRepositoryInterface;

final class DocumentService
{
    public function __construct(
        private DocumentRepositoryInterface $documentRepository,
    ) {}

    /**
     * Crée un nouveau document
     */
    public function createDocument(
        User $user,
        ApiSource $apiSource,
        ApiEndpoint $apiEndpoint,
        string $name
    ): Document {
        $document = new Document($user, $apiSource, $apiEndpoint, $name);

        $this->documentRepository->save($document);

        return $document;
    }

    /**
     * Met à jour un document
     */
    public function updateDocument(Document $document, array $data): Document
    {
        if (isset($data['name'])) {
            $document->setName($data['name']);
        }
        if (isset($data['description'])) {
            $document->setDescription($data['description']);
        }
        if (isset($data['api_endpoint'])) {
            $document->setApiEndpoint($data['api_endpoint']);
        }
        if (isset($data['status'])) {
            $document->setStatus($data['status']);
        }

        $this->documentRepository->save($document);

        return $document;
    }

    /**
     * Récupère les documents d'un utilisateur
     */
    public function getDocumentsByUser(User $user): array
    {
        return $this->documentRepository->findByUser($user);
    }

    /**
     * Récupère un document spécifique
     */
    public function getDocument(int $id, User $user): ?Document
    {
        return $this->documentRepository->findByIdAndUser($id, $user);
    }

    /**
     * Récupère les documents d'une source API
     */
    public function getDocumentsByApiSource(ApiSource $apiSource): array
    {
        return $this->documentRepository->findByApiSource($apiSource);
    }

    /**
     * Supprime un document
     */
    public function deleteDocument(Document $document): void
    {
        $this->documentRepository->delete($document);
    }
}
