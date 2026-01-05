<?php

namespace App\Application\UseCase\ApiSource\CreateApiSource;

use App\Domain\Entity\ApiSource;
use App\Domain\Repository\ApiSourceRepository;
use App\Domain\ValueObject\ApiSourceId;
use App\Domain\ValueObject\ApiEndpoint;

final class CreateApiSourceHandler
{
    public function __construct(
        private ApiSourceRepository $apiSourceRepository
    ) {}

    public function handle(CreateApiSourceCommand $command): ApiSource
    {
        $endpoints = array_map(function (array $e) {
            return new ApiEndpoint(
                $e['path'],
                $e['headers'] ?? [],
                $e['queryParams'] ?? [],
                $e['bodyTemplate'] ?? '',
                $e['filters'] ?? []
            );
        }, $command->getEndpoints());

        $apiSource = new ApiSource(
            ApiSourceId::generate(),
            $command->getName(),
            $command->getBaseUrl(),
            $command->getMethod(),
            $command->getAuthType(),
            $endpoints
        );

        $this->apiSourceRepository->save($apiSource);

        return $apiSource;
    }
}
