<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\CodeProcessor;
use App\Domain\Entity\Document;

interface CodeProcessorRepositoryInterface
{
    /**
     * Sauvegarde un code processor
     */
    public function save(CodeProcessor $codeProcessor): void;

    /**
     * Trouve un code processor par son ID
     */
    public function findById(int $id): ?CodeProcessor;

    /**
     * Trouve le code processor associé à un document
     */
    public function findByDocument(Document $document): ?CodeProcessor;

    /**
     * Supprime un code processor
     */
    public function delete(CodeProcessor $codeProcessor): void;
}
