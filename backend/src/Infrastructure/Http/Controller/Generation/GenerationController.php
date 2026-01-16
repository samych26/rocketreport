<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\Generation;

use App\Application\Service\DocumentGenerationService;
use App\Application\Service\DocumentService;
use App\Domain\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/documents/{docId}/generations')]
#[IsGranted('ROLE_USER')]
final class GenerationController extends AbstractController
{
    public function __construct(
        private DocumentGenerationService $generationService,
        private DocumentService $documentService,
    ) {}

    /**
     * POST /api/documents/{docId}/generate
     * Lance une nouvelle génération de document
     */
    #[Route('/generate', name: 'document_generate', methods: ['POST'])]
    public function generate(int $docId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $params = $data['params'] ?? [];

        try {
            $generation = $this->generationService->generateDocument($document, $params);
            
            if ($generation->getStatus() === 'failed') {
                return new JsonResponse([
                    'status' => 'failed',
                    'error' => $generation->getErrorMessage(),
                    'execution_logs' => $generation->getExecutionLogs(),
                ], Response::HTTP_BAD_REQUEST);
            }

            return new JsonResponse([
                'id' => $generation->getId(),
                'status' => $generation->getStatus(),
                'file_path' => $generation->getFilePath(),
                'created_at' => $generation->getCreatedAt()->format('Y-m-d H:i:s'),
                'download_url' => $this->generateUrl('generation_download', [
                    'docId' => $docId,
                    'genId' => $generation->getId()
                ]),
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/documents/{docId}/generations
     * Liste l'historique des générations
     */
    #[Route('', name: 'generation_list', methods: ['GET'])]
    public function list(int $docId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $generations = $this->generationService->getGenerationsByDocument($document);
        
        $response = [];
        foreach ($generations as $gen) {
            $response[] = [
                'id' => $gen->getId(),
                'status' => $gen->getStatus(),
                'created_at' => $gen->getCreatedAt()->format('Y-m-d H:i:s'),
                'output_format' => $gen->getOutputFormat(),
                'has_error' => $gen->getStatus() === 'failed',
            ];
        }

        return new JsonResponse($response);
    }

    /**
     * GET /api/documents/{docId}/generations/{genId}
     * Détails d'une génération
     */
    #[Route('/{genId}', name: 'generation_details', methods: ['GET'])]
    public function details(int $docId, int $genId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $generation = $this->generationService->getGeneration($genId);
        
        if (!$generation || $generation->getDocument()->getId() !== $document->getId()) {
            return new JsonResponse(['error' => 'Generation not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'id' => $generation->getId(),
            'status' => $generation->getStatus(),
            'input_params' => $generation->getInputParams(),
            'api_response' => $generation->getApiResponse(),
            'processed_data' => $generation->getProcessedData(),
            'logs' => $generation->getExecutionLogs(),
            'error_message' => $generation->getErrorMessage(),
            'created_at' => $generation->getCreatedAt()->format('Y-m-d H:i:s'),
            'file_path' => $generation->getFilePath(),
        ]);
    }

    /**
     * GET /api/documents/{docId}/generations/{genId}/download
     * Télécharge le fichier généré
     */
    #[Route('/{genId}/download', name: 'generation_download', methods: ['GET'])]
    public function download(int $docId, int $genId): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $generation = $this->generationService->getGeneration($genId);
        
        if (!$generation || $generation->getDocument()->getId() !== $document->getId()) {
            return new JsonResponse(['error' => 'Generation not found'], Response::HTTP_NOT_FOUND);
        }

        $filePath = $generation->getFilePath();
        
        if (!$filePath || !file_exists($filePath)) {
            return new JsonResponse(['error' => 'File not found or deleted'], Response::HTTP_NOT_FOUND);
        }

        $response = new BinaryFileResponse($filePath);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            basename($filePath)
        );

        return $response;
    }
}
