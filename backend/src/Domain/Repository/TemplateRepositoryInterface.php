<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\Template;
use App\Domain\Entity\Document;

interface TemplateRepositoryInterface
{
    /**
     * Sauvegarde un template
     */
    public function save(Template $template): void;

    /**
     * Trouve un template par son ID
     */
    public function findById(int $id): ?Template;

    /**
     * Trouve le template associé à un document
     */
    public function findByDocument(Document $document): ?Template;

    /**
     * Supprime un template
     */
    public function delete(Template $template): void;
}
