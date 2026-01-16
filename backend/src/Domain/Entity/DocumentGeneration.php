<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'document_generations')]
class DocumentGeneration
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Document::class, inversedBy: 'generations')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Document $document;

    // Les paramètres utilisés pour générer le document
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $input_params = null; // { "studentId": 123, "class": "5A" }

    // Les données brutes reçues de l'API
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $api_response = null;

    // Les données transformées par le code processor
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $processed_data = null;

    // Les variables extraites et calculées
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $extracted_variables = null;

    // Le contenu rendu (HTML/PDF/etc)
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $rendered_output = null;

    // Le fichier généré (blob ou chemin)
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $file_path = null;

    // Format du fichier généré
    #[ORM\Column(type: 'string', length: 50)]
    private string $output_format = 'html';

    // Logs de l'exécution (pour debug)
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $execution_logs = null;

    #[ORM\Column(type: 'string', length: 50)]
    private string $status = 'pending'; // pending, success, failed

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $error_message = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $created_at;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updated_at;

    public function __construct(Document $document)
    {
        $this->document = $document;
        $this->created_at = new \DateTimeImmutable();
        $this->updated_at = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDocument(): Document
    {
        return $this->document;
    }

    public function getInputParams(): ?array
    {
        return $this->input_params;
    }

    public function setInputParams(?array $input_params): self
    {
        $this->input_params = $input_params;
        return $this;
    }

    public function getApiResponse(): ?array
    {
        return $this->api_response;
    }

    public function setApiResponse(?array $api_response): self
    {
        $this->api_response = $api_response;
        return $this;
    }

    public function getProcessedData(): ?array
    {
        return $this->processed_data;
    }

    public function setProcessedData(?array $processed_data): self
    {
        $this->processed_data = $processed_data;
        return $this;
    }

    public function getExtractedVariables(): ?array
    {
        return $this->extracted_variables;
    }

    public function setExtractedVariables(?array $extracted_variables): self
    {
        $this->extracted_variables = $extracted_variables;
        return $this;
    }

    public function getRenderedOutput(): ?string
    {
        return $this->rendered_output;
    }

    public function setRenderedOutput(?string $rendered_output): self
    {
        $this->rendered_output = $rendered_output;
        return $this;
    }

    public function getFilePath(): ?string
    {
        return $this->file_path;
    }

    public function setFilePath(?string $file_path): self
    {
        $this->file_path = $file_path;
        return $this;
    }

    public function getOutputFormat(): string
    {
        return $this->output_format;
    }

    public function setOutputFormat(string $output_format): self
    {
        $this->output_format = $output_format;
        return $this;
    }

    public function getExecutionLogs(): ?string
    {
        return $this->execution_logs;
    }

    public function setExecutionLogs(?string $execution_logs): self
    {
        $this->execution_logs = $execution_logs;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;
        $this->updated_at = new \DateTimeImmutable();
        return $this;
    }

    public function getErrorMessage(): ?string
    {
        return $this->error_message;
    }

    public function setErrorMessage(?string $error_message): self
    {
        $this->error_message = $error_message;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->created_at;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updated_at;
    }
}
