<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Entity\RefreshToken;
use App\Domain\Entity\User;
use App\Domain\Repository\RefreshTokenRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RefreshTokenRepository extends ServiceEntityRepository implements RefreshTokenRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RefreshToken::class);
    }

    public function save(RefreshToken $token): void
    {
        $em = $this->getEntityManager();
        $em->persist($token);
        $em->flush();
    }

    public function findValidToken(string $tokenHash): ?RefreshToken
    {
        $now = new \DateTimeImmutable();

        /** @var RefreshToken|null $token */
        $token = $this->findOneBy(['tokenHash' => $tokenHash]);

        if (null === $token) {
            return null;
        }

        if (!$token->isValidAt($now)) {
            return null;
        }

        return $token;
    }

    public function revokeAllForUser(User $user): void
    {
        $qb = $this->createQueryBuilder('t')
            ->update()
            ->set('t.revokedAt', ':now')
            ->where('t.user = :user')
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('user', $user);

        $qb->getQuery()->execute();
    }
}

