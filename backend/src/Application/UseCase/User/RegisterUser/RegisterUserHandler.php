<?php

namespace App\Application\UseCase\User\RegisterUser;

use App\Domain\Entity\User;
use App\Domain\Repository\UserRepository;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\Role;
use App\Domain\ValueObject\UserId;
use App\Domain\Service\PasswordHasher;

final class RegisterUserHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private PasswordHasher $passwordHasher
    ) {} 

    public function __invoke(RegisterUserCommand $command): void
    {
        $email = new Email($command->email);
        
        if ($this->userRepository->findByEmail($email)) {
            throw new \InvalidArgumentException('User already exists.');
        }

        $userId = UserId::generate();
        
        $passwordHash = $this->passwordHasher->hash($command->password); 

        $user = new User(
            $userId,
            $email,
            $passwordHash,
            $command->firstname,
            $command->lastname,
            Role::user()
        );

        $this->userRepository->save($user);
    }
}
