<?php

namespace App\Ui\Http\Controller;

use App\Application\UseCase\User\RegisterUser\RegisterUserCommand;
use App\Application\UseCase\User\RegisterUser\RegisterUserHandler;
use App\Application\UseCase\User\LoginUser\LoginUserCommand;
use App\Application\UseCase\User\LoginUser\LoginUserHandler;
use App\Application\UseCase\Auth\RefreshToken\RefreshTokenCommand;
use App\Application\UseCase\Auth\RefreshToken\RefreshTokenHandler;
use App\Application\UseCase\Auth\ResetPassword\RequestResetCommand;
use App\Application\UseCase\Auth\ResetPassword\RequestResetHandler;
use App\Application\UseCase\Auth\ResetPassword\ResetPasswordCommand;
use App\Application\UseCase\Auth\ResetPassword\ResetPasswordHandler;
use App\Application\UseCase\Auth\Logout\LogoutCommand;
use App\Application\UseCase\Auth\Logout\LogoutHandler;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request, LoginUserHandler $handler): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'])) {
            return new JsonResponse(['error' => 'Missing credentials'], 400);
        }

        try {
            $command = new LoginUserCommand($data['email'], $data['password']);
            $result = $handler($command);

            $response = new JsonResponse(['token' => $result['token']]);
            
            // Add Refresh Token Cookie
            $response->headers->setCookie(new Cookie(
                'refresh_token',
                $result['refreshToken'],
                (new \DateTime())->modify('+7 days'),
                '/api/auth',
                null,
                false, // Secure (set to true in prod)
                true,  // HttpOnly
                false, // Raw
                Cookie::SAMESITE_STRICT
            ));

            return $response;
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 401);
        }
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request, RegisterUserHandler $handler): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'], $data['firstname'], $data['lastname'])) {
            return new JsonResponse(['error' => 'Missing required fields'], 400);
        }

        try {
            $command = new RegisterUserCommand(
                $data['email'],
                $data['password'],
                $data['firstname'],
                $data['lastname']
            );

            $handler($command);

            return new JsonResponse(['status' => 'User created successfully'], 201);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Internal Server Error'], 500);
        }
    }

    #[Route('/api/auth/refresh', name: 'api_refresh', methods: ['POST'])]
    public function refresh(Request $request, RefreshTokenHandler $handler): JsonResponse
    {
        $refreshToken = $request->cookies->get('refresh_token');

        if (!$refreshToken) {
            return new JsonResponse(['error' => 'Missing refresh token'], 400);
        }

        try {
            $command = new RefreshTokenCommand($refreshToken);
            $result = $handler->handle($command);
            
            $response = new JsonResponse(['token' => $result['token']]);
            
            // Update Refresh Token Cookie (Rotation)
            $response->headers->setCookie(new Cookie(
                'refresh_token',
                $result['refreshToken'],
                (new \DateTime())->modify('+7 days'),
                '/api/auth',
                null,
                false,
                true,
                false,
                Cookie::SAMESITE_STRICT
            ));

            return $response;
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 401);
        }
    }

    #[Route('/api/auth/reset-password-request', name: 'api_reset_password_request', methods: ['POST'])]
    public function requestReset(Request $request, RequestResetHandler $handler): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['email'])) {
            return new JsonResponse(['error' => 'Missing email'], 400);
        }

        $command = new RequestResetCommand($data['email']);
        $handler->handle($command);

        return new JsonResponse(['message' => 'If this email exists, a reset link has been sent.']);
    }

    #[Route('/api/auth/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request, ResetPasswordHandler $handler): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['token'], $data['newPassword'])) {
            return new JsonResponse(['error' => 'Missing data'], 400);
        }

        try {
            $command = new ResetPasswordCommand($data['token'], $data['newPassword']);
            $handler->handle($command);
            return new JsonResponse(['message' => 'Password updated successfully']);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/api/auth/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(Request $request, LogoutHandler $handler): JsonResponse
    {
        $refreshToken = $request->cookies->get('refresh_token');
        
        if ($refreshToken) {
            $command = new LogoutCommand($refreshToken);
            $handler->handle($command);
        }

        $response = new JsonResponse(['message' => 'Logged out successfully']);
        
        // Clear Cookie
        $response->headers->clearCookie('refresh_token', '/api/auth');

        return $response;
    }
}
