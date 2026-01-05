<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use Doctrine\ORM\EntityManagerInterface;
use App\Domain\Repository\AuditLogRepository;
use App\Domain\Entity\AuditLog;
use App\Domain\ValueObject\AuditLogId;
use App\Infrastructure\Persistence\Doctrine\Entity\AuditLogEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\AuditLogMapper;

final class AuditLogRepositoryDoctrine implements AuditLogRepository
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function save(AuditLog $auditLog): void
    {
        $entity = AuditLogMapper::toEntity($auditLog);
        $this->em->persist($entity);
        $this->em->flush();
    }

    public function findById(AuditLogId $id): ?AuditLog
    {
        $entity = $this->em->find(AuditLogEntity::class, $id->value());
        return $entity ? AuditLogMapper::toDomain($entity) : null;
    }
}
