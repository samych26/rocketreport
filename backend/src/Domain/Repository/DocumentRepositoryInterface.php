<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\Document;
use App\Domain\Entity\ApiSource;
use App\Domain\Entity\User;

interface DocumentRepositoryInterface
{
    public function save(Document $document): void;

    public function delete(Document $document): void;

    public function findById(int $id): ?Document;

    public function findByIdAndUser(int $id, User $user): ?Document;

    /**
     * @return Document[]
     */
    public function findByUser(User $user): array;

    /**
     * @return Document[]
     */
    public function findByApiSource(ApiSource $apiSource): array;

    /**
     * @return Document[]
     */
    public function findActiveByUser(User $user): array;
}
