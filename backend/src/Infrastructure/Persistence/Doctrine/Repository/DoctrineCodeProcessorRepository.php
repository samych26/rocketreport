<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Entity\CodeProcessor;
use App\Domain\Entity\Document;
use App\Domain\Repository\CodeProcessorRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;

final class DoctrineCodeProcessorRepository implements CodeProcessorRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function save(CodeProcessor $codeProcessor): void
    {
        $this->entityManager->persist($codeProcessor);
        $this->entityManager->flush();
    }

    public function findById(int $id): ?CodeProcessor
    {
        return $this->entityManager->getRepository(CodeProcessor::class)->find($id);
    }

    public function findByDocument(Document $document): ?CodeProcessor
    {
        return $this->entityManager->getRepository(CodeProcessor::class)->findOneBy([
            'document' => $document,
        ]);
    }

    public function delete(CodeProcessor $codeProcessor): void
    {
        $this->entityManager->remove($codeProcessor);
        $this->entityManager->flush();
    }
}
