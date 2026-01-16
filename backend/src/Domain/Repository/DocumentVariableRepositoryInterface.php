<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\DocumentVariable;
use App\Domain\Entity\Document;

interface DocumentVariableRepositoryInterface
{
    public function save(DocumentVariable $variable): void;

    public function delete(DocumentVariable $variable): void;

    public function findById(int $id): ?DocumentVariable;

    /**
     * @return DocumentVariable[]
     */
    public function findByDocument(Document $document): array;

    /**
     * @return DocumentVariable[]
     */
    public function findApiFieldsByDocument(Document $document): array;

    /**
     * @return DocumentVariable[]
     */
    public function findCalculatedByDocument(Document $document): array;
}
