<?php

namespace App\Domain\ValueObject;

use InvalidArgumentException;

final class Email
{
    private string $value;

    public function __construct(string $value)
    {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Email invalide");
        }

        $this->value = $value;
    }

    public function value(): string
    {
        return $this->value;
    }
}
