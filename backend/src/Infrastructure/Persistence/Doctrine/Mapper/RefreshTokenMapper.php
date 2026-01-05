<?php

namespace App\Infrastructure\Persistence\Doctrine\Mapper;

use App\Domain\Entity\RefreshToken;
use App\Domain\ValueObject\RefreshTokenId;
use App\Domain\ValueObject\UserId;
use App\Infrastructure\Persistence\Doctrine\Entity\RefreshTokenEntity;

final class RefreshTokenMapper
{
    public static function toEntity(RefreshToken $refreshToken): RefreshTokenEntity
    {
        $entity = new RefreshTokenEntity();
        $entity->setId($refreshToken->id()->value());
        $entity->setUserId($refreshToken->userId()->value());
        $entity->setToken($refreshToken->token());
        $entity->setExpiresAt($refreshToken->expiresAt());
        $entity->setRevoked($refreshToken->revoked());

        return $entity;
    }

    public static function toDomain(RefreshTokenEntity $entity): RefreshToken
    {
        return new RefreshToken(
            RefreshTokenId::fromString($entity->getId()),
            UserId::fromString($entity->getUserId()),
            $entity->getToken(),
            $entity->getExpiresAt(),
            $entity->isRevoked()
        );
    }
}
