<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Entity\ApiEndpoint;
use App\Domain\Entity\ApiSource;
use App\Domain\Repository\ApiEndpointRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ApiEndpoint>
 */
class ApiEndpointRepository extends ServiceEntityRepository implements ApiEndpointRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ApiEndpoint::class);
    }

    public function save(ApiEndpoint $apiEndpoint): void
    {
        $this->getEntityManager()->persist($apiEndpoint);
        $this->getEntityManager()->flush();
    }

    public function delete(ApiEndpoint $apiEndpoint): void
    {
        $this->getEntityManager()->remove($apiEndpoint);
        $this->getEntityManager()->flush();
    }

    public function findByIdAndApiSource(int $id, ApiSource $apiSource): ?ApiEndpoint
    {
        return $this->findOneBy(['id' => $id, 'api_source' => $apiSource]);
    }

    public function findByIdAndUser(int $id, \App\Domain\Entity\User $user): ?ApiEndpoint
    {
        return $this->createQueryBuilder('e')
            ->join('e.api_source', 's')
            ->where('e.id = :id')
            ->andWhere('s.user = :user')
            ->setParameter('id', $id)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByApiSource(ApiSource $apiSource): array
    {
        return $this->findBy(['api_source' => $apiSource], ['created_at' => 'DESC']);
    }
}
