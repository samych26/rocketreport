<?php

namespace App\Infrastructure\Service;

use App\Domain\Entity\AuditLog;
use App\Domain\Repository\AuditLogRepository;
use App\Domain\Service\AuditService;
use App\Domain\ValueObject\AuditLogId;
use App\Domain\ValueObject\UserId;

final class LoggerAuditService implements AuditService
{
    public function __construct(
        private AuditLogRepository $auditLogRepository
    ) {}

    public function log(
        string $action,
        string $entityType,
        string $entityId,
        string $details,
        ?UserId $userId = null
    ): void {
        $auditLog = new AuditLog(
            AuditLogId::generate(),
            $action,
            $entityType,
            $entityId,
            $details,
            $userId
        );

        $this->auditLogRepository->save($auditLog);
    }
}
