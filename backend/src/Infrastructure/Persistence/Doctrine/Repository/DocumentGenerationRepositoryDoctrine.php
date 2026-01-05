<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use Doctrine\ORM\EntityManagerInterface;
use App\Domain\Repository\DocumentGenerationRepository;
use App\Domain\Entity\DocumentGeneration;
use App\Domain\ValueObject\DocumentGenerationId;
use App\Infrastructure\Persistence\Doctrine\Entity\DocumentGenerationEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\DocumentGenerationMapper;

final class DocumentGenerationRepositoryDoctrine implements DocumentGenerationRepository
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function save(DocumentGeneration $documentGeneration): void
    {
        $entity = DocumentGenerationMapper::toEntity($documentGeneration);
        $this->em->persist($entity);
        $this->em->flush();
    }

    public function findById(DocumentGenerationId $id): ?DocumentGeneration
    {
        $entity = $this->em->find(DocumentGenerationEntity::class, $id->value());
        return $entity ? DocumentGenerationMapper::toDomain($entity) : null;
    }
}
