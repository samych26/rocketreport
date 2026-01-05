<?php

namespace App\Infrastructure\Persistence\Doctrine\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: "api_sources")]
class ApiSourceEntity
{
    #[ORM\Id]
    #[ORM\Column(type: "uuid")]
    private string $id;

    #[ORM\Column]
    private string $name;

    #[ORM\Column]
    private string $baseUrl;

    #[ORM\Column]
    private string $method;

    #[ORM\Column]
    private string $authType;

    #[ORM\Column(type: "json")]
    private array $endpoints = [];

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string $id): void
    {
        $this->id = $id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    public function setBaseUrl(string $baseUrl): void
    {
        $this->baseUrl = $baseUrl;
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function setMethod(string $method): void
    {
        $this->method = $method;
    }

    public function getAuthType(): string
    {
        return $this->authType;
    }

    public function setAuthType(string $authType): void
    {
        $this->authType = $authType;
    }

    public function getEndpoints(): array
    {
        return $this->endpoints;
    }

    public function setEndpoints(array $endpoints): void
    {
        $this->endpoints = $endpoints;
    }
}
