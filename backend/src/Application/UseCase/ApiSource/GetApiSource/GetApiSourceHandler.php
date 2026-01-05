<?php

namespace App\Application\UseCase\ApiSource\GetApiSource;

use App\Domain\Entity\ApiSource;
use App\Domain\Repository\ApiSourceRepository;
use App\Domain\ValueObject\ApiSourceId;
use App\Domain\Exception\ApiSourceNotFoundException;

final class GetApiSourceHandler
{
    public function __construct(
        private ApiSourceRepository $apiSourceRepository
    ) {}

    public function handle(GetApiSourceQuery $query): ApiSource
    {
        $apiSourceId = ApiSourceId::fromString($query->getId());
        $apiSource = $this->apiSourceRepository->findById($apiSourceId);

        if (!$apiSource) {
            throw ApiSourceNotFoundException::fromId($query->getId());
        }

        return $apiSource;
    }
}
