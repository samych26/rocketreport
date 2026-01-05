<?php

namespace App\Application\UseCase\Template\CreateTemplate;

use App\Domain\Entity\Template;
use App\Domain\Repository\TemplateRepository;
use App\Domain\ValueObject\TemplateId;
use App\Domain\ValueObject\TemplateVariable;

final class CreateTemplateHandler
{
    public function __construct(
        private TemplateRepository $templateRepository
    ) {}

    public function handle(CreateTemplateCommand $command): Template
    {
        $variables = array_map(function (array $v) {
            return new TemplateVariable($v['name'], $v['type'], $v['required'] ?? true);
        }, $command->getVariables());

        $template = new Template(
            TemplateId::generate(),
            $command->getName(),
            $command->getContent(),
            1, // Initial version
            $variables
        );

        $this->templateRepository->save($template);

        return $template;
    }
}
