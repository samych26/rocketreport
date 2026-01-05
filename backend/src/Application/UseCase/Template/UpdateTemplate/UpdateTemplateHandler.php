<?php

namespace App\Application\UseCase\Template\UpdateTemplate;

use App\Domain\Entity\Template;
use App\Domain\Repository\TemplateRepository;
use App\Domain\ValueObject\TemplateId;
use App\Domain\ValueObject\TemplateVariable;
use App\Domain\Exception\TemplateNotFoundException;

final class UpdateTemplateHandler
{
    public function __construct(
        private TemplateRepository $templateRepository
    ) {}

    public function handle(UpdateTemplateCommand $command): Template
    {
        $templateId = TemplateId::fromString($command->getId());
        $template = $this->templateRepository->findById($templateId);

        if (!$template) {
            throw TemplateNotFoundException::fromId($command->getId());
        }

        $variables = array_map(function (array $v) {
            return new TemplateVariable($v['name'], $v['type'], $v['required'] ?? true);
        }, $command->getVariables());

        // We create a new instance with same ID but updated fields and incremented version
        $updatedTemplate = new Template(
            $template->id(),
            $command->getName(),
            $command->getContent(),
            $template->version() + 1,
            $variables,
            $template->createdAt()
        );

        $this->templateRepository->save($updatedTemplate);

        return $updatedTemplate;
    }
}
