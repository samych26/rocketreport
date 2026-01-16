<?php

declare(strict_types=1);

namespace App\Application\UseCase\Auth;

use App\Application\DTO\Request\LoginUserRequest;
use App\Application\DTO\Response\LoginResponse;
use App\Application\DTO\Response\UserResponse;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\Service\PasswordHasherInterface;
use App\Application\Service\TokenManagerInterface;

class LoginUser
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly PasswordHasherInterface $passwordHasher,
        private readonly TokenManagerInterface $tokenManager,
    ) {
    }

    public function __invoke(LoginUserRequest $request): LoginResponse
    {
        $user = $this->userRepository->findByEmail($request->email);

        if (null === $user) {
            throw new \RuntimeException('Invalid credentials.');
        }

        if (!$this->passwordHasher->isValid($user, $request->password)) {
            throw new \RuntimeException('Invalid credentials.');
        }

        $token = $this->tokenManager->createToken($user);

        return new LoginResponse(
            token: $token,
            user: UserResponse::fromEntity($user),
        );
    }
}

