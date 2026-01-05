<?php

namespace App\Application\UseCase\Template\GetTemplate;

use App\Domain\Entity\Template;
use App\Domain\Repository\TemplateRepository;
use App\Domain\ValueObject\TemplateId;
use App\Domain\Exception\TemplateNotFoundException;

final class GetTemplateHandler
{
    public function __construct(
        private TemplateRepository $templateRepository
    ) {}

    public function handle(GetTemplateQuery $query): Template
    {
        $templateId = TemplateId::fromString($query->getId());
        $template = $this->templateRepository->findById($templateId);

        if (!$template) {
            throw TemplateNotFoundException::fromId($query->getId());
        }

        return $template;
    }
}
