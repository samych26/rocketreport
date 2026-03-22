<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository implements UserRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function save(User $user): void
    {
        $em = $this->getEntityManager();

        $em->persist($user);
        $em->flush();
    }

    public function findByEmail(string $email): ?User
    {
        return $this->findOneBy(['email' => $email]);
    }

    public function findByResetToken(string $token): ?User
    {
        return $this->findOneBy(['resetToken' => $token]);
    }

    public function findByEmailVerificationToken(string $token): ?User
    {
        return $this->findOneBy(['emailVerificationToken' => $token]);
    }

    public function findByGoogleId(string $googleId): ?User
    {
        return $this->findOneBy(['googleId' => $googleId]);
    }

    public function findByApiToken(string $token): ?User
    {
        return $this->findOneBy(['apiToken' => $token]);
    }
}

