<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Entity\ApiSource;
use App\Domain\Entity\User;
use App\Domain\Repository\ApiSourceRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;

final class DoctrineApiSourceRepository implements ApiSourceRepositoryInterface
{
    private EntityRepository $repository;

    public function __construct(private EntityManagerInterface $em)
    {
        $this->repository = $em->getRepository(ApiSource::class);
    }

    public function save(ApiSource $apiSource): void
    {
        $this->em->persist($apiSource);
        $this->em->flush();
    }

    public function delete(ApiSource $apiSource): void
    {
        $this->em->remove($apiSource);
        $this->em->flush();
    }

    public function findById(int $id): ?ApiSource
    {
        return $this->repository->find($id);
    }

    public function findByIdAndUser(int $id, User $user): ?ApiSource
    {
        return $this->repository->findOneBy(['id' => $id, 'user' => $user]);
    }

    public function findByUser(User $user): array
    {
        return $this->repository->findBy(['user' => $user], ['created_at' => 'DESC']);
    }

    public function findActiveByUser(User $user): array
    {
        return $this->repository->findBy(['user' => $user, 'status' => 'active'], ['created_at' => 'DESC']);
    }
}
