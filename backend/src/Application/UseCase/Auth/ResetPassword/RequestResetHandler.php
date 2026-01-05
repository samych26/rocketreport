<?php

namespace App\Application\UseCase\Auth\ResetPassword;

use App\Domain\Repository\UserRepository;
use App\Domain\ValueObject\Email;

final class RequestResetHandler
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function handle(RequestResetCommand $command): void
    {
        $user = $this->userRepository->findByEmail(new Email($command->email));

        if ($user) {
            $token = $user->generateResetToken();
            $this->userRepository->save($user);

            // In a real app, send email with $token here.
            error_log("Password reset requested for {$command->email}. Token: {$token}");
        }
    }
}
