<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use Doctrine\ORM\EntityManagerInterface;
use App\Domain\Repository\ApiSourceRepository;
use App\Domain\Entity\ApiSource;
use App\Domain\ValueObject\ApiSourceId;
use App\Infrastructure\Persistence\Doctrine\Entity\ApiSourceEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\ApiSourceMapper;

final class ApiSourceRepositoryDoctrine implements ApiSourceRepository
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function save(ApiSource $apiSource): void
    {
        $entity = $this->em->find(ApiSourceEntity::class, $apiSource->id()->value());

        if (!$entity) {
            $entity = ApiSourceMapper::toEntity($apiSource);
            $this->em->persist($entity);
        } else {
            $newEntity = ApiSourceMapper::toEntity($apiSource);
            $entity->setName($newEntity->getName());
            $entity->setBaseUrl($newEntity->getBaseUrl());
            $entity->setMethod($newEntity->getMethod());
            $entity->setAuthType($newEntity->getAuthType());
            $entity->setEndpoints($newEntity->getEndpoints());
        }

        $this->em->flush();
    }

    public function findById(ApiSourceId $id): ?ApiSource
    {
        $entity = $this->em->find(ApiSourceEntity::class, $id->value());
        return $entity ? ApiSourceMapper::toDomain($entity) : null;
    }

    public function findAll(): array
    {
        $entities = $this->em->getRepository(ApiSourceEntity::class)->findAll();
        
        return array_map(function (ApiSourceEntity $entity) {
            return ApiSourceMapper::toDomain($entity);
        }, $entities);
    }

    public function delete(ApiSource $apiSource): void
    {
        $entity = $this->em->find(ApiSourceEntity::class, $apiSource->id()->value());
        if ($entity) {
            $this->em->remove($entity);
            $this->em->flush();
        }
    }
}
