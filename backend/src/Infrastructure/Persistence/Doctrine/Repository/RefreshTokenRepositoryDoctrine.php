<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use Doctrine\ORM\EntityManagerInterface;
use App\Domain\Repository\RefreshTokenRepository;
use App\Domain\Entity\RefreshToken;
use App\Domain\ValueObject\RefreshTokenId;
use App\Domain\ValueObject\UserId;
use App\Infrastructure\Persistence\Doctrine\Entity\RefreshTokenEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\RefreshTokenMapper;

final class RefreshTokenRepositoryDoctrine implements RefreshTokenRepository
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function save(RefreshToken $refreshToken): void
    {
        $entity = $this->em->find(RefreshTokenEntity::class, $refreshToken->id()->value());
        
        if (!$entity) {
            $entity = RefreshTokenMapper::toEntity($refreshToken);
            $this->em->persist($entity);
        } else {
            // Update existing entity
            $newEntity = RefreshTokenMapper::toEntity($refreshToken);
            $entity->setRevoked($newEntity->isRevoked());
            $entity->setExpiresAt($newEntity->getExpiresAt());
        }
        
        $this->em->flush();
    }

    public function findById(RefreshTokenId $id): ?RefreshToken
    {
        $entity = $this->em->find(RefreshTokenEntity::class, $id->value());
        return $entity ? RefreshTokenMapper::toDomain($entity) : null;
    }

    public function findByToken(string $token): ?RefreshToken
    {
        $entity = $this->em->getRepository(RefreshTokenEntity::class)
            ->findOneBy(['token' => $token]);
            
        return $entity ? RefreshTokenMapper::toDomain($entity) : null;
    }

    public function revokeAllForUser(UserId $userId): void
    {
        $this->em->createQueryBuilder()
            ->update(RefreshTokenEntity::class, 'rt')
            ->set('rt.revoked', ':revoked')
            ->where('rt.userId = :userId')
            ->setParameter('revoked', true)
            ->setParameter('userId', $userId->value())
            ->getQuery()
            ->execute();
    }

    public function delete(RefreshToken $refreshToken): void
    {
        $entity = $this->em->find(RefreshTokenEntity::class, $refreshToken->id()->value());
        if ($entity) {
            $this->em->remove($entity);
            $this->em->flush();
        }
    }
}
