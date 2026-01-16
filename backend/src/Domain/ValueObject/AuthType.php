<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

enum AuthType: string
{
    case NONE = 'NONE';
    case API_KEY = 'API_KEY';
    case BEARER_TOKEN = 'BEARER_TOKEN';
}