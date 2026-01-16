<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Application\Service\TokenManagerInterface;
use App\Domain\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class JwtTokenManager implements TokenManagerInterface
{
    public function __construct(
        private readonly JWTTokenManagerInterface $jwtManager,
    ) {
    }

    public function createToken(User $user): string
    {
        return $this->jwtManager->create($user);
    }
}

