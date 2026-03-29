<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Domain\Repository\McpApiKeyRepositoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class ApiTokenAuthenticator extends AbstractAuthenticator
{
    private McpApiKeyRepositoryInterface $mcpApiKeyRepository;

    public function __construct(McpApiKeyRepositoryInterface $mcpApiKeyRepository)
    {
        $this->mcpApiKeyRepository = $mcpApiKeyRepository;
    }

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('X-API-KEY');
    }

    public function authenticate(Request $request): Passport
    {
        $apiToken = $request->headers->get('X-API-KEY');

        if (null === $apiToken) {
            throw new CustomUserMessageAuthenticationException('No API token provided');
        }

        return new SelfValidatingPassport(
            new UserBadge($apiToken, function ($apiToken) {
                $hash = hash('sha256', $apiToken);
                $mcpKey = $this->mcpApiKeyRepository->findActiveByHash($hash);
                
                if (!$mcpKey) {
                    throw new CustomUserMessageAuthenticationException('Invalid API token');
                }
                
                // Update last used time
                $mcpKey->touchLastUsed();
                // Persist the change (optional, depending if we want a separate event/service, but usually done here)
                $this->mcpApiKeyRepository->save($mcpKey);
                
                return $mcpKey->getUser();
            })
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $data = [
            'error' => strtr($exception->getMessageKey(), $exception->getMessageData()),
        ];

        return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
    }
}
