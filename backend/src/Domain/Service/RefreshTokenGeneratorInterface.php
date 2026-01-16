<?php

declare(strict_types=1);

namespace App\Domain\Service;

use App\Domain\Entity\User;
use App\Domain\Entity\RefreshToken;

interface RefreshTokenGeneratorInterface
{
    /**
     * Génère un refresh token pour un utilisateur.
     * Retourne un tuple [RefreshToken (entité persistable), string (token brut pour le cookie)].
     */
    public function generate(User $user): array;
}

