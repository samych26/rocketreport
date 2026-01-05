<?php

namespace App\Application\UseCase\Template\CreateTemplate;

final class CreateTemplateCommand
{
    public function __construct(
        private string $name,
        private string $content,
        private array $variables = []
    ) {}

    public function getName(): string
    {
        return $this->name;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getVariables(): array
    {
        return $this->variables;
    }
}
