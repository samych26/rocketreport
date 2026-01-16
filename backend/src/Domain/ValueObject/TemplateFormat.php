<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

enum TemplateFormat: string
{
    case PDF = 'PDF';
    case DOCX = 'DOCX';
}