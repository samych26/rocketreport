<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\Template;
use App\Domain\Entity\Document;
use App\Domain\Repository\TemplateRepositoryInterface;

final class TemplateService
{
    public function __construct(
        private TemplateRepositoryInterface $templateRepository,
    ) {}

    /**
     * Crée un nouveau template
     */
    public function createTemplate(
        Document $document,
        string $content,
        string $outputFormat = 'pdf',
        ?string $description = null,
    ): Template {
        $template = new Template($document, $content, $outputFormat);
        
        if ($description !== null) {
            $template->setDescription($description);
        }

        $this->templateRepository->save($template);

        return $template;
    }

    /**
     * Met à jour un template
     */
    public function updateTemplate(Template $template, array $data): Template
    {
        if (isset($data['content'])) {
            $template->setContent($data['content']);
        }
        if (isset($data['output_format'])) {
            $template->setOutputFormat($data['output_format']);
        }
        if (isset($data['description'])) {
            $template->setDescription($data['description']);
        }
        if (isset($data['status'])) {
            $template->setStatus($data['status']);
        }

        $this->templateRepository->save($template);

        return $template;
    }

    /**
     * Récupère le template d'un document
     */
    public function getTemplateByDocument(Document $document): ?Template
    {
        return $this->templateRepository->findByDocument($document);
    }

    /**
     * Récupère un template par ID
     */
    public function getTemplate(int $id): ?Template
    {
        return $this->templateRepository->findById($id);
    }

    /**
     * Supprime un template
     */
    public function deleteTemplate(Template $template): void
    {
        $this->templateRepository->delete($template);
    }

    /**
     * Valide la syntaxe Handlebars (basique)
     * Retourne un tableau d'erreurs (vide si valide)
     */
    public function validateHandlebars(string $content): array
    {
        $errors = [];

        // Vérifier les accolades équilibrées
        $openCount = substr_count($content, '{{');
        $closeCount = substr_count($content, '}}');
        
        if ($openCount !== $closeCount) {
            $errors[] = "Unbalanced handlebars: {$openCount} opening vs {$closeCount} closing";
        }

        // Vérifier les blocs #if, #each, etc. sont fermés
        preg_match_all('/\{\{#(\w+)/', $content, $openBlocks);
        preg_match_all('/\{\{\/(\w+)/', $content, $closeBlocks);

        $openBlockNames = $openBlocks[1] ?? [];
        $closeBlockNames = $closeBlocks[1] ?? [];

        if (count($openBlockNames) !== count($closeBlockNames)) {
            $errors[] = "Unbalanced block helpers: " . count($openBlockNames) . " opening vs " . count($closeBlockNames) . " closing";
        }

        return $errors;
    }
}
