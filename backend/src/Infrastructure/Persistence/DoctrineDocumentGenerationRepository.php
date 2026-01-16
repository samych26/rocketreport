<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Entity\DocumentGeneration;
use App\Domain\Entity\Document;
use App\Domain\Entity\User;
use App\Domain\Repository\DocumentGenerationRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;

final class DoctrineDocumentGenerationRepository implements DocumentGenerationRepositoryInterface
{
    private EntityRepository $repository;

    public function __construct(private EntityManagerInterface $em)
    {
        $this->repository = $em->getRepository(DocumentGeneration::class);
    }

    public function save(DocumentGeneration $generation): void
    {
        $this->em->persist($generation);
        $this->em->flush();
    }

    public function findById(int $id): ?DocumentGeneration
    {
        return $this->repository->find($id);
    }

    public function findByDocument(Document $document): array
    {
        return $this->repository->findBy(['document' => $document], ['created_at' => 'DESC']);
    }

    public function findByDocumentWithPagination(Document $document, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        return $this->repository->findBy(['document' => $document], ['created_at' => 'DESC'], $limit, $offset);
    }

    public function countByDocument(Document $document): int
    {
        return count($this->repository->findBy(['document' => $document]));
    }

    public function findSuccessByUser(User $user, int $limit = 10): array
    {
        $qb = $this->em->createQueryBuilder();
        return $qb
            ->select('g')
            ->from(DocumentGeneration::class, 'g')
            ->join('g.document', 'd')
            ->where('d.user = :user')
            ->andWhere('g.status = :status')
            ->setParameter('user', $user)
            ->setParameter('status', 'success')
            ->orderBy('g.created_at', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
