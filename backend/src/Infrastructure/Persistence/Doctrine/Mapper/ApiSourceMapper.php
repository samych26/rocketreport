<?php

namespace App\Infrastructure\Persistence\Doctrine\Mapper;

use App\Domain\Entity\ApiSource;
use App\Domain\ValueObject\ApiSourceId;
use App\Domain\ValueObject\ApiEndpoint;
use App\Infrastructure\Persistence\Doctrine\Entity\ApiSourceEntity;

final class ApiSourceMapper
{
    public static function toEntity(ApiSource $apiSource): ApiSourceEntity
    {
        $entity = new ApiSourceEntity();
        $entity->setId($apiSource->id()->value());
        $entity->setName($apiSource->name());
        $entity->setBaseUrl($apiSource->baseUrl());
        $entity->setMethod($apiSource->method());
        $entity->setAuthType($apiSource->authType());

        // Convert ApiEndpoint[] to array for JSON
        $endpointsData = array_map(function (ApiEndpoint $e) {
            return [
                'path' => $e->path(),
                'headers' => $e->headers(),
                'queryParams' => $e->queryParams(),
                'bodyTemplate' => $e->bodyTemplate(),
                'filters' => $e->filters(),
            ];
        }, $apiSource->endpoints());
        $entity->setEndpoints($endpointsData);

        return $entity;
    }

    public static function toDomain(ApiSourceEntity $entity): ApiSource
    {
        // Convert JSON array to ApiEndpoint[]
        $endpoints = array_map(function (array $e) {
            return new ApiEndpoint(
                $e['path'],
                $e['headers'] ?? [],
                $e['queryParams'] ?? [],
                $e['bodyTemplate'] ?? '',
                $e['filters'] ?? []
            );
        }, $entity->getEndpoints());

        return new ApiSource(
            ApiSourceId::fromString($entity->getId()),
            $entity->getName(),
            $entity->getBaseUrl(),
            $entity->getMethod(),
            $entity->getAuthType(),
            $endpoints
        );
    }
}
