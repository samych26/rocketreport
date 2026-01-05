<?php

namespace App\Application\UseCase\Template\GetTemplate;

final class GetTemplateQuery
{
    public function __construct(
        private string $id
    ) {}

    public function getId(): string
    {
        return $this->id;
    }
}
