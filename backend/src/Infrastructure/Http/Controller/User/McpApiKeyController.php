<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\User;

use App\Domain\Entity\McpApiKey;
use App\Domain\Repository\McpApiKeyRepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/user/mcp-keys')]
class McpApiKeyController extends AbstractController
{
    public function __construct(
        private readonly McpApiKeyRepositoryInterface $mcpApiKeyRepository
    ) {}

    #[Route('', name: 'api_mcp_keys_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var \App\Domain\Entity\User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $keys = $this->mcpApiKeyRepository->findByUser($user);
        
        $data = array_map(function (McpApiKey $key) {
            return [
                'id'         => $key->getId(),
                'name'       => $key->getName(),
                'preview'    => $key->getKeyPreview() . '...',
                'revoked'    => $key->isRevoked(),
                'createdAt'  => $key->getCreatedAt()->format(\DateTimeInterface::ATOM),
                'lastUsedAt' => $key->getLastUsedAt() ? $key->getLastUsedAt()->format(\DateTimeInterface::ATOM) : null,
            ];
        }, $keys);

        // Filter out revoked keys if we don't want to show them, or show all. We show all for now.
        $data = array_values(array_filter($data, fn($k) => !$k['revoked']));

        return $this->json(['mcpKeys' => $data]);
    }

    #[Route('', name: 'api_mcp_keys_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var \App\Domain\Entity\User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $content = json_decode($request->getContent(), true) ?? [];
        $name = trim((string) ($content['name'] ?? 'Clé MCP'));

        if ($name === '') {
            return $this->json(['error' => 'Le nom de la clé est requis.'], Response::HTTP_BAD_REQUEST);
        }

        // Generate a standard secure key (32 bytes = 64 hex chars)
        $rawKey = 'rr_mcp_' . bin2hex(random_bytes(32));
        $hash = hash('sha256', $rawKey);
        $preview = substr($rawKey, 0, 12);

        $mcpKey = new McpApiKey($user, $name, $hash, $preview);
        $this->mcpApiKeyRepository->save($mcpKey);

        return $this->json([
            'message' => 'Clé générée avec succès.',
            'key'     => $rawKey, // IMPORTANT: never returned again!
            'preview' => $preview . '...',
            'id'      => $mcpKey->getId(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_mcp_keys_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        /** @var \App\Domain\Entity\User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $mcpKey = $this->mcpApiKeyRepository->findByIdAndUser($id, $user);

        if (!$mcpKey) {
            return $this->json(['error' => 'Clé introuvable ou non autorisée.'], Response::HTTP_NOT_FOUND);
        }

        // We can physically delete it or mark as revoked.
        // Let's delete it completely to keep DB clean, or revoke it.
        $mcpKey->revoke();
        $this->mcpApiKeyRepository->save($mcpKey);

        return $this->json(['message' => 'Clé révoquée avec succès.']);
    }
}
