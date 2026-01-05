<?php

namespace App\Application\UseCase\Template\ListTemplates;

use App\Domain\Repository\TemplateRepository;

final class ListTemplatesHandler
{
    public function __construct(
        private TemplateRepository $templateRepository
    ) {}

    public function handle(ListTemplatesQuery $query): array
    {
        return $this->templateRepository->findAll();
    }
}
