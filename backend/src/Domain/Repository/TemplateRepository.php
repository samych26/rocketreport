<?php

namespace App\Domain\Repository;

use App\Domain\Entity\Template;
use App\Domain\ValueObject\TemplateId;

interface TemplateRepository
{
    public function save(Template $template): void;

    public function findById(TemplateId $id): ?Template;
    
    /** @return Template[] */
    public function findAll(): array;

    public function delete(Template $template): void;
}
