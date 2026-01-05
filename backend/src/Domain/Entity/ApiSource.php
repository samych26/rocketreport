<?php

namespace App\Domain\Entity;

use App\Domain\ValueObject\ApiSourceId;
use App\Domain\ValueObject\ApiEndpoint;

final class ApiSource
{
    private ApiSourceId $id;
    private string $name;
    private string $baseUrl;
    private string $method; // e.g. GET, POST
    private string $authType; // e.g. None, Bearer, Basic
    /** @var ApiEndpoint[] */
    private array $endpoints;

    public function __construct(
        ApiSourceId $id,
        string $name,
        string $baseUrl,
        string $method = 'GET',
        string $authType = 'None',
        array $endpoints = []
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->baseUrl = $baseUrl;
        $this->method = $method;
        $this->authType = $authType;
        $this->endpoints = $endpoints;
    }

    public function id(): ApiSourceId
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function baseUrl(): string
    {
        return $this->baseUrl;
    }

    public function method(): string
    {
        return $this->method;
    }
    
    public function authType(): string
    {
        return $this->authType;
    }

    /** @return ApiEndpoint[] */
    public function endpoints(): array
    {
        return $this->endpoints;
    }
}
