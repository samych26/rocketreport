<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\Template;
use App\Domain\Entity\Document;
use App\Domain\Entity\User;

interface TemplateRepositoryInterface
{
    public function save(Template $template): void;
    public function findById(int $id): ?Template;
    public function findByDocument(Document $document): ?Template;
    public function findByUser(User $user): array;
    public function delete(Template $template): void;
}
