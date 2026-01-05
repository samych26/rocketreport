<?php

namespace App\Domain\ValueObject;

final class Role
{
    public const USER = 'ROLE_USER';
    public const ADMIN = 'ROLE_ADMIN';

    private string $value;

    public function __construct(string $value)
    {
        if (!in_array($value, [self::USER, self::ADMIN])) {
            throw new \InvalidArgumentException("Rôle invalide");
        }

        $this->value = $value;
    }

    public static function user(): self
    {
        return new self(self::USER);
    }

    public static function admin(): self
    {
        return new self(self::ADMIN);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function isAdmin(): bool
    {
        return $this->value === self::ADMIN;
    }
}
