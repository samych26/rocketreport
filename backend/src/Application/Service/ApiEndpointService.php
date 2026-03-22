<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\ApiEndpoint;
use App\Domain\Entity\ApiSource;
use App\Domain\Repository\ApiEndpointRepositoryInterface;

final class ApiEndpointService
{
    public function __construct(
        private ApiEndpointRepositoryInterface $apiEndpointRepository,
    ) {}

    public function createApiEndpoint(
        ApiSource $apiSource,
        string $name,
        string $path,
        string $method = 'GET',
        ?array $variables = null,
        ?array $query_params = null,
        ?array $path_params = null,
        ?array $body_schema = null
    ): ApiEndpoint {
        $endpoint = new ApiEndpoint($apiSource, $name, $path, $method);
        $endpoint->setVariables($variables);
        $endpoint->setQueryParams($query_params);
        $endpoint->setPathParams($path_params);
        $endpoint->setBodySchema($body_schema);

        $this->apiEndpointRepository->save($endpoint);

        return $endpoint;
    }

    public function updateApiEndpoint(ApiEndpoint $endpoint, array $data): ApiEndpoint
    {
        if (isset($data['name'])) {
            $endpoint->setName($data['name']);
        }
        if (isset($data['description'])) {
            $endpoint->setDescription($data['description']);
        }
        if (isset($data['path'])) {
            $endpoint->setPath($data['path']);
        }
        if (isset($data['method'])) {
            $endpoint->setMethod($data['method']);
        }
        if (isset($data['variables'])) {
            $endpoint->setVariables($data['variables']);
        }
        if (isset($data['query_params'])) {
            $endpoint->setQueryParams($data['query_params']);
        }
        if (isset($data['path_params'])) {
            $endpoint->setPathParams($data['path_params']);
        }
        if (isset($data['body_schema'])) {
            $endpoint->setBodySchema($data['body_schema']);
        }

        $endpoint->setUpdatedAt();
        $this->apiEndpointRepository->save($endpoint);

        return $endpoint;
    }

    public function getApiEndpoint(int $id, ApiSource $apiSource): ?ApiEndpoint
    {
        return $this->apiEndpointRepository->findByIdAndApiSource($id, $apiSource);
    }

    public function getApiEndpointByIdAndUser(int $id, \App\Domain\Entity\User $user): ?ApiEndpoint
    {
        return $this->apiEndpointRepository->findByIdAndUser($id, $user);
    }

    public function getApiEndpointsBySource(ApiSource $apiSource): array
    {
        return $this->apiEndpointRepository->findByApiSource($apiSource);
    }

    public function deleteApiEndpoint(ApiEndpoint $endpoint): void
    {
        $this->apiEndpointRepository->delete($endpoint);
    }
}
