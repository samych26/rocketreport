<?php

namespace App\Domain\Repository;

use App\Domain\Entity\DocumentGeneration;
use App\Domain\ValueObject\DocumentGenerationId;

interface DocumentGenerationRepository
{
    public function save(DocumentGeneration $documentGeneration): void;

    public function findById(DocumentGenerationId $id): ?DocumentGeneration;
}
