<?php

namespace App\Domain\Repository;

use App\Domain\Entity\AuditLog;
use App\Domain\ValueObject\AuditLogId;

interface AuditLogRepository
{
    public function save(AuditLog $auditLog): void;

    public function findById(AuditLogId $id): ?AuditLog;
}
