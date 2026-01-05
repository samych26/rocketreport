<?php

namespace App\Application\UseCase\Auth\RefreshToken;

use App\Domain\Entity\RefreshToken;
use App\Domain\Repository\RefreshTokenRepository;
use App\Domain\Repository\UserRepository;
use App\Domain\ValueObject\RefreshTokenId;
use App\Domain\ValueObject\UserId;
use App\Infrastructure\Persistence\Doctrine\Mapper\UserMapper;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use DateTimeImmutable;

final class RefreshTokenHandler
{
    public function __construct(
        private RefreshTokenRepository $refreshTokenRepository,
        private UserRepository $userRepository,
        private JWTTokenManagerInterface $jwtManager
    ) {}

    public function handle(RefreshTokenCommand $command): array
    {
        $refreshToken = $this->refreshTokenRepository->findByToken($command->refreshToken);

        if (!$refreshToken) {
            throw new \InvalidArgumentException('Invalid refresh token.');
        }

        // --- BREACH DETECTION --- 
        // If the token is already revoked, it might be a reuse attack.
        if ($refreshToken->revoked()) {
            $this->refreshTokenRepository->revokeAllForUser($refreshToken->userId());
            throw new \InvalidArgumentException('Breach detected. All sessions revoked.');
        }

        if ($refreshToken->expiresAt() < new DateTimeImmutable()) {
            throw new \InvalidArgumentException('Refresh token expired.');
        }

        // 1. Revoke the old token (rotation)
        $refreshToken->revoke();
        $this->refreshTokenRepository->save($refreshToken);

        // 2. Find User
        $user = $this->userRepository->findById($refreshToken->userId());
        if (!$user) {
            throw new \RuntimeException('User not found.');
        }

        // 3. Generate new JWT
        $userEntity = UserMapper::toEntity($user);
        $token = $this->jwtManager->create($userEntity);

        // 4. Generate new Refresh Token
        $newRefreshTokenValue = bin2hex(random_bytes(32));
        $newRefreshToken = new RefreshToken(
            RefreshTokenId::generate(),
            $user->id(),
            $newRefreshTokenValue,
            (new DateTimeImmutable())->modify('+7 days')
        );

        $this->refreshTokenRepository->save($newRefreshToken);

        return [
            'token' => $token,
            'refreshToken' => $newRefreshTokenValue
        ];
    }
}
