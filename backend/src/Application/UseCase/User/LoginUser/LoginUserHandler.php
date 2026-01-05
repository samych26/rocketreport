<?php

namespace App\Application\UseCase\User\LoginUser;

use App\Domain\Repository\UserRepository;
use App\Domain\ValueObject\Email;
use App\Domain\Service\PasswordHasher;
use App\Domain\Entity\RefreshToken;
use App\Domain\ValueObject\RefreshTokenId;
use App\Domain\Repository\RefreshTokenRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use App\Infrastructure\Persistence\Doctrine\Mapper\UserMapper;

final class LoginUserHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private PasswordHasher $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private RefreshTokenRepository $refreshTokenRepository
    ) {}

    public function __invoke(LoginUserCommand $command): array
    {
        $email = new Email($command->email);
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !$this->passwordHasher->verify($user->passwordHash(), $command->password)) {
            throw new \InvalidArgumentException('Invalid credentials.');
        }

        $userEntity = UserMapper::toEntity($user);
        $token = $this->jwtManager->create($userEntity);

        $refreshTokenValue = bin2hex(random_bytes(32));
        $refreshToken = new RefreshToken(
            RefreshTokenId::generate(),
            $user->id(),
            $refreshTokenValue,
            (new \DateTimeImmutable())->modify('+7 days')
        );

        $this->refreshTokenRepository->save($refreshToken);

        return [
            'token' => $token,
            'refreshToken' => $refreshTokenValue
        ];
    }
}
