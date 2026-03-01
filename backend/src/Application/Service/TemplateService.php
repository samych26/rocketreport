<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\Template;
use App\Domain\Entity\Document;
use App\Domain\Entity\User;
use App\Domain\Repository\TemplateRepositoryInterface;

final class TemplateService
{
    public function __construct(
        private TemplateRepositoryInterface $templateRepository,
    ) {}

    /** Crée un template standalone (sans document) */
    public function createStandaloneTemplate(
        User $user,
        string $name,
        string $content,
        string $outputFormat = 'pdf',
        ?string $description = null,
    ): Template {
        $template = new Template($content, $outputFormat, $user, null);
        $template->setName($name);
        if ($description !== null) {
            $template->setDescription($description);
        }
        $this->templateRepository->save($template);
        return $template;
    }

    /** Crée un template lié à un document (rétrocompat) */
    public function createTemplate(
        Document $document,
        string $content,
        string $outputFormat = 'pdf',
        ?string $description = null,
    ): Template {
        $template = new Template($content, $outputFormat, null, $document);
        if ($description !== null) {
            $template->setDescription($description);
        }
        $this->templateRepository->save($template);
        return $template;
    }

    public function updateTemplate(Template $template, array $data): Template
    {
        if (isset($data['name']))          $template->setName($data['name']);
        if (isset($data['content']))       $template->setContent($data['content']);
        if (isset($data['output_format'])) $template->setOutputFormat($data['output_format']);
        if (array_key_exists('description', $data)) $template->setDescription($data['description'] ?: null);
        if (isset($data['status']))        $template->setStatus($data['status']);

        $this->templateRepository->save($template);
        return $template;
    }

    /** Persiste un template déjà modifié (ex: liaison document) */
    public function saveTemplate(Template $template): void
    {
        $this->templateRepository->save($template);
    }

    public function getTemplatesByUser(User $user): array
    {
        return $this->templateRepository->findByUser($user);
    }

    public function getTemplateByDocument(Document $document): ?Template
    {
        return $this->templateRepository->findByDocument($document);
    }

    public function getTemplate(int $id): ?Template
    {
        return $this->templateRepository->findById($id);
    }

    public function deleteTemplate(Template $template): void
    {
        $this->templateRepository->delete($template);
    }

    public function validateHandlebars(string $content): array
    {
        $errors = [];
        $openCount  = substr_count($content, '{{');
        $closeCount = substr_count($content, '}}');
        if ($openCount !== $closeCount) {
            $errors[] = "Unbalanced handlebars: {$openCount} opening vs {$closeCount} closing";
        }
        preg_match_all('/\{\{#(\w+)/', $content, $openBlocks);
        preg_match_all('/\{\{\/(\w+)/', $content, $closeBlocks);
        if (count($openBlocks[1]) !== count($closeBlocks[1])) {
            $errors[] = "Unbalanced block helpers: " . count($openBlocks[1]) . " opening vs " . count($closeBlocks[1]) . " closing";
        }
        return $errors;
    }

    /** Sérialise un template en tableau pour les réponses JSON */
    public function serialize(Template $template): array
    {
        return [
            'id'            => $template->getId(),
            'name'          => $template->getDisplayName(),
            'document_id'   => $template->getDocument()?->getId(),
            'document_name' => $template->getDocument()?->getName(),
            'content'       => $template->getContent(),
            'output_format' => $template->getOutputFormat(),
            'description'   => $template->getDescription(),
            'status'        => $template->getStatus(),
            'created_at'    => $template->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at'    => $template->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}
