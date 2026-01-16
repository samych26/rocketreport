<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\ApiSource;

use App\Application\Service\ApiSourceService;
use App\Domain\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/api-sources', name: 'api_sources.')]
final class ApiSourceController extends AbstractController
{
    public function __construct(private ApiSourceService $apiSourceService) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $apiSources = $this->apiSourceService->getApiSourcesByUser($user);

        $data = array_map(fn($source) => [
            'id' => $source->getId(),
            'name' => $source->getName(),
            'description' => $source->getDescription(),
            'url_base' => $source->getUrlBase(),
            'auth_type' => $source->getAuthType(),
            'status' => $source->getStatus(),
            'created_at' => $source->getCreatedAt()->format('c'),
            'updated_at' => $source->getUpdatedAt()->format('c'),
        ], $apiSources);

        return $this->json([
            'message' => 'Liste des API sources recuperee avec succes',
            'data' => $data,
        ], Response::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || !isset($data['url_base'])) {
            return $this->json(['error' => 'name et url_base sont requis'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $apiSource = $this->apiSourceService->createApiSource(
                $user,
                $data['name'],
                $data['url_base'],
                $data['auth_type'] ?? 'none',
                $data['auth_token'] ?? null,
                $data['headers'] ?? null,
            );

            return $this->json([
                'message' => 'API source creee avec succes',
                'data' => [
                    'id' => $apiSource->getId(),
                    'name' => $apiSource->getName(),
                    'description' => $apiSource->getDescription(),
                    'url_base' => $apiSource->getUrlBase(),
                    'auth_type' => $apiSource->getAuthType(),
                    'status' => $apiSource->getStatus(),
                    'created_at' => $apiSource->getCreatedAt()->format('c'),
                ],
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $apiSource = $this->apiSourceService->getApiSource($id, $user);

        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'message' => 'API source recuperee avec succes',
            'data' => [
                'id' => $apiSource->getId(),
                'name' => $apiSource->getName(),
                'description' => $apiSource->getDescription(),
                'url_base' => $apiSource->getUrlBase(),
                'auth_type' => $apiSource->getAuthType(),
                'status' => $apiSource->getStatus(),
                'created_at' => $apiSource->getCreatedAt()->format('c'),
                'updated_at' => $apiSource->getUpdatedAt()->format('c'),
            ],
        ], Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $apiSource = $this->apiSourceService->getApiSource($id, $user);

        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        try {
            $updated = $this->apiSourceService->updateApiSource($apiSource, $data);

            return $this->json([
                'message' => 'API source mise a jour avec succes',
                'data' => [
                    'id' => $updated->getId(),
                    'name' => $updated->getName(),
                    'description' => $updated->getDescription(),
                    'url_base' => $updated->getUrlBase(),
                    'auth_type' => $updated->getAuthType(),
                    'status' => $updated->getStatus(),
                    'updated_at' => $updated->getUpdatedAt()->format('c'),
                ],
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $apiSource = $this->apiSourceService->getApiSource($id, $user);

        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->apiSourceService->deleteApiSource($apiSource);
            return $this->json([
                'message' => 'API source supprimee avec succes',
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    #[Route('/{id}/test', name: 'test', methods: ['POST'])]
    public function test(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $apiSource = $this->apiSourceService->getApiSource($id, $user);

        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        $client = new \GuzzleHttp\Client();
        $requestOptions = ['headers' => []];

        // Authentification
        switch ($apiSource->getAuthType()) {
            case 'bearer':
                $requestOptions['headers']['Authorization'] = 'Bearer ' . $apiSource->getAuthToken();
                break;
            case 'basic':
                $requestOptions['headers']['Authorization'] = 'Basic ' . base64_encode($apiSource->getAuthToken());
                break;
            case 'api_key':
                $requestOptions['headers']['X-API-Key'] = $apiSource->getAuthToken();
                break;
        }

        // Headers custom
        if ($apiSource->getHeaders()) {
            foreach ($apiSource->getHeaders() as $key => $value) {
                $requestOptions['headers'][$key] = $value;
            }
        }

        try {
            $response = $client->request('GET', $apiSource->getUrlBase(), $requestOptions);
            
            return $this->json([
                'success' => true,
                'status_code' => $response->getStatusCode(),
                'message' => 'Connection successful',
                'response_summary' => substr($response->getBody()->getContents(), 0, 500) . '...'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}
