<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\ApiEndpoint;

use App\Application\Service\ApiEndpointService;
use App\Application\Service\ApiSourceService;
use App\Domain\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/api-sources/{sourceId}/endpoints')]
#[IsGranted('ROLE_USER')]
final class ApiEndpointController extends AbstractController
{
    public function __construct(
        private ApiEndpointService $apiEndpointService,
        private ApiSourceService $apiSourceService,
    ) {}

    #[Route('', name: 'api_endpoints_list', methods: ['GET'])]
    public function list(int $sourceId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $apiSource = $this->apiSourceService->getApiSource($sourceId, $user);
        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        $endpoints = $this->apiEndpointService->getApiEndpointsBySource($apiSource);

        $data = array_map(fn($e) => [
            'id' => $e->getId(),
            'name' => $e->getName(),
            'description' => $e->getDescription(),
            'path' => $e->getPath(),
            'method' => $e->getMethod(),
            'variables' => $e->getVariables(),
            'query_params' => $e->getQueryParams(),
            'path_params' => $e->getPathParams(),
            'body_schema' => $e->getBodySchema(),
            'created_at' => $e->getCreatedAt()->format('c'),
            'updated_at' => $e->getUpdatedAt()->format('c'),
        ], $endpoints);

        return $this->json(['data' => $data]);
    }

    #[Route('', name: 'api_endpoints_create', methods: ['POST'])]
    public function create(int $sourceId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $apiSource = $this->apiSourceService->getApiSource($sourceId, $user);
        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['path'])) {
            return $this->json(['error' => 'name and path are required'], Response::HTTP_BAD_REQUEST);
        }

        $endpoint = $this->apiEndpointService->createApiEndpoint(
            $apiSource,
            $data['name'],
            $data['path'],
            $data['method'] ?? 'GET',
            $data['variables'] ?? null,
            $data['query_params'] ?? null,
            $data['path_params'] ?? null,
            $data['body_schema'] ?? null
        );

        if (!empty($data['description'])) {
            $endpoint = $this->apiEndpointService->updateApiEndpoint($endpoint, ['description' => $data['description']]);
        }

        return $this->json([
            'id' => $endpoint->getId(),
            'name' => $endpoint->getName(),
            'path' => $endpoint->getPath(),
            'method' => $endpoint->getMethod(),
            'variables' => $endpoint->getVariables(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_endpoints_update', methods: ['PATCH'])]
    public function update(int $sourceId, int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $apiSource = $this->apiSourceService->getApiSource($sourceId, $user);
        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        $endpoint = $this->apiEndpointService->getApiEndpoint($id, $apiSource);
        if (!$endpoint) {
            return $this->json(['error' => 'Api Endpoint not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $updated = $this->apiEndpointService->updateApiEndpoint($endpoint, $data);

        return $this->json([
            'id' => $updated->getId(),
            'name' => $updated->getName(),
            'path' => $updated->getPath(),
            'method' => $updated->getMethod(),
            'variables' => $updated->getVariables(),
            'updated_at' => $updated->getUpdatedAt()->format('c'),
        ]);
    }

    #[Route('/{id}', name: 'api_endpoints_delete', methods: ['DELETE'])]
    public function delete(int $sourceId, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $apiSource = $this->apiSourceService->getApiSource($sourceId, $user);
        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        $endpoint = $this->apiEndpointService->getApiEndpoint($id, $apiSource);
        if (!$endpoint) {
            return $this->json(['error' => 'Api Endpoint not found'], Response::HTTP_NOT_FOUND);
        }

        $this->apiEndpointService->deleteApiEndpoint($endpoint);

        return $this->json(['message' => 'API Endpoint deleted']);
    }

    #[Route('/{id}/test', name: 'api_endpoints_test', methods: ['POST'])]
    public function test(int $sourceId, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $apiSource = $this->apiSourceService->getApiSource($sourceId, $user);
        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        $endpoint = $this->apiEndpointService->getApiEndpoint($id, $apiSource);
        if (!$endpoint) {
            return $this->json(['error' => 'Api Endpoint not found'], Response::HTTP_NOT_FOUND);
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

        $url = rtrim($apiSource->getUrlBase(), '/') . '/' . ltrim($endpoint->getPath(), '/');

        try {
            $response = $client->request($endpoint->getMethod(), $url, $requestOptions);
            $content = $response->getBody()->getContents();
            $data = json_decode($content, true);

            $requestedVariables = $endpoint->getVariables();
            $finalData = [];
            $missingVariables = [];

            if (!empty($requestedVariables)) {
                // Fonction d'extraction récursive pour un objet donné
                $extractFromItem = function($item, $requestedPaths) use (&$missingVariables) {
                    $filteredItem = [];
                    foreach ($requestedPaths as $path) {
                        $value = $item;
                        $parts = explode('.', $path);
                        $found = true;
                        
                        foreach ($parts as $part) {
                            if (is_array($value) && isset($value[$part])) {
                                $value = $value[$part];
                            } else {
                                $found = false;
                                break;
                            }
                        }

                        if ($found) {
                            $filteredItem[$path] = $value;
                        } else {
                            if (!in_array($path, $missingVariables)) {
                                $missingVariables[] = $path;
                            }
                        }
                    }
                    return $filteredItem;
                };

                // Si c'est une liste d'objets, on filtre chaque objet
                if (is_array($data) && isset($data[0]) && is_array($data[0])) {
                    foreach ($data as $item) {
                        $finalData[] = $extractFromItem($item, $requestedVariables);
                    }
                } else {
                    // Sinon on filtre l'objet unique
                    $finalData = $extractFromItem($data, $requestedVariables);
                }
            } else {
                $finalData = $data;
            }

            $hasMissing = !empty($requestedVariables) && !empty($missingVariables);

            return $this->json([
                'success' => !$hasMissing,
                'status_code' => $response->getStatusCode(),
                'data' => $finalData,
                'missing_variables' => $missingVariables,
                'error' => $hasMissing ? 'Certaines variables demandées n\'ont pas été trouvées dans la réponse API.' : null,
                'message' => $hasMissing ? 'Erreur de configuration' : 'Données récupérées avec succès'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}
