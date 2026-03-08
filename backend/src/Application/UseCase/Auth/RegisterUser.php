<?php

declare(strict_types=1);

namespace App\Application\UseCase\Auth;

use App\Application\DTO\Request\RegisterUserRequest;
use App\Application\DTO\Response\UserResponse;
use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\Service\PasswordHasherInterface;

class RegisterUser
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly PasswordHasherInterface $passwordHasher,
    ) {
    }

    public function __invoke(RegisterUserRequest $request): UserResponse
    {
        $existing = $this->userRepository->findByEmail($request->email);
        if (null !== $existing) {
            throw new \RuntimeException('Email is already in use.');
        }

        $hashedPassword = $this->passwordHasher->hash($request->password);

        $user = new User(
            email: $request->email,
            password: $hashedPassword,
            name: $request->name,
        );

        $user->setEmailVerificationToken(bin2hex(random_bytes(32)));

        $this->userRepository->save($user);

        return UserResponse::fromEntity($user);
    }
}

