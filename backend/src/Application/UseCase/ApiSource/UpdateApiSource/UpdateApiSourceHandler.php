<?php

namespace App\Application\UseCase\ApiSource\UpdateApiSource;

use App\Domain\Entity\ApiSource;
use App\Domain\Repository\ApiSourceRepository;
use App\Domain\ValueObject\ApiSourceId;
use App\Domain\ValueObject\ApiEndpoint;
use App\Domain\Exception\ApiSourceNotFoundException;

final class UpdateApiSourceHandler
{
    public function __construct(
        private ApiSourceRepository $apiSourceRepository
    ) {}

    public function handle(UpdateApiSourceCommand $command): ApiSource
    {
        $apiSourceId = ApiSourceId::fromString($command->getId());
        $apiSource = $this->apiSourceRepository->findById($apiSourceId);

        if (!$apiSource) {
            throw ApiSourceNotFoundException::fromId($command->getId());
        }

        $endpoints = array_map(function (array $e) {
            return new ApiEndpoint(
                $e['path'],
                $e['headers'] ?? [],
                $e['queryParams'] ?? [],
                $e['bodyTemplate'] ?? '',
                $e['filters'] ?? []
            );
        }, $command->getEndpoints());

        $updatedApiSource = new ApiSource(
            $apiSource->id(),
            $command->getName(),
            $command->getBaseUrl(),
            $command->getMethod(),
            $command->getAuthType(),
            $endpoints
        );

        $this->apiSourceRepository->save($updatedApiSource);

        return $updatedApiSource;
    }
}
