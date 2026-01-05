<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use Doctrine\ORM\EntityManagerInterface;
use App\Domain\Repository\TemplateRepository;
use App\Domain\Entity\Template;
use App\Domain\ValueObject\TemplateId;
use App\Infrastructure\Persistence\Doctrine\Entity\TemplateEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\TemplateMapper;

final class TemplateRepositoryDoctrine implements TemplateRepository
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function save(Template $template): void
    {
        $entity = $this->em->find(TemplateEntity::class, $template->id()->value());
        
        if (!$entity) {
            $entity = TemplateMapper::toEntity($template);
            $this->em->persist($entity);
        } else {
            // Update existing entity properties from domain object
            $newEntity = TemplateMapper::toEntity($template);
            $entity->setName($newEntity->getName());
            $entity->setContent($newEntity->getContent());
            $entity->setVersion($newEntity->getVersion());
            $entity->setVariables($newEntity->getVariables());
        }
        
        $this->em->flush();
    }

    public function findById(TemplateId $id): ?Template
    {
        $entity = $this->em->find(TemplateEntity::class, $id->value());
        return $entity ? TemplateMapper::toDomain($entity) : null;
    }

    public function findAll(): array
    {
        $entities = $this->em->getRepository(TemplateEntity::class)->findAll();
        
        return array_map(function (TemplateEntity $entity) {
            return TemplateMapper::toDomain($entity);
        }, $entities);
    }

    public function delete(Template $template): void
    {
        $entity = $this->em->find(TemplateEntity::class, $template->id()->value());
        if ($entity) {
            $this->em->remove($entity);
            $this->em->flush();
        }
    }
}
