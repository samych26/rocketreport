<?php

namespace App\Application\UseCase\Auth\Logout;

use App\Domain\Repository\RefreshTokenRepository;

final class LogoutHandler
{
    public function __construct(
        private RefreshTokenRepository $refreshTokenRepository
    ) {}

    public function handle(LogoutCommand $command): void
    {
        $refreshToken = $this->refreshTokenRepository->findByToken($command->refreshToken);

        if ($refreshToken) {
            $refreshToken->revoke();
            $this->refreshTokenRepository->save($refreshToken);
        }
    }
}
