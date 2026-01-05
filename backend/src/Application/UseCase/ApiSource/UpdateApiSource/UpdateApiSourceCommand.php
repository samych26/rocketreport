<?php

namespace App\Application\UseCase\ApiSource\UpdateApiSource;

final class UpdateApiSourceCommand
{
    public function __construct(
        private string $id,
        private string $name,
        private string $baseUrl,
        private string $method = 'GET',
        private string $authType = 'None',
        private array $endpoints = []
    ) {}

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getAuthType(): string
    {
        return $this->authType;
    }

    public function getEndpoints(): array
    {
        return $this->endpoints;
    }
}
