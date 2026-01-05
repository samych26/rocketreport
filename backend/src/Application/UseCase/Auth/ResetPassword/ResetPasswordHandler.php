<?php

namespace App\Application\UseCase\Auth\ResetPassword;

use App\Domain\Repository\UserRepository;
use App\Domain\Service\PasswordHasher;
use DateTimeImmutable;

final class ResetPasswordHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private PasswordHasher $passwordHasher
    ) {}

    public function handle(ResetPasswordCommand $command): void
    {
        // We need a way to find user by reset token.
        // Let's add it to UserRepository.
        $user = $this->userRepository->findByResetToken($command->token);

        if (!$user || $user->resetTokenExpiresAt() < new DateTimeImmutable()) {
            throw new \InvalidArgumentException('Invalid or expired reset token.');
        }

        $passwordHash = $this->passwordHasher->hash($command->newPassword);
        $user->updatePassword($passwordHash);
        $user->clearResetToken();

        $this->userRepository->save($user);
    }
}
