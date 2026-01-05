<?php

namespace App\Infrastructure\Persistence\Doctrine\Mapper;

use App\Domain\Entity\DocumentGeneration;
use App\Domain\ValueObject\DocumentGenerationId;
use App\Domain\ValueObject\UserId;
use App\Domain\ValueObject\TemplateId;
use App\Domain\ValueObject\ApiSourceId;
use App\Infrastructure\Persistence\Doctrine\Entity\DocumentGenerationEntity;

final class DocumentGenerationMapper
{
    public static function toEntity(DocumentGeneration $docGen): DocumentGenerationEntity
    {
        $entity = new DocumentGenerationEntity();
        $entity->setId($docGen->id()->value());
        $entity->setStatus($docGen->status());
        $entity->setOutputFormat($docGen->outputFormat());
        $entity->setCreatedAt($docGen->createdAt());
        
        if ($docGen->userId()) {
            $entity->setUserId($docGen->userId()->value());
        }
        
        if ($docGen->templateId()) {
            $entity->setTemplateId($docGen->templateId()->value());
        }

        // Convert ApiSourceId[] to array of strings
        $apiSourceIds = array_map(function (ApiSourceId $id) {
            return $id->value();
        }, $docGen->apiSourceIds());
        $entity->setApiSourceIds($apiSourceIds);

        return $entity;
    }

    public static function toDomain(DocumentGenerationEntity $entity): DocumentGeneration
    {
        $userId = $entity->getUserId() ? UserId::fromString($entity->getUserId()) : null;
        $templateId = $entity->getTemplateId() ? TemplateId::fromString($entity->getTemplateId()) : null;
        
        $apiSourceIds = array_map(function (string $id) {
            return ApiSourceId::fromString($id);
        }, $entity->getApiSourceIds());

        return new DocumentGeneration(
            DocumentGenerationId::fromString($entity->getId()),
            $entity->getStatus(),
            $entity->getOutputFormat(),
            $userId,
            $templateId,
            $apiSourceIds,
            $entity->getCreatedAt()
        );
    }
}
