<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\User;

interface TokenManagerInterface
{
    public function createToken(User $user): string;
}

