<?php

require __DIR__ . '/vendor/autoload.php';

use App\Domain\ValueObject\RefreshTokenId;
use App\Domain\ValueObject\AuditLogId;
use App\Domain\ValueObject\TemplateId;
use App\Domain\ValueObject\ApiSourceId;
use App\Domain\ValueObject\DocumentGenerationId;
use App\Domain\ValueObject\TemplateVariable;
use App\Domain\ValueObject\ApiEndpoint;

use App\Domain\Entity\RefreshToken;
use App\Domain\Entity\AuditLog;
use App\Domain\Entity\Template;
use App\Domain\Entity\ApiSource;
use App\Domain\Entity\DocumentGeneration;

echo "Verifying Domain Implementation...\n";

// 1. Value Objects
$refreshTokenId = RefreshTokenId::generate();
$auditLogId = AuditLogId::generate();
$templateId = TemplateId::generate();
$apiSourceId = ApiSourceId::generate();
$documentGenerationId = DocumentGenerationId::generate();

echo "IDs generated successfully.\n";

$templateVariable = new TemplateVariable('var1', 'string', true);
$apiEndpoint = new ApiEndpoint('/api/v1/test');

echo "Helper VOs instantiated.\n";

// 2. Entities
$userId = \App\Domain\ValueObject\UserId::generate();
$refreshToken = new RefreshToken($refreshTokenId, $userId, 'secret-token', new DateTimeImmutable('+7 days'));
echo "RefreshToken created.\n";

$auditLog = new AuditLog($auditLogId, 'CREATE', 'User', 'uuid-123', 'Created user', $userId, new DateTimeImmutable());
echo "AuditLog created.\n";

$apiSource = new ApiSource($apiSourceId, 'My API', 'https://api.example.com', 'GET', 'NONE', []);
$template = new Template($templateId, 'My Template', 'Hello {{ name }}', 1, [$templateVariable], new DateTimeImmutable());
echo "Template created.\n";

echo "ApiSource created.\n";

$docGen = new DocumentGeneration($documentGenerationId, 'PENDING', 'PDF', $userId, $templateId, [$apiSourceId], new DateTimeImmutable());
echo "DocumentGeneration created.\n";

echo "VERIFICATION SUCCESSFUL.\n";
