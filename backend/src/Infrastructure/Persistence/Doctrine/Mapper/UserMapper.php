<?php

namespace App\Infrastructure\Persistence\Doctrine\Mapper;

use App\Domain\Entity\User;
use App\Domain\ValueObject\UserId;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\Role;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;

final class UserMapper
{
    public static function toEntity(User $user): UserEntity
    {
        $entity = new UserEntity();
        $entity->setId($user->id()->value());
        $entity->setEmail($user->email()->value());
        $entity->setPasswordHash($user->passwordHash());
        $entity->setFirstname($user->firstname());
        $entity->setLastname($user->lastname());
        $entity->setRole($user->role()->value());
        $entity->setIsActive($user->isActive());
        $entity->setResetToken($user->resetToken());
        $entity->setResetTokenExpiresAt($user->resetTokenExpiresAt());

        return $entity;
    }

    public static function toDomain(UserEntity $entity): User
    {
        return new User(
            UserId::fromString($entity->getId()),
            new Email($entity->getEmail()),
            $entity->getPasswordHash(),
            $entity->getFirstname(),
            $entity->getLastname(),
            new Role($entity->getRole()),
            $entity->isActive(),
            $entity->getResetToken(),
            $entity->getResetTokenExpiresAt()
        );
    }
}
