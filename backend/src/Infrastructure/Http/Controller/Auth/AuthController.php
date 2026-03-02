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
use App\Domain\Service\PasswordHasherInterface;
use App\Domain\Service\RefreshTokenGeneratorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;
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
        private readonly PasswordHasherInterface $passwordHasher,
        private readonly MailerInterface $mailer,
    ) {}

    #[Route('/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        try {
            $content = $request->getContent();
            if (empty($content)) {
                return $this->json(['error' => 'Contenu vide'], Response::HTTP_BAD_REQUEST);
            }

            $data = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return $this->json(['error' => 'JSON invalide: ' . json_last_error_msg()], Response::HTTP_BAD_REQUEST);
            }

            if (!isset($data['email'], $data['password'], $data['name'])) {
                return $this->json(
                    ['error' => 'email, password et name sont requis'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $dto = new RegisterUserRequest(
                email: (string)$data['email'],
                password: (string)$data['password'],
                name: (string)$data['name'],
            );

            // Appeler le use case
            $userResponse = ($this->registerUser)($dto);

            return $this->json([
                'message' => 'Utilisateur cree avec succes',
                'user' => $userResponse,
            ], Response::HTTP_CREATED);
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_CONFLICT);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Erreur interne du serveur: ' . $e->getMessage() . ' - ' . $e->getFile() . ':' . $e->getLine()], Response::HTTP_INTERNAL_SERVER_ERROR);
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
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Erreur interne du serveur'], Response::HTTP_INTERNAL_SERVER_ERROR);
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

    #[Route('/profile', name: 'api_auth_profile', methods: ['GET', 'PATCH'])]
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var \App\Domain\Entity\User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        if ($request->isMethod('GET')) {
            return $this->json([
                'user' => ['id' => $user->getId(), 'email' => $user->getEmail(), 'name' => $user->getName()],
            ]);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $name = trim((string)($data['name'] ?? ''));

        if ($name === '') {
            return $this->json(['error' => 'Le nom est requis.'], Response::HTTP_BAD_REQUEST);
        }

        $user->setName($name);
        $this->userRepository->save($user);

        return $this->json([
            'message' => 'Profil mis à jour.',
            'user' => ['id' => $user->getId(), 'email' => $user->getEmail(), 'name' => $user->getName()],
        ]);
    }

    #[Route('/change-password', name: 'api_auth_change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        /** @var \App\Domain\Entity\User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $currentPassword = (string)($data['currentPassword'] ?? '');
        $newPassword     = (string)($data['newPassword'] ?? '');

        if (!$this->passwordHasher->isValid($user, $currentPassword)) {
            return $this->json(['error' => 'Mot de passe actuel incorrect.'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($newPassword) < 8) {
            return $this->json(['error' => 'Le nouveau mot de passe doit faire au moins 8 caractères.'], Response::HTTP_BAD_REQUEST);
        }

        $user->setPassword($this->passwordHasher->hash($newPassword));
        $this->userRepository->save($user);

        return $this->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    #[Route('/account', name: 'api_auth_delete_account', methods: ['DELETE'])]
    public function deleteAccount(Request $request): JsonResponse
    {
        /** @var \App\Domain\Entity\User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $em = $this->userRepository->find($user->getId());
        // Use Doctrine EntityManager to remove
        $doctrine = $this->container->get('doctrine');
        $entityManager = $doctrine->getManager();
        $entityManager->remove($user);
        $entityManager->flush();

        $response = $this->json(['message' => 'Compte supprimé.']);
        $isProduction = $this->getParameter('kernel.environment') === 'prod';
        $response->headers->clearCookie('rr_access', '/', null, $isProduction, true);
        $response->headers->clearCookie('rr_refresh', '/', null, $isProduction, true);

        return $response;
    }

    #[Route('/forgot-password', name: 'api_auth_forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $email = trim((string)($data['email'] ?? ''));

        if ($email === '') {
            return $this->json(['error' => 'Email requis.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->userRepository->findByEmail($email);

        // Toujours retourner 200 pour ne pas révéler si l'email existe
        if (!$user) {
            return $this->json(['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.']);
        }

        $token = bin2hex(random_bytes(32));
        $user->setResetToken($token);
        $user->setResetTokenExpiresAt(new \DateTimeImmutable('+1 hour'));
        $this->userRepository->save($user);

        $frontendUrl = $this->getParameter('kernel.environment') === 'prod'
            ? 'https://your-app.com'
            : 'http://localhost:5173';

        $resetUrl = "{$frontendUrl}/reset-password?token={$token}";

        $emailMessage = (new Email())
            ->from('no-reply@rocketreport.io')
            ->to($user->getEmail())
            ->subject('Réinitialisation de votre mot de passe RocketReport')
            ->html("
                <h2>Réinitialisation du mot de passe</h2>
                <p>Bonjour {$user->getName()},</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                <p><a href=\"{$resetUrl}\" style=\"background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;\">Réinitialiser mon mot de passe</a></p>
                <p>Ce lien expire dans <strong>1 heure</strong>.</p>
                <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
            ");

        $this->mailer->send($emailMessage);

        return $this->json(['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.']);
    }

    #[Route('/reset-password', name: 'api_auth_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $token = trim((string)($data['token'] ?? ''));
        $newPassword = (string)($data['password'] ?? '');

        if ($token === '' || $newPassword === '') {
            return $this->json(['error' => 'Token et mot de passe requis.'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($newPassword) < 8) {
            return $this->json(['error' => 'Le mot de passe doit faire au moins 8 caractères.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->userRepository->findByResetToken($token);

        if (!$user) {
            return $this->json(['error' => 'Token invalide ou expiré.'], Response::HTTP_BAD_REQUEST);
        }

        if ($user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            return $this->json(['error' => 'Ce lien a expiré. Veuillez faire une nouvelle demande.'], Response::HTTP_BAD_REQUEST);
        }

        $user->setPassword($this->passwordHasher->hash($newPassword));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $this->userRepository->save($user);

        return $this->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}
