<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Entity\McpApiKey;
use App\Domain\Entity\User;
use App\Domain\Repository\McpApiKeyRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class McpApiKeyRepository extends ServiceEntityRepository implements McpApiKeyRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, McpApiKey::class);
    }

    public function save(McpApiKey $key): void
    {
        $em = $this->getEntityManager();
        $em->persist($key);
        $em->flush();
    }

    public function delete(McpApiKey $key): void
    {
        $em = $this->getEntityManager();
        $em->remove($key);
        $em->flush();
    }

    public function findActiveByHash(string $hash): ?McpApiKey
    {
        return $this->findOneBy(['keyHash' => $hash, 'revoked' => false]);
    }

    public function findByUser(User $user): array
    {
        return $this->findBy(['user' => $user], ['createdAt' => 'DESC']);
    }

    public function findByIdAndUser(int $id, User $user): ?McpApiKey
    {
        return $this->findOneBy(['id' => $id, 'user' => $user]);
    }
}
