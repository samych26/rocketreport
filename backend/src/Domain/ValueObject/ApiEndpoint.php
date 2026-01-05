<?php

namespace App\Domain\ValueObject;

final class ApiEndpoint
{
    private array $filters;

    public function __construct(
        string $path,
        array $headers = [],
        array $queryParams = [],
        string $bodyTemplate = '',
        array $filters = []
    ) {
        $this->path = $path;
        $this->headers = $headers;
        $this->queryParams = $queryParams;
        $this->bodyTemplate = $bodyTemplate;
        $this->filters = $filters;
    }

    public function path(): string
    {
        return $this->path;
    }

    public function headers(): array
    {
        return $this->headers;
    }

    public function queryParams(): array
    {
        return $this->queryParams;
    }

    public function bodyTemplate(): string
    {
        return $this->bodyTemplate;
    }

    public function filters(): array
    {
        return $this->filters;
    }
}
