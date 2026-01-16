<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\DocumentGeneration;
use App\Domain\Entity\Document;
use App\Domain\Entity\User;

interface DocumentGenerationRepositoryInterface
{
    public function save(DocumentGeneration $generation): void;

    public function findById(int $id): ?DocumentGeneration;

    /**
     * @return DocumentGeneration[]
     */
    public function findByDocument(Document $document): array;

    /**
     * @return DocumentGeneration[]
     */
    public function findByDocumentWithPagination(Document $document, int $page = 1, int $limit = 20): array;

    public function countByDocument(Document $document): int;

    /**
     * @return DocumentGeneration[]
     */
    public function findSuccessByUser(User $user, int $limit = 10): array;
}
