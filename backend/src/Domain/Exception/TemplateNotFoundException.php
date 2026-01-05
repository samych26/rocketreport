<?php

namespace App\Domain\Exception;

use Exception;

final class TemplateNotFoundException extends Exception
{
    public static function fromId(string $id): self
    {
        return new self(sprintf('Template with ID "%s" not found.', $id));
    }
}
