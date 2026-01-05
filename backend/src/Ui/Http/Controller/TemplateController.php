<?php

namespace App\Ui\Http\Controller;

use App\Application\UseCase\Template\CreateTemplate\CreateTemplateCommand;
use App\Application\UseCase\Template\CreateTemplate\CreateTemplateHandler;
use App\Application\UseCase\Template\DeleteTemplate\DeleteTemplateCommand;
use App\Application\UseCase\Template\DeleteTemplate\DeleteTemplateHandler;
use App\Application\UseCase\Template\GetTemplate\GetTemplateHandler;
use App\Application\UseCase\Template\GetTemplate\GetTemplateQuery;
use App\Application\UseCase\Template\ListTemplates\ListTemplatesHandler;
use App\Application\UseCase\Template\ListTemplates\ListTemplatesQuery;
use App\Application\UseCase\Template\UpdateTemplate\UpdateTemplateCommand;
use App\Application\UseCase\Template\UpdateTemplate\UpdateTemplateHandler;
use App\Domain\Exception\TemplateNotFoundException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/templates')]
final class TemplateController extends AbstractController
{
    #[Route('', methods: ['POST'])]
    public function create(Request $request, CreateTemplateHandler $handler): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $command = new CreateTemplateCommand(
            $data['name'],
            $data['content'],
            $data['variables'] ?? []
        );

        $template = $handler->handle($command);

        return new JsonResponse([
            'id' => $template->id()->value(),
            'name' => $template->name(),
            'content' => $template->content(),
            'version' => $template->version(),
            'variables' => array_map(fn($v) => [
                'name' => $v->name(),
                'type' => $v->type(),
                'required' => $v->required(),
            ], $template->variables()),
            'createdAt' => $template->createdAt()->format(\DateTimeInterface::ATOM)
        ], Response::HTTP_CREATED);
    }

    #[Route('', methods: ['GET'])]
    public function list(ListTemplatesHandler $handler): JsonResponse
    {
        $templates = $handler->handle(new ListTemplatesQuery());

        return new JsonResponse(array_map(fn($t) => [
            'id' => $t->id()->value(),
            'name' => $t->name(),
            'version' => $t->version(),
            'createdAt' => $t->createdAt()->format(\DateTimeInterface::ATOM)
        ], $templates));
    }

    #[Route('/{id}', methods: ['GET'])]
    public function get(string $id, GetTemplateHandler $handler): JsonResponse
    {
        try {
            $template = $handler->handle(new GetTemplateQuery($id));

            return new JsonResponse([
                'id' => $template->id()->value(),
                'name' => $template->name(),
                'content' => $template->content(),
                'version' => $template->version(),
                'variables' => array_map(fn($v) => [
                    'name' => $v->name(),
                    'type' => $v->type(),
                    'required' => $v->required(),
                ], $template->variables()),
                'createdAt' => $template->createdAt()->format(\DateTimeInterface::ATOM)
            ]);
        } catch (TemplateNotFoundException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(string $id, Request $request, UpdateTemplateHandler $handler): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        try {
            $command = new UpdateTemplateCommand(
                $id,
                $data['name'],
                $data['content'],
                $data['variables'] ?? []
            );

            $template = $handler->handle($command);

            return new JsonResponse([
                'id' => $template->id()->value(),
                'name' => $template->name(),
                'content' => $template->content(),
                'version' => $template->version(),
                'variables' => array_map(fn($v) => [
                    'name' => $v->name(),
                    'type' => $v->type(),
                    'required' => $v->required(),
                ], $template->variables()),
                'createdAt' => $template->createdAt()->format(\DateTimeInterface::ATOM)
            ]);
        } catch (TemplateNotFoundException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id, DeleteTemplateHandler $handler): JsonResponse
    {
        try {
            $handler->handle(new DeleteTemplateCommand($id));
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (TemplateNotFoundException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }
}
