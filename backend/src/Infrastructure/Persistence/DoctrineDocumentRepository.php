<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Entity\Document;
use App\Domain\Entity\ApiSource;
use App\Domain\Entity\User;
use App\Domain\Repository\DocumentRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;

final class DoctrineDocumentRepository implements DocumentRepositoryInterface
{
    private EntityRepository $repository;

    public function __construct(private EntityManagerInterface $em)
    {
        $this->repository = $em->getRepository(Document::class);
    }

    public function save(Document $document): void
    {
        $this->em->persist($document);
        $this->em->flush();
    }

    public function delete(Document $document): void
    {
        $this->em->remove($document);
        $this->em->flush();
    }

    public function findById(int $id): ?Document
    {
        return $this->repository->find($id);
    }

    public function findByIdAndUser(int $id, User $user): ?Document
    {
        return $this->repository->findOneBy(['id' => $id, 'user' => $user]);
    }

    public function findByUser(User $user): array
    {
        return $this->repository->findBy(['user' => $user], ['created_at' => 'DESC']);
    }

    public function findByApiSource(ApiSource $apiSource): array
    {
        return $this->repository->findBy(['api_source' => $apiSource], ['created_at' => 'DESC']);
    }

    public function findActiveByUser(User $user): array
    {
        return $this->repository->findBy(['user' => $user, 'status' => 'active'], ['created_at' => 'DESC']);
    }
}
