<?php

namespace App\Application\UseCase\ApiSource\ListApiSources;

use App\Domain\Repository\ApiSourceRepository;

final class ListApiSourcesHandler
{
    public function __construct(
        private ApiSourceRepository $apiSourceRepository
    ) {}

    public function handle(ListApiSourcesQuery $query): array
    {
        return $this->apiSourceRepository->findAll();
    }
}
