<?php

namespace App\Domain\Repository;

use App\Domain\Entity\ApiSource;
use App\Domain\ValueObject\ApiSourceId;

interface ApiSourceRepository
{
    public function save(ApiSource $apiSource): void;

    public function findById(ApiSourceId $id): ?ApiSource;

    /** @return ApiSource[] */
    public function findAll(): array;

    public function delete(ApiSource $apiSource): void;
}
