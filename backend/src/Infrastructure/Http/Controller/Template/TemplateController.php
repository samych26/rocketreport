<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\Template;

use App\Application\Service\TemplateService;
use App\Application\Service\DocumentService;
use App\Domain\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/documents/{docId}/templates')]
#[IsGranted('ROLE_USER')]
final class TemplateController extends AbstractController
{
    public function __construct(
        private TemplateService $templateService,
        private DocumentService $documentService,
    ) {}

    /**
     * POST /api/documents/{docId}/templates
     * Crée un nouveau template pour un document
     */
    #[Route('', name: 'template_create', methods: ['POST'])]
    public function create(int $docId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        // Vérifier que le document existe et appartient à l'utilisateur
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si un template existe déjà
        $existingTemplate = $this->templateService->getTemplateByDocument($document);
        if ($existingTemplate) {
            return new JsonResponse(
                ['error' => 'Template already exists for this document. Use PATCH to update.'],
                Response::HTTP_CONFLICT
            );
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['content'])) {
            return new JsonResponse(['error' => 'Content is required'], Response::HTTP_BAD_REQUEST);
        }

        // Valider la syntaxe Handlebars
        $validationErrors = $this->templateService->validateHandlebars($data['content']);
        if (!empty($validationErrors)) {
            return new JsonResponse([
                'error' => 'Invalid Handlebars syntax',
                'details' => $validationErrors,
            ], Response::HTTP_BAD_REQUEST);
        }

        $template = $this->templateService->createTemplate(
            document: $document,
            content: $data['content'],
            outputFormat: $data['output_format'] ?? 'pdf',
            description: $data['description'] ?? null,
        );

        return new JsonResponse([
            'id' => $template->getId(),
            'document_id' => $template->getDocument()->getId(),
            'content' => $template->getContent(),
            'output_format' => $template->getOutputFormat(),
            'description' => $template->getDescription(),
            'status' => $template->getStatus(),
            'created_at' => $template->getCreatedAt()->format('Y-m-d H:i:s'),
        ], Response::HTTP_CREATED);
    }

    /**
     * GET /api/documents/{docId}/templates
     * Récupère le template d'un document
     */
    #[Route('', name: 'template_get_by_document', methods: ['GET'])]
    public function getByDocument(int $docId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $template = $this->templateService->getTemplateByDocument($document);
        if (!$template) {
            return new JsonResponse(['error' => 'Template not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'id' => $template->getId(),
            'document_id' => $template->getDocument()->getId(),
            'content' => $template->getContent(),
            'output_format' => $template->getOutputFormat(),
            'description' => $template->getDescription(),
            'status' => $template->getStatus(),
            'created_at' => $template->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $template->getUpdatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * GET /api/documents/{docId}/templates/{templateId}
     * Récupère un template spécifique
     */
    #[Route('/{templateId}', name: 'template_get', methods: ['GET'])]
    public function get(int $docId, int $templateId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $template = $this->templateService->getTemplate($templateId);
        if (!$template || $template->getDocument()->getId() !== $document->getId()) {
            return new JsonResponse(['error' => 'Template not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'id' => $template->getId(),
            'document_id' => $template->getDocument()->getId(),
            'content' => $template->getContent(),
            'output_format' => $template->getOutputFormat(),
            'description' => $template->getDescription(),
            'status' => $template->getStatus(),
            'created_at' => $template->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $template->getUpdatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * PATCH /api/documents/{docId}/templates/{templateId}
     * Met à jour un template
     */
    #[Route('/{templateId}', name: 'template_update', methods: ['PATCH'])]
    public function update(int $docId, int $templateId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $template = $this->templateService->getTemplate($templateId);
        if (!$template || $template->getDocument()->getId() !== $document->getId()) {
            return new JsonResponse(['error' => 'Template not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        // Valider la syntaxe Handlebars si le contenu est modifié
        if (isset($data['content'])) {
            $validationErrors = $this->templateService->validateHandlebars($data['content']);
            if (!empty($validationErrors)) {
                return new JsonResponse([
                    'error' => 'Invalid Handlebars syntax',
                    'details' => $validationErrors,
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        $template = $this->templateService->updateTemplate($template, $data);

        return new JsonResponse([
            'id' => $template->getId(),
            'document_id' => $template->getDocument()->getId(),
            'content' => $template->getContent(),
            'output_format' => $template->getOutputFormat(),
            'description' => $template->getDescription(),
            'status' => $template->getStatus(),
            'updated_at' => $template->getUpdatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * DELETE /api/documents/{docId}/templates/{templateId}
     * Supprime un template
     */
    #[Route('/{templateId}', name: 'template_delete', methods: ['DELETE'])]
    public function delete(int $docId, int $templateId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return new JsonResponse(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $template = $this->templateService->getTemplate($templateId);
        if (!$template || $template->getDocument()->getId() !== $document->getId()) {
            return new JsonResponse(['error' => 'Template not found'], Response::HTTP_NOT_FOUND);
        }

        $this->templateService->deleteTemplate($template);

        return new JsonResponse(['message' => 'Template deleted successfully'], Response::HTTP_OK);
    }
}
