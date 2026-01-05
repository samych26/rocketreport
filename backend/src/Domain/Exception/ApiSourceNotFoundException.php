<?php

namespace App\Domain\Exception;

use Exception;

final class ApiSourceNotFoundException extends Exception
{
    public static function fromId(string $id): self
    {
        return new self(sprintf('API Source with ID "%s" not found.', $id));
    }
}
