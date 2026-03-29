<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\McpApiKey;
use App\Domain\Entity\User;

interface McpApiKeyRepositoryInterface
{
    public function save(McpApiKey $key): void;
    public function delete(McpApiKey $key): void;

    /** Trouve une clé active (non révoquée) par son hash SHA-256 */
    public function findActiveByHash(string $hash): ?McpApiKey;

    /** Liste toutes les clés d'un user (actives + révoquées) */
    public function findByUser(User $user): array;

    /** Trouve une clé spécifique par id ET user (pour sécuriser la révocation) */
    public function findByIdAndUser(int $id, User $user): ?McpApiKey;
}
