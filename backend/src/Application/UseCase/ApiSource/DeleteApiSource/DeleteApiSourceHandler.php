<?php

namespace App\Application\UseCase\ApiSource\DeleteApiSource;

use App\Domain\Repository\ApiSourceRepository;
use App\Domain\ValueObject\ApiSourceId;
use App\Domain\Exception\ApiSourceNotFoundException;

final class DeleteApiSourceHandler
{
    public function __construct(
        private ApiSourceRepository $apiSourceRepository
    ) {}

    public function handle(DeleteApiSourceCommand $command): void
    {
        $apiSourceId = ApiSourceId::fromString($command->getId());
        $apiSource = $this->apiSourceRepository->findById($apiSourceId);

        if (!$apiSource) {
            throw ApiSourceNotFoundException::fromId($command->getId());
        }

        $this->apiSourceRepository->delete($apiSource);
    }
}
