<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\Auth;

use App\Application\DTO\Request\LoginUserRequest;
use App\Application\DTO\Request\RegisterUserRequest;
use App\Application\UseCase\Auth\LoginUser;
use App\Application\UseCase\Auth\RegisterUser;
use App\Application\Service\TokenManagerInterface;
use App\Domain\Repository\RefreshTokenRepositoryInterface;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\Service\RefreshTokenGeneratorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private readonly RegisterUser $registerUser,
        private readonly LoginUser $loginUser,
        private readonly TokenManagerInterface $tokenManager,
        private readonly RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private readonly RefreshTokenRepositoryInterface $refreshTokenRepository,
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    #[Route('/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);

            if (!isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
                return $this->json(
                    ['error' => 'email, password et name sont requis'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $dto = new RegisterUserRequest(
                email: $data['email'],
                password: $data['password'],
                name: $data['name'],
            );

            $userResponse = ($this->registerUser)($dto);

            return $this->json([
                'message' => 'Utilisateur cree avec succes',
                'user' => $userResponse,
            ], Response::HTTP_CREATED);
        } catch (\RuntimeException $e) {
            // Erreur métier (email existant, etc.)
            return $this->json(
                ['error' => $e->getMessage()],
                Response::HTTP_CONFLICT
            );
        } catch (\JsonException $e) {
            return $this->json(
                ['error' => 'JSON invalide'],
                Response::HTTP_BAD_REQUEST
            );
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Erreur interne du serveur'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);

            if (!isset($data['email']) || !isset($data['password'])) {
                return $this->json(
                    ['error' => 'email et password sont requis'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $dto = new LoginUserRequest(
                email: $data['email'],
                password: $data['password'],
            );

            $loginResponse = ($this->loginUser)($dto);

            $accessToken = $loginResponse->token;
            $userEntityId = $loginResponse->user->id;

            // Récupérer l'entité User à partir de l'id pour le refresh token
            $user = $this->userRepository->find($userEntityId);

            [$refreshTokenEntity, $refreshTokenRaw] = $this->refreshTokenGenerator->generate($user);
            $this->refreshTokenRepository->save($refreshTokenEntity);

            $response = $this->json([
                'message' => 'Connexion reussie',
                'user' => $loginResponse->user,
                'token' => $accessToken, // Retourner le token dans le body aussi
            ]);

            // Déterminer si on est en production
            $isProduction = $this->getParameter('kernel.environment') === 'prod';

            $accessCookie = Cookie::create('rr_access', $accessToken)
                ->withHttpOnly(true)
                ->withSecure($isProduction)
                ->withPath('/')
                ->withSameSite(Cookie::SAMESITE_LAX);

            $refreshCookie = Cookie::create('rr_refresh', $refreshTokenRaw)
                ->withHttpOnly(true)
                ->withSecure($isProduction)
                ->withPath('/')
                ->withSameSite(Cookie::SAMESITE_LAX);

            $response->headers->setCookie($accessCookie);
            $response->headers->setCookie($refreshCookie);

            return $response;
        } catch (\RuntimeException $e) {
            // Identifiants invalides
            return $this->json(
                ['error' => $e->getMessage()],
                Response::HTTP_UNAUTHORIZED
            );
        } catch (\JsonException $e) {
            return $this->json(
                ['error' => 'JSON invalide'],
                Response::HTTP_BAD_REQUEST
            );
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Erreur interne du serveur'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/refresh', name: 'api_auth_refresh', methods: ['POST'])]
    public function refresh(Request $request): JsonResponse
    {
        try {
            // 1. Récupérer le refresh token depuis le cookie
            $refreshTokenRaw = $request->cookies->get('rr_refresh');

            if (!$refreshTokenRaw) {
                return $this->json(
                    ['error' => 'Refresh token not found'],
                    Response::HTTP_UNAUTHORIZED
                );
            }

            // 2. Calculer le hash du token
            $tokenHash = hash('sha256', $refreshTokenRaw);

            // 3. Valider le token (vérifie expiration et révocation)
            $refreshToken = $this->refreshTokenRepository->findValidToken($tokenHash);

            if (!$refreshToken) {
                return $this->json(
                    ['error' => 'Invalid or expired refresh token'],
                    Response::HTTP_UNAUTHORIZED
                );
            }

            // 4. Récupérer l'utilisateur associé au token
            $user = $refreshToken->getUser();

            // 5. Générer un nouveau access token
            $newAccessToken = $this->tokenManager->createToken($user);

            // 6. ROTATION: Générer un nouveau refresh token
            [$newRefreshTokenEntity, $newRefreshTokenRaw] = $this->refreshTokenGenerator->generate($user);

            // 7. Révoquer l'ancien refresh token
            $refreshToken->revoke();
            $this->refreshTokenRepository->save($refreshToken);

            // 8. Sauvegarder le nouveau refresh token
            $this->refreshTokenRepository->save($newRefreshTokenEntity);

            // 9. Créer la réponse avec les nouveaux tokens
            $response = $this->json([
                'message' => 'Tokens rafraichis avec succes',
                'token' => $newAccessToken,
            ]);

            // 10. Définir les nouveaux cookies
            $isProduction = $this->getParameter('kernel.environment') === 'prod';

            $accessCookie = Cookie::create('rr_access', $newAccessToken)
                ->withHttpOnly(true)
                ->withSecure($isProduction)
                ->withPath('/')
                ->withSameSite(Cookie::SAMESITE_LAX);

            $refreshCookie = Cookie::create('rr_refresh', $newRefreshTokenRaw)
                ->withHttpOnly(true)
                ->withSecure($isProduction)
                ->withPath('/')
                ->withSameSite(Cookie::SAMESITE_LAX);

            $response->headers->setCookie($accessCookie);
            $response->headers->setCookie($refreshCookie);

            return $response;
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Failed to refresh token'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        // Récupérer le refresh token depuis le cookie
        $refreshTokenRaw = $request->cookies->get('rr_refresh');

        if ($refreshTokenRaw) {
            // Calculer le hash
            $tokenHash = hash('sha256', $refreshTokenRaw);

            // Trouver et révoquer le token
            $refreshToken = $this->refreshTokenRepository->findValidToken($tokenHash);
            if ($refreshToken) {
                $refreshToken->revoke();
                $this->refreshTokenRepository->save($refreshToken);
            }
        }

        $response = $this->json(['message' => 'Logged out successfully']);

        // Déterminer si on est en production
        $isProduction = $this->getParameter('kernel.environment') === 'prod';

        // Supprimer les cookies
        $response->headers->clearCookie('rr_access', '/', null, $isProduction, true);
        $response->headers->clearCookie('rr_refresh', '/', null, $isProduction, true);

        return $response;
    }
    #[Route('/me', name: 'api_auth_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var \App\Domain\Entity\User|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'roles' => $user->getRoles(),
            ]
        ]);
    }
}
