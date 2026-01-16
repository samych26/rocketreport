<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\CodeProcessor;

use App\Application\Service\CodeProcessorService;
use App\Application\Service\DocumentService;
use App\Domain\Entity\User;
use App\Infrastructure\External\CodeExecution\JavaScriptSandboxService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/documents/{docId}/code')]
#[IsGranted('ROLE_USER')]
final class CodeProcessorController extends AbstractController
{
    public function __construct(
        private CodeProcessorService $codeProcessorService,
        private DocumentService $documentService,
        private JavaScriptSandboxService $sandboxService,
    ) {}

    /**
     * POST /api/documents/{docId}/code
     * Crée ou met à jour le code processor d'un document
     */
    #[Route('', name: 'code_processor_create', methods: ['POST'])]
    public function create(int $docId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['code'])) {
            return new JsonResponse(['error' => 'Code is required'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si un code processor existe déjà
        $existingCodeProcessor = $this->codeProcessorService->getCodeProcessorByDocument($document);
        if ($existingCodeProcessor) {
            return new JsonResponse(
                ['error' => 'Code processor already exists for this document. Use PATCH to update.'],
                Response::HTTP_CONFLICT
            );
        }

        $codeProcessor = $this->codeProcessorService->createCodeProcessor(
            document: $document,
            code: $data['code'],
            description: $data['description'] ?? null,
        );

        return new JsonResponse([
            'id' => $codeProcessor->getId(),
            'document_id' => $codeProcessor->getDocument()->getId(),
            'code' => $codeProcessor->getCode(),
            'description' => $codeProcessor->getDescription(),
            'status' => $codeProcessor->getStatus(),
            'created_at' => $codeProcessor->getCreatedAt()->format('Y-m-d H:i:s'),
        ], Response::HTTP_CREATED);
    }

    /**
     * GET /api/documents/{docId}/code
     * Récupère le code processor d'un document
     */
    #[Route('', name: 'code_processor_get', methods: ['GET'])]
    public function get(int $docId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $codeProcessor = $this->codeProcessorService->getCodeProcessorByDocument($document);
        if (!$codeProcessor) {
            return new JsonResponse(['error' => 'Code processor not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'id' => $codeProcessor->getId(),
            'document_id' => $codeProcessor->getDocument()->getId(),
            'code' => $codeProcessor->getCode(),
            'description' => $codeProcessor->getDescription(),
            'status' => $codeProcessor->getStatus(),
            'created_at' => $codeProcessor->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $codeProcessor->getUpdatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * PATCH /api/documents/{docId}/code
     * Met à jour le code processor
     */
    #[Route('', name: 'code_processor_update', methods: ['PATCH'])]
    public function update(int $docId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $codeProcessor = $this->codeProcessorService->getCodeProcessorByDocument($document);
        if (!$codeProcessor) {
            return new JsonResponse(['error' => 'Code processor not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $codeProcessor = $this->codeProcessorService->updateCodeProcessor($codeProcessor, $data);

        return new JsonResponse([
            'id' => $codeProcessor->getId(),
            'document_id' => $codeProcessor->getDocument()->getId(),
            'code' => $codeProcessor->getCode(),
            'description' => $codeProcessor->getDescription(),
            'status' => $codeProcessor->getStatus(),
            'updated_at' => $codeProcessor->getUpdatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * POST /api/documents/{docId}/code/test
     * Teste le code avec des données de test
     */
    #[Route('/test', name: 'code_processor_test', methods: ['POST'])]
    public function test(int $docId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $codeProcessor = $this->codeProcessorService->getCodeProcessorByDocument($document);
        if (!$codeProcessor) {
            return new JsonResponse(['error' => 'Code processor not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['test_data'])) {
            return new JsonResponse(['error' => 'test_data is required'], Response::HTTP_BAD_REQUEST);
        }

        // Exécuter le code dans le sandbox
        $result = $this->sandboxService->test($codeProcessor->getCode(), $data['test_data']);

        return new JsonResponse($result);
    }
}
