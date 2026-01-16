<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

enum DataType: string
{
    case STRING = 'STRING';
    case NUMBER = 'NUMBER';
    case DATE = 'DATE';
    case BOOLEAN = 'BOOLEAN';
    case ARRAY = 'ARRAY';
    case OBJECT = 'OBJECT';
}