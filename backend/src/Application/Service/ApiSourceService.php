<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\ApiSource;
use App\Domain\Entity\User;
use App\Domain\Repository\ApiSourceRepositoryInterface;

final class ApiSourceService
{
    public function __construct(
        private ApiSourceRepositoryInterface $apiSourceRepository,
    ) {}

    /**
     * Crée une nouvelle source API
     */
    public function createApiSource(
        User $user,
        string $name,
        string $url_base,
        string $auth_type = 'none',
        ?string $auth_token = null,
        ?array $headers = null,
    ): ApiSource {
        $apiSource = new ApiSource($user, $name, $url_base);
        $apiSource->setAuthType($auth_type);
        $apiSource->setAuthToken($auth_token);
        $apiSource->setHeaders($headers);

        $this->apiSourceRepository->save($apiSource);

        return $apiSource;
    }

    /**
     * Met à jour une source API
     */
    public function updateApiSource(
        ApiSource $apiSource,
        array $data,
    ): ApiSource {
        if (isset($data['name'])) {
            $apiSource->setName($data['name']);
        }
        if (isset($data['description'])) {
            $apiSource->setDescription($data['description']);
        }
        if (isset($data['url_base'])) {
            $apiSource->setUrlBase($data['url_base']);
        }
        if (isset($data['auth_type'])) {
            $apiSource->setAuthType($data['auth_type']);
        }
        if (isset($data['auth_token'])) {
            $apiSource->setAuthToken($data['auth_token']);
        }
        if (isset($data['headers'])) {
            $apiSource->setHeaders($data['headers']);
        }
        if (isset($data['status'])) {
            $apiSource->setStatus($data['status']);
        }

        $this->apiSourceRepository->save($apiSource);

        return $apiSource;
    }

    /**
     * Récupère les API sources d'un utilisateur
     */
    public function getApiSourcesByUser(User $user): array
    {
        return $this->apiSourceRepository->findByUser($user);
    }

    /**
     * Récupère une API source spécifique
     */
    public function getApiSource(int $id, User $user): ?ApiSource
    {
        return $this->apiSourceRepository->findByIdAndUser($id, $user);
    }

    /**
     * Supprime une API source
     */
    public function deleteApiSource(ApiSource $apiSource): void
    {
        $this->apiSourceRepository->delete($apiSource);
    }
}
