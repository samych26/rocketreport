<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\Document;

use App\Application\Service\DocumentVariableService;
use App\Application\Service\DocumentService;
use App\Domain\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/documents/{docId}/variables', name: 'document_variables.')]
final class DocumentVariableController extends AbstractController
{
    public function __construct(
        private DocumentVariableService $variableService,
        private DocumentService $documentService,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(int $docId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $variables = $this->variableService->getVariablesByDocument($document);

        $data = array_map(fn($var) => [
            'id' => $var->getId(),
            'name' => $var->getName(),
            'type' => $var->getType(),
            'json_path' => $var->getJsonPath(),
            'calculation_formula' => $var->getCalculationFormula(),
            'format' => $var->getFormat(),
            'required' => $var->isRequired(),
            'description' => $var->getDescription(),
            'default_value' => $var->getDefaultValue(),
            'created_at' => $var->getCreatedAt()->format('c'),
        ], $variables);

        return $this->json([
            'message' => 'Liste des variables recue avec succes',
            'data' => $data,
        ], Response::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(int $docId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || !isset($data['type'])) {
            return $this->json(['error' => 'name et type sont requis'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $variable = $this->variableService->createVariable(
                $document,
                $data['name'],
                $data['type'],
                $data['json_path'] ?? null,
                $data['calculation_formula'] ?? null,
                $data['format'] ?? 'string',
                $data['required'] ?? false,
                $data['default_value'] ?? null,
            );

            return $this->json([
                'message' => 'Variable creee avec succes',
                'data' => [
                    'id' => $variable->getId(),
                    'name' => $variable->getName(),
                    'type' => $variable->getType(),
                    'json_path' => $variable->getJsonPath(),
                    'calculation_formula' => $variable->getCalculationFormula(),
                    'format' => $variable->getFormat(),
                    'required' => $variable->isRequired(),
                    'created_at' => $variable->getCreatedAt()->format('c'),
                ],
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{varId}', name: 'show', methods: ['GET'])]
    public function show(int $docId, int $varId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $variable = $this->variableService->getVariablesByDocument($document);
        $variable = array_filter($variable, fn($v) => $v->getId() === $varId);
        $variable = array_pop($variable);

        if (!$variable) {
            return $this->json(['error' => 'Variable not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'message' => 'Variable recue avec succes',
            'data' => [
                'id' => $variable->getId(),
                'name' => $variable->getName(),
                'type' => $variable->getType(),
                'json_path' => $variable->getJsonPath(),
                'calculation_formula' => $variable->getCalculationFormula(),
                'format' => $variable->getFormat(),
                'required' => $variable->isRequired(),
                'description' => $variable->getDescription(),
                'default_value' => $variable->getDefaultValue(),
                'created_at' => $variable->getCreatedAt()->format('c'),
            ],
        ], Response::HTTP_OK);
    }

    #[Route('/{varId}', name: 'update', methods: ['PATCH'])]
    public function update(int $docId, int $varId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $variables = $this->variableService->getVariablesByDocument($document);
        $variable = array_filter($variables, fn($v) => $v->getId() === $varId);
        $variable = array_pop($variable);

        if (!$variable) {
            return $this->json(['error' => 'Variable not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        try {
            $updated = $this->variableService->updateVariable($variable, $data);

            return $this->json([
                'message' => 'Variable mise a jour avec succes',
                'data' => [
                    'id' => $updated->getId(),
                    'name' => $updated->getName(),
                    'type' => $updated->getType(),
                    'json_path' => $updated->getJsonPath(),
                    'calculation_formula' => $updated->getCalculationFormula(),
                    'format' => $updated->getFormat(),
                    'required' => $updated->isRequired(),
                    'updated_at' => $updated->getUpdatedAt()->format('c'),
                ],
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{varId}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $docId, int $varId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $document = $this->documentService->getDocument($docId, $user);
        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $variables = $this->variableService->getVariablesByDocument($document);
        $variable = array_filter($variables, fn($v) => $v->getId() === $varId);
        $variable = array_pop($variable);

        if (!$variable) {
            return $this->json(['error' => 'Variable not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->variableService->deleteVariable($variable);
            return $this->json([
                'message' => 'Variable supprimee avec succes',
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    #[Route('/auto-detect', name: 'auto_detect', methods: ['POST'])]
    public function autoDetect(int $docId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $document = $this->documentService->getDocument($docId, $user);

        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['sample_data'])) {
            return $this->json(['error' => 'sample_data is required'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $detectedVariables = $this->variableService->extractVariablesFromJson($document, $data['sample_data']);
            
            $existingVariables = $this->variableService->getVariablesByDocument($document);
            $existingPaths = array_map(fn($v) => $v->getJsonPath(), $existingVariables);

            $createdVariables = [];
            foreach ($detectedVariables as $var) {
                // Adapter le format JSON Path (ex: $.store.book)
                $jsonPath = '$.' . $var['json_path'];

                // Éviter les doublons
                if (in_array($jsonPath, $existingPaths)) {
                    continue;
                }

                $variable = $this->variableService->createVariable(
                    $document,
                    $var['name'],
                    'api_field',
                    $jsonPath,
                    null,
                    $var['format']
                );

                $createdVariables[] = [
                    'id' => $variable->getId(),
                    'name' => $variable->getName(),
                    'type' => $variable->getType(),
                    'json_path' => $variable->getJsonPath(),
                    'format' => $variable->getFormat(),
                ];
            }

            return $this->json([
                'message' => 'Variables detectees et ajoutees avec succes',
                'count' => count($createdVariables),
                'data' => $createdVariables,
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
