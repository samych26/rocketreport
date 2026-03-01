<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\Template;

use App\Application\Service\TemplateService;
use App\Domain\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/templates')]
#[IsGranted('ROLE_USER')]
final class StandaloneTemplateController extends AbstractController
{
    public function __construct(
        private TemplateService $templateService,
    ) {}

    /** GET /api/templates — liste tous les templates de l'utilisateur */
    #[Route('', name: 'templates_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $templates = $this->templateService->getTemplatesByUser($user);

        return $this->json([
            'data' => array_map(fn($t) => $this->templateService->serialize($t), $templates),
        ]);
    }

    /** POST /api/templates — crée un template standalone */
    #[Route('', name: 'templates_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (empty($data['name'])) {
            return $this->json(['error' => 'Le champ "name" est requis'], Response::HTTP_BAD_REQUEST);
        }
        if (empty($data['content'])) {
            return $this->json(['error' => 'Le champ "content" est requis'], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->templateService->validateHandlebars($data['content']);
        if (!empty($errors)) {
            return $this->json(['error' => 'Syntaxe Handlebars invalide', 'details' => $errors], Response::HTTP_BAD_REQUEST);
        }

        $template = $this->templateService->createStandaloneTemplate(
            user: $user,
            name: $data['name'],
            content: $data['content'],
            outputFormat: $data['output_format'] ?? 'pdf',
            description: $data['description'] ?? null,
        );

        return $this->json($this->templateService->serialize($template), Response::HTTP_CREATED);
    }

    /** PATCH /api/templates/{id} — modifie un template */
    #[Route('/{id}', name: 'templates_update', methods: ['PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $template = $this->templateService->getTemplate($id);

        if (!$template || $template->getOwner()?->getId() !== $user->getId()) {
            return $this->json(['error' => 'Template non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['content'])) {
            $errors = $this->templateService->validateHandlebars($data['content']);
            if (!empty($errors)) {
                return $this->json(['error' => 'Syntaxe Handlebars invalide', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }
        }

        $template = $this->templateService->updateTemplate($template, $data);
        return $this->json($this->templateService->serialize($template));
    }

    /** DELETE /api/templates/{id} — supprime un template */
    #[Route('/{id}', name: 'templates_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $template = $this->templateService->getTemplate($id);

        if (!$template || $template->getOwner()?->getId() !== $user->getId()) {
            return $this->json(['error' => 'Template non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $this->templateService->deleteTemplate($template);
        return $this->json(['message' => 'Template supprimé']);
    }
}
