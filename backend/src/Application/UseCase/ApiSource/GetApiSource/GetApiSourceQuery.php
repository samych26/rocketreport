<?php

namespace App\Application\UseCase\ApiSource\GetApiSource;

final class GetApiSourceQuery
{
    public function __construct(
        private string $id
    ) {}

    public function getId(): string
    {
        return $this->id;
    }
}
