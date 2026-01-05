<?php

namespace App\Ui\Http\Controller;

use App\Application\UseCase\ApiSource\CreateApiSource\CreateApiSourceCommand;
use App\Application\UseCase\ApiSource\CreateApiSource\CreateApiSourceHandler;
use App\Application\UseCase\ApiSource\DeleteApiSource\DeleteApiSourceCommand;
use App\Application\UseCase\ApiSource\DeleteApiSource\DeleteApiSourceHandler;
use App\Application\UseCase\ApiSource\GetApiSource\GetApiSourceHandler;
use App\Application\UseCase\ApiSource\GetApiSource\GetApiSourceQuery;
use App\Application\UseCase\ApiSource\ListApiSources\ListApiSourcesHandler;
use App\Application\UseCase\ApiSource\ListApiSources\ListApiSourcesQuery;
use App\Application\UseCase\ApiSource\UpdateApiSource\UpdateApiSourceCommand;
use App\Application\UseCase\ApiSource\UpdateApiSource\UpdateApiSourceHandler;
use App\Domain\Exception\ApiSourceNotFoundException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/api-sources')]
final class ApiSourceController extends AbstractController
{
    #[Route('', methods: ['POST'])]
    public function create(Request $request, CreateApiSourceHandler $handler): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $command = new CreateApiSourceCommand(
            $data['name'],
            $data['baseUrl'],
            $data['method'] ?? 'GET',
            $data['authType'] ?? 'None',
            $data['endpoints'] ?? []
        );

        $apiSource = $handler->handle($command);

        return new JsonResponse([
            'id' => $apiSource->id()->value(),
            'name' => $apiSource->name(),
            'baseUrl' => $apiSource->baseUrl(),
            'method' => $apiSource->method(),
            'authType' => $apiSource->authType(),
            'endpoints' => array_map(fn($e) => [
                'path' => $e->path(),
                'headers' => $e->headers(),
                'queryParams' => $e->queryParams(),
                'bodyTemplate' => $e->bodyTemplate(),
                'filters' => $e->filters(),
            ], $apiSource->endpoints()),
        ], Response::HTTP_CREATED);
    }

    #[Route('', methods: ['GET'])]
    public function list(ListApiSourcesHandler $handler): JsonResponse
    {
        $apiSources = $handler->handle(new ListApiSourcesQuery());

        return new JsonResponse(array_map(fn($s) => [
            'id' => $s->id()->value(),
            'name' => $s->name(),
            'baseUrl' => $s->baseUrl(),
            'method' => $s->method(),
        ], $apiSources));
    }

    #[Route('/{id}', methods: ['GET'])]
    public function get(string $id, GetApiSourceHandler $handler): JsonResponse
    {
        try {
            $apiSource = $handler->handle(new GetApiSourceQuery($id));

            return new JsonResponse([
                'id' => $apiSource->id()->value(),
                'name' => $apiSource->name(),
                'baseUrl' => $apiSource->baseUrl(),
                'method' => $apiSource->method(),
                'authType' => $apiSource->authType(),
                'endpoints' => array_map(fn($e) => [
                    'path' => $e->path(),
                    'headers' => $e->headers(),
                    'queryParams' => $e->queryParams(),
                    'bodyTemplate' => $e->bodyTemplate(),
                ], $apiSource->endpoints()),
            ]);
        } catch (ApiSourceNotFoundException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(string $id, Request $request, UpdateApiSourceHandler $handler): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        try {
            $command = new UpdateApiSourceCommand(
                $id,
                $data['name'],
                $data['baseUrl'],
                $data['method'] ?? 'GET',
                $data['authType'] ?? 'None',
                $data['endpoints'] ?? []
            );

            $apiSource = $handler->handle($command);

            return new JsonResponse([
                'id' => $apiSource->id()->value(),
                'name' => $apiSource->name(),
                'baseUrl' => $apiSource->baseUrl(),
                'method' => $apiSource->method(),
                'authType' => $apiSource->authType(),
                'endpoints' => array_map(fn($e) => [
                    'path' => $e->path(),
                    'headers' => $e->headers(),
                    'queryParams' => $e->queryParams(),
                    'bodyTemplate' => $e->bodyTemplate(),
                ], $apiSource->endpoints()),
            ]);
        } catch (ApiSourceNotFoundException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id, DeleteApiSourceHandler $handler): JsonResponse
    {
        try {
            $handler->handle(new DeleteApiSourceCommand($id));
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (ApiSourceNotFoundException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }
}
