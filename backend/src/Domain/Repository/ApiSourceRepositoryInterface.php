<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\ApiSource;
use App\Domain\Entity\User;

interface ApiSourceRepositoryInterface
{
    public function save(ApiSource $apiSource): void;

    public function delete(ApiSource $apiSource): void;

    public function findById(int $id): ?ApiSource;

    public function findByIdAndUser(int $id, User $user): ?ApiSource;

    /**
     * @return ApiSource[]
     */
    public function findByUser(User $user): array;

    /**
     * @return ApiSource[]
     */
    public function findActiveByUser(User $user): array;
}
