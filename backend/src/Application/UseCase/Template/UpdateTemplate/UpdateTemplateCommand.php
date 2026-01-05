<?php

namespace App\Application\UseCase\Template\UpdateTemplate;

final class UpdateTemplateCommand
{
    public function __construct(
        private string $id,
        private string $name,
        private string $content,
        private array $variables = []
    ) {}

    public function getId(): string
    {
        return $this->id;
    }

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
