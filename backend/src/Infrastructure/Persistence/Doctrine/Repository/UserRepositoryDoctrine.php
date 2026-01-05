<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use Doctrine\ORM\EntityManagerInterface;
use App\Domain\Repository\UserRepository;
use App\Domain\Entity\User;
use App\Domain\ValueObject\UserId;
use App\Domain\ValueObject\Email;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\UserMapper;

final class UserRepositoryDoctrine implements UserRepository
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function save(User $user): void
    {
        $entity = UserMapper::toEntity($user);
        $this->em->persist($entity);
        $this->em->flush();
    }

    public function findById(UserId $id): ?User
    {
        $entity = $this->em->find(UserEntity::class, $id->value());
        return $entity ? UserMapper::toDomain($entity) : null;
    }

    public function findByEmail(Email $email): ?User
    {
        $entity = $this->em->getRepository(UserEntity::class)
            ->findOneBy(['email' => $email->value()]);

        return $entity ? UserMapper::toDomain($entity) : null;
    }

    public function findByResetToken(string $token): ?User
    {
        $entity = $this->em->getRepository(UserEntity::class)
            ->findOneBy(['resetToken' => $token]);

        return $entity ? UserMapper::toDomain($entity) : null;
    }
}
