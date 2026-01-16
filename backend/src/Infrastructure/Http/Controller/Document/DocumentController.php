<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\Document;

use App\Application\Service\DocumentService;
use App\Application\Service\ApiSourceService;
use App\Domain\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/documents', name: 'documents.')]
final class DocumentController extends AbstractController
{
    public function __construct(
        private DocumentService $documentService,
        private ApiSourceService $apiSourceService,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $documents = $this->documentService->getDocumentsByUser($user);

        $data = array_map(fn($doc) => [
            'id' => $doc->getId(),
            'name' => $doc->getName(),
            'description' => $doc->getDescription(),
            'api_source_id' => $doc->getApiSource()->getId(),
            'endpoint' => $doc->getEndpoint(),
            'method' => $doc->getMethod(),
            'query_params' => $doc->getQueryParams(),
            'path_params' => $doc->getPathParams(),
            'body_schema' => $doc->getBodySchema(),
            'status' => $doc->getStatus(),
            'created_at' => $doc->getCreatedAt()->format('c'),
        ], $documents);

        return $this->json([
            'message' => 'Liste des documents recue avec succes',
            'data' => $data,
        ], Response::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || !isset($data['api_source_id']) || !isset($data['endpoint'])) {
            return $this->json(['error' => 'name, api_source_id et endpoint sont requis'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifie que l'API source appartient à l'utilisateur
        $apiSource = $this->apiSourceService->getApiSource($data['api_source_id'], $user);
        if (!$apiSource) {
            return $this->json(['error' => 'API Source not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $document = $this->documentService->createDocument(
                $user,
                $apiSource,
                $data['name'],
                $data['endpoint'],
                $data['method'] ?? 'GET',
                $data['query_params'] ?? null,
                $data['path_params'] ?? null,
                $data['body_schema'] ?? null,
            );

            return $this->json([
                'message' => 'Document cree avec succes',
                'data' => [
                    'id' => $document->getId(),
                    'name' => $document->getName(),
                    'description' => $document->getDescription(),
                    'api_source_id' => $document->getApiSource()->getId(),
                    'endpoint' => $document->getEndpoint(),
                    'method' => $document->getMethod(),
                    'query_params' => $document->getQueryParams(),
                    'path_params' => $document->getPathParams(),
                    'body_schema' => $document->getBodySchema(),
                    'status' => $document->getStatus(),
                    'created_at' => $document->getCreatedAt()->format('c'),
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

        $document = $this->documentService->getDocument($id, $user);

        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'message' => 'Document recupere avec succes',
            'data' => [
                'id' => $document->getId(),
                'name' => $document->getName(),
                'description' => $document->getDescription(),
                'api_source_id' => $document->getApiSource()->getId(),
                'endpoint' => $document->getEndpoint(),
                'method' => $document->getMethod(),
                'query_params' => $document->getQueryParams(),
                'path_params' => $document->getPathParams(),
                'body_schema' => $document->getBodySchema(),
                'status' => $document->getStatus(),
                'created_at' => $document->getCreatedAt()->format('c'),
                'updated_at' => $document->getUpdatedAt()->format('c'),
            ],
        ], Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $document = $this->documentService->getDocument($id, $user);

        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        try {
            $updated = $this->documentService->updateDocument($document, $data);

            return $this->json([
                'message' => 'Document mis a jour avec succes',
                'data' => [
                    'id' => $updated->getId(),
                    'name' => $updated->getName(),
                    'description' => $updated->getDescription(),
                    'api_source_id' => $updated->getApiSource()->getId(),
                    'endpoint' => $updated->getEndpoint(),
                    'method' => $updated->getMethod(),
                    'query_params' => $updated->getQueryParams(),
                    'path_params' => $updated->getPathParams(),
                    'body_schema' => $updated->getBodySchema(),
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

        $document = $this->documentService->getDocument($id, $user);

        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->documentService->deleteDocument($document);
            return $this->json([
                'message' => 'Document supprime avec succes',
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    #[Route('/{id}/duplicate', name: 'duplicate', methods: ['POST'])]
    public function duplicate(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $document = $this->documentService->getDocument($id, $user);

        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $newDocument = $this->documentService->createDocument(
                $user,
                $document->getApiSource(),
                $document->getName() . ' (Copy)',
                $document->getEndpoint(),
                $document->getMethod(),
                $document->getQueryParams(),
                $document->getPathParams(),
                $document->getBodySchema(),
            );

            return $this->json([
                'message' => 'Document duplique avec succes',
                'data' => [
                    'id' => $newDocument->getId(),
                    'name' => $newDocument->getName(),
                    'description' => $newDocument->getDescription(),
                    'api_source_id' => $newDocument->getApiSource()->getId(),
                    'endpoint' => $newDocument->getEndpoint(),
                    'method' => $newDocument->getMethod(),
                    'status' => $newDocument->getStatus(),
                    'created_at' => $newDocument->getCreatedAt()->format('c'),
                ],
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
