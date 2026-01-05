<?php

namespace App\Application\UseCase\Template\DeleteTemplate;

use App\Domain\Repository\TemplateRepository;
use App\Domain\ValueObject\TemplateId;
use App\Domain\Exception\TemplateNotFoundException;

final class DeleteTemplateHandler
{
    public function __construct(
        private TemplateRepository $templateRepository
    ) {}

    public function handle(DeleteTemplateCommand $command): void
    {
        $templateId = TemplateId::fromString($command->getId());
        $template = $this->templateRepository->findById($templateId);

        if (!$template) {
            throw TemplateNotFoundException::fromId($command->getId());
        }

        $this->templateRepository->delete($template);
    }
}
