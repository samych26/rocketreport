<?php

namespace App\Application\UseCase\ApiSource\DeleteApiSource;

final class DeleteApiSourceCommand
{
    public function __construct(
        private string $id
    ) {}

    public function getId(): string
    {
        return $this->id;
    }
}
