<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\Build;

use App\Application\Service\ApiSourceService;
use App\Application\Service\ApiEndpointService;
use App\Application\Service\CodeProcessorService;
use App\Application\Service\DocumentGenerationService;
use App\Application\Service\DocumentService;
use App\Application\Service\TemplateService;
use App\Domain\Entity\User;
use App\Infrastructure\External\CodeExecution\JavaScriptSandboxService;
use GuzzleHttp\Client;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/builds')]
#[IsGranted('ROLE_USER')]
final class BuildController extends AbstractController
{
    public function __construct(
        private DocumentService           $documentService,
        private ApiSourceService          $apiSourceService,
        private ApiEndpointService        $apiEndpointService,
        private CodeProcessorService      $codeProcessorService,
        private TemplateService           $templateService,
        private DocumentGenerationService $generationService,
        private JavaScriptSandboxService  $sandboxService,
    ) {}

    /** GET /api/builds */
    #[Route('', name: 'builds_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $documents = $this->documentService->getDocumentsByUser($user);
        return $this->json(['data' => array_map([$this, 'serialize'], $documents)]);
    }

    /** POST /api/builds */
    #[Route('', name: 'builds_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        foreach (['name', 'api_endpoint_id', 'code'] as $f) {
            if (empty($data[$f])) {
                return $this->json(['error' => "Le champ \"{$f}\" est requis."], Response::HTTP_BAD_REQUEST);
            }
        }

        $apiEndpoint = $this->apiEndpointService->getApiEndpointByIdAndUser((int)$data['api_endpoint_id'], $user);
        if (!$apiEndpoint) {
            return $this->json(['error' => 'API Endpoint introuvable ou vous ne le possédez pas.'], Response::HTTP_NOT_FOUND);
        }

        $document = $this->documentService->createDocument(
            $user, 
            $apiEndpoint->getApiSource(), 
            $apiEndpoint, 
            $data['name']
        );
        if (!empty($data['description'])) {
            $document->setDescription($data['description']);
        }

        $this->codeProcessorService->createCodeProcessor($document, $data['code']);

        if (!empty($data['template_id'])) {
            $tpl = $this->templateService->getTemplate((int)$data['template_id']);
            if ($tpl && $tpl->getOwner()?->getId() === $user->getId()) {
                $tpl->setDocument($document);
                $this->templateService->saveTemplate($tpl);
            }
        }

        return $this->json($this->serialize($document), Response::HTTP_CREATED);
    }

    /** PATCH /api/builds/{id} */
    #[Route('/{id}', name: 'builds_update', methods: ['PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $document = $this->documentService->getDocument($id, $user);
        if (!$document) {
            return $this->json(['error' => 'Build introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        $docFields = array_intersect_key($data, array_flip(['name','description','status']));
        if (isset($data['api_endpoint_id'])) {
            $apiEndpoint = $this->apiEndpointService->getApiEndpointByIdAndUser((int)$data['api_endpoint_id'], $user);
            if ($apiEndpoint) {
                $docFields['api_endpoint'] = $apiEndpoint;
            }
        }
        $this->documentService->updateDocument($document, $docFields);

        if (isset($data['code'])) {
            $cp = $this->codeProcessorService->getCodeProcessorByDocument($document);
            $cp
                ? $this->codeProcessorService->updateCodeProcessor($cp, ['code' => $data['code']])
                : $this->codeProcessorService->createCodeProcessor($document, $data['code']);
        }

        if (array_key_exists('template_id', $data)) {
            $oldTpl = $document->getTemplate();
            if ($oldTpl) { $oldTpl->setDocument(null); $this->templateService->saveTemplate($oldTpl); }

            if ($data['template_id'] !== null) {
                $newTpl = $this->templateService->getTemplate((int)$data['template_id']);
                if ($newTpl && $newTpl->getOwner()?->getId() === $user->getId()) {
                    $newTpl->setDocument($document);
                    $this->templateService->saveTemplate($newTpl);
                }
            }
        }

        $document = $this->documentService->getDocument($id, $user);
        return $this->json($this->serialize($document));
    }

    /** DELETE /api/builds/{id} */
    #[Route('/{id}', name: 'builds_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $document = $this->documentService->getDocument($id, $user);
        if (!$document) {
            return $this->json(['error' => 'Build introuvable.'], Response::HTTP_NOT_FOUND);
        }
        $this->documentService->deleteDocument($document);
        return $this->json(['message' => 'Build supprimé.']);
    }

    /**
     * POST /api/builds/preview-data
     * { api_source_id, endpoint, method?, query_params?, body? }
     */
    #[Route('/preview-data', name: 'builds_preview_data', methods: ['POST'])]
    public function previewData(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $apiSource = null;
        $path = '';
        $method = 'GET';
        $queryParams = [];
        $headers = [];
        $body = null;

        if (!empty($data['api_endpoint_id'])) {
            $apiEndpoint = $this->apiEndpointService->getApiEndpointByIdAndUser((int)$data['api_endpoint_id'], $user);
            if (!$apiEndpoint) {
                return $this->json(['error' => 'API Endpoint introuvable.'], Response::HTTP_NOT_FOUND);
            }
            $apiSource = $apiEndpoint->getApiSource();
            $path = $apiEndpoint->getPath();
            $method = $apiEndpoint->getMethod();
            $queryParams = $apiEndpoint->getQueryParams() ?? [];
        } else {
            if (empty($data['api_source_id']) || empty($data['endpoint'])) {
                return $this->json(['error' => 'api_source_id et endpoint (ou api_endpoint_id) sont requis.'], Response::HTTP_BAD_REQUEST);
            }
            $apiSource = $this->apiSourceService->getApiSource((int)$data['api_source_id'], $user);
            $path = $data['endpoint'];
            $method = $data['method'] ?? 'GET';
            $queryParams = $data['query_params'] ?? [];
            $body = $data['body'] ?? null;
        }

        if (!$apiSource) {
            return $this->json(['error' => 'Source API introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $url = rtrim($apiSource->getUrlBase(), '/') . '/' . ltrim($path, '/');
        $method  = strtoupper($method);
        $options = ['headers' => [], 'timeout' => 10, 'query' => $queryParams];

        match ($apiSource->getAuthType()) {
            'bearer'  => $options['headers']['Authorization'] = 'Bearer ' . $apiSource->getAuthToken(),
            'api_key' => $options['headers']['X-API-Key']     = $apiSource->getAuthToken(),
            'basic'   => $options['headers']['Authorization'] = 'Basic ' . base64_encode((string)$apiSource->getAuthToken()),
            default   => null,
        };

        foreach ($apiSource->getHeaders() ?? [] as $k => $v) {
            $options['headers'][$k] = $v;
        }

        if ($body && in_array($method, ['POST','PUT','PATCH'], true)) {
            $options['json'] = $body;
        }

        try {
            $client   = new Client(['http_errors' => false]);
            $response = $client->request($method, $url, $options);
            $body     = $response->getBody()->getContents();
            $decoded  = json_decode($body, true);

            return $this->json([
                'success'     => true,
                'status_code' => $response->getStatusCode(),
                'data'        => $decoded ?? $body,
                'is_json'     => $decoded !== null,
            ]);
        } catch (\Throwable $e) {
            return $this->json(['success' => false, 'error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * POST /api/builds/run-code
     * { code, data }
     */
    #[Route('/run-code', name: 'builds_run_code', methods: ['POST'])]
    public function runCode(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['code'])) {
            return $this->json(['error' => 'code est requis.'], Response::HTTP_BAD_REQUEST);
        }
        $result = $this->sandboxService->test($data['code'], $data['data'] ?? [], $data['language'] ?? 'javascript');
        return $this->json($result);
    }

    /**
     * GET /api/builds/{id}/data
     * Récupère la donnée depuis l'API sans générer de document
     */
    #[Route('/{id}/data', name: 'builds_fetch_data', methods: ['GET'])]
    public function fetchData(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $document = $this->documentService->getDocument($id, $user);
        if (!$document) {
            return $this->json(['error' => 'Build introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $apiEndpoint = $document->getApiEndpoint();
        $apiSource = $apiEndpoint->getApiSource();

        $url = rtrim($apiSource->getUrlBase(), '/') . '/' . ltrim($apiEndpoint->getPath(), '/');
        $options = [
            'query' => $apiEndpoint->getQueryParams() ?? [],
            'headers' => []
        ];

        match ($apiSource->getAuthType()) {
            'bearer'  => $options['headers']['Authorization'] = 'Bearer ' . $apiSource->getAuthToken(),
            'api_key' => $options['headers']['X-API-Key']     = $apiSource->getAuthToken(),
            'basic'   => $options['headers']['Authorization'] = 'Basic ' . base64_encode((string)$apiSource->getAuthToken()),
            default   => null,
        };

        foreach ($apiSource->getHeaders() ?? [] as $k => $v) {
            $options['headers'][$k] = $v;
        }

        try {
            $client   = new Client(['http_errors' => false]);
            $response = $client->request($apiEndpoint->getMethod(), $url, $options);
            $body     = $response->getBody()->getContents();
            $decoded  = json_decode($body, true);
            
            // Appliquer le filtre des variables configuré dans ApiEndpoint
            if ($decoded !== null && !empty($apiEndpoint->getVariables())) {
                $varsToKeep = $apiEndpoint->getVariables();
                if (isset($decoded[0]) && is_array($decoded[0])) {
                    $decoded = array_map(function($item) use ($varsToKeep) {
                        return array_intersect_key($item, array_flip($varsToKeep));
                    }, $decoded);
                } else {
                    $decoded = array_intersect_key($decoded, array_flip($varsToKeep));
                }
            }

            return $this->json($decoded ?? $body);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * POST /api/builds/{id}/generate
     */
    #[Route('/{id}/generate', name: 'builds_generate', methods: ['POST'])]
    public function generate(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $document = $this->documentService->getDocument($id, $user);
        if (!$document) {
            return $this->json(['error' => 'Build introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Retourner la génération existante si le fichier est encore présent
        $existing = $this->generationService->getCompletedGenerationForDocument($document);
        if ($existing !== null) {
            return $this->json([
                'id'           => $existing->getId(),
                'status'       => $existing->getStatus(),
                'build_id'     => $document->getId(),
                'build_name'   => $document->getName(),
                'created_at'   => $existing->getCreatedAt()->format('Y-m-d H:i:s'),
                'cached'       => true,
                'download_url' => $this->generateUrl('generation_download', [
                    'docId' => $document->getId(),
                    'genId' => $existing->getId(),
                ]),
            ]);
        }

        $params = json_decode($request->getContent(), true)['params'] ?? [];

        try {
            $generation = $this->generationService->generateDocument($document, $params);

            if ($generation->getStatus() === 'failed') {
                return $this->json([
                    'status' => 'failed',
                    'error'  => $generation->getErrorMessage(),
                    'logs'   => $generation->getExecutionLogs(),
                ], Response::HTTP_BAD_REQUEST);
            }

            return $this->json([
                'id'           => $generation->getId(),
                'status'       => $generation->getStatus(),
                'build_id'     => $document->getId(),
                'build_name'   => $document->getName(),
                'created_at'   => $generation->getCreatedAt()->format('Y-m-d H:i:s'),
                'cached'       => false,
                'download_url' => $this->generateUrl('generation_download', [
                    'docId' => $document->getId(),
                    'genId' => $generation->getId(),
                ]),
            ], Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            return $this->json(['status' => 'error', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function serialize(\App\Domain\Entity\Document $doc): array
    {
        $tpl = $doc->getTemplate();
        $cp  = $doc->getCodeProcessor();
        $endpoint = $doc->getApiEndpoint();

        return [
            'id'          => $doc->getId(),
            'name'        => $doc->getName(),
            'description' => $doc->getDescription(),
            'api_source'  => [
                'id'   => $doc->getApiSource()->getId(),
                'name' => $doc->getApiSource()->getName(),
                'url'  => $doc->getApiSource()->getUrlBase(),
            ],
            'api_endpoint' => [
                'id' => $endpoint->getId(),
                'path' => $endpoint->getPath(),
                'method' => $endpoint->getMethod(),
            ],
            'status'      => $doc->getStatus(),
            'code'        => $cp?->getCode(),
            'template'    => $tpl ? [
                'id'     => $tpl->getId(),
                'name'   => $tpl->getDisplayName(),
                'format' => $tpl->getOutputFormat(),
            ] : null,
            'created_at'  => $doc->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at'  => $doc->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}
