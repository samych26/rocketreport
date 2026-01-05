<?php

namespace App\Infrastructure\Persistence\Doctrine\Mapper;

use App\Domain\Entity\AuditLog;
use App\Domain\ValueObject\AuditLogId;
use App\Domain\ValueObject\UserId;
use App\Infrastructure\Persistence\Doctrine\Entity\AuditLogEntity;

final class AuditLogMapper
{
    public static function toEntity(AuditLog $auditLog): AuditLogEntity
    {
        $entity = new AuditLogEntity();
        $entity->setId($auditLog->id()->value());
        $entity->setAction($auditLog->action());
        $entity->setEntityType($auditLog->entityType());
        $entity->setEntityId($auditLog->entityId());
        $entity->setDetails($auditLog->details());
        $entity->setTimestamp($auditLog->timestamp());
        
        if ($auditLog->userId()) {
            $entity->setUserId($auditLog->userId()->value());
        }

        return $entity;
    }

    public static function toDomain(AuditLogEntity $entity): AuditLog
    {
        $userId = $entity->getUserId() ? UserId::fromString($entity->getUserId()) : null;

        return new AuditLog(
            AuditLogId::fromString($entity->getId()),
            $entity->getAction(),
            $entity->getEntityType(),
            $entity->getEntityId(),
            $entity->getDetails(),
            $userId,
            $entity->getTimestamp()
        );
    }
}
