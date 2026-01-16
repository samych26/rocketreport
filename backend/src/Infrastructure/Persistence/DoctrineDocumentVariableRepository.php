<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Entity\DocumentVariable;
use App\Domain\Entity\Document;
use App\Domain\Repository\DocumentVariableRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;

final class DoctrineDocumentVariableRepository implements DocumentVariableRepositoryInterface
{
    private EntityRepository $repository;

    public function __construct(private EntityManagerInterface $em)
    {
        $this->repository = $em->getRepository(DocumentVariable::class);
    }

    public function save(DocumentVariable $variable): void
    {
        $this->em->persist($variable);
        $this->em->flush();
    }

    public function delete(DocumentVariable $variable): void
    {
        $this->em->remove($variable);
        $this->em->flush();
    }

    public function findById(int $id): ?DocumentVariable
    {
        return $this->repository->find($id);
    }

    public function findByDocument(Document $document): array
    {
        return $this->repository->findBy(['document' => $document], ['created_at' => 'ASC']);
    }

    public function findApiFieldsByDocument(Document $document): array
    {
        return $this->repository->findBy(['document' => $document, 'type' => 'api_field'], ['created_at' => 'ASC']);
    }

    public function findCalculatedByDocument(Document $document): array
    {
        return $this->repository->findBy(['document' => $document, 'type' => 'calculated'], ['created_at' => 'ASC']);
    }
}
