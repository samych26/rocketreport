<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Entity\Template;
use App\Domain\Entity\Document;
use App\Domain\Repository\TemplateRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;

final class DoctrineTemplateRepository implements TemplateRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function save(Template $template): void
    {
        $this->entityManager->persist($template);
        $this->entityManager->flush();
    }

    public function findById(int $id): ?Template
    {
        return $this->entityManager->getRepository(Template::class)->find($id);
    }

    public function findByDocument(Document $document): ?Template
    {
        return $this->entityManager->getRepository(Template::class)->findOneBy([
            'document' => $document,
        ]);
    }

    public function delete(Template $template): void
    {
        $this->entityManager->remove($template);
        $this->entityManager->flush();
    }
}
