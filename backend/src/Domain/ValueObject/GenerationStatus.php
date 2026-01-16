<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

enum GenerationStatus: string
{
    case PENDING = 'PENDING';
    case FETCHING_DATA = 'FETCHING_DATA';
    case TRANSFORMING = 'TRANSFORMING';
    case RENDERING = 'RENDERING';
    case COMPLETED = 'COMPLETED';
    case FAILED = 'FAILED';
}