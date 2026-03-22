<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\ApiEndpoint;
use App\Domain\Entity\ApiSource;

interface ApiEndpointRepositoryInterface
{
    public function save(ApiEndpoint $apiEndpoint): void;
    public function delete(ApiEndpoint $apiEndpoint): void;
    public function findByIdAndApiSource(int $id, ApiSource $apiSource): ?ApiEndpoint;
    public function findByIdAndUser(int $id, \App\Domain\Entity\User $user): ?ApiEndpoint;
    public function findByApiSource(ApiSource $apiSource): array;
}
