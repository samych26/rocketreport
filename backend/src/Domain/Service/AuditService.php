<?php

namespace App\Domain\Service;

use App\Domain\ValueObject\UserId;

interface AuditService
{
    public function log(
        string $action,
        string $entityType,
        string $entityId,
        string $details,
        ?UserId $userId = null
    ): void;
}
