<?php

namespace App\Application\UseCase\Template\DeleteTemplate;

final class DeleteTemplateCommand
{
    public function __construct(
        private string $id
    ) {}

    public function getId(): string
    {
        return $this->id;
    }
}
