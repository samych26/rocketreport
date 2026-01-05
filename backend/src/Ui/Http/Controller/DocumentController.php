<?php

namespace App\Ui\Http\Controller;

use App\Application\UseCase\Document\GenerateDocument\GenerateDocumentCommand;
use App\Application\UseCase\Document\GenerateDocument\GenerateDocumentHandler;
use App\Domain\Exception\TemplateNotFoundException;
use App\Domain\Exception\ApiSourceNotFoundException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/documents')]
final class DocumentController extends AbstractController
{
    #[Route('/generate', methods: ['POST'])]
    public function generate(Request $request, GenerateDocumentHandler $handler): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        try {
            $user = $this->getUser();
            $userId = ($user instanceof \App\Infrastructure\Persistence\Doctrine\Entity\UserEntity) ? $user->getId() : null;

            $command = new GenerateDocumentCommand(
                $data['templateId'],
                $data['apiSourceIds'] ?? [],
                $data['outputFormat'] ?? 'HTML',
                $userId,
                $data['overrideData'] ?? []
            );

            $result = $handler->handle($command);

            return new JsonResponse($result, Response::HTTP_OK);
        } catch (TemplateNotFoundException | ApiSourceNotFoundException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'An error occurred during document generation: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
