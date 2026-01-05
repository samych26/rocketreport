<?php

namespace App\Domain\ValueObject;

final class TemplateVariable
{
    private string $name;
    private string $type;
    private bool $required;

    public function __construct(string $name, string $type, bool $required)
    {
        $this->name = $name;
        $this->type = $type;
        $this->required = $required;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function type(): string
    {
        return $this->type;
    }

    public function required(): bool
    {
        return $this->required;
    }
}
