<?php

namespace App\Domain\ValueObject;

use Ramsey\Uuid\Uuid;

final class DocumentGenerationId
{
    private string $value;

    private function __construct(string $value)
    {
        $this->value = $value;
    }

    public static function generate(): self
    {
        return new self(Uuid::uuid4()->toString());
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }
}
