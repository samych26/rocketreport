<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'templates')]
class Template
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    // Propriétaire direct (pour les templates standalone)
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?User $user = null;

    // Null = template standalone (pas encore lié à un document)
    #[ORM\OneToOne(targetEntity: Document::class, inversedBy: 'template')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Document $document = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(type: 'text')]
    private string $content;

    #[ORM\Column(type: 'string', length: 50)]
    private string $output_format = 'pdf';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 50)]
    private string $status = 'active';

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $created_at;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updated_at;

    public function __construct(string $content, string $output_format = 'pdf', ?User $user = null, ?Document $document = null)
    {
        $this->content = $content;
        $this->output_format = $output_format;
        $this->user = $user;
        $this->document = $document;
        $this->created_at = new \DateTimeImmutable();
        $this->updated_at = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): self { $this->user = $user; return $this; }

    /** Retourne le propriétaire : direct ou via le document */
    public function getOwner(): ?User
    {
        return $this->user ?? $this->document?->getUser();
    }

    public function getDocument(): ?Document { return $this->document; }
    public function setDocument(?Document $document): self { $this->document = $document; return $this; }

    public function getName(): ?string { return $this->name; }
    public function setName(?string $name): self { $this->name = $name; return $this; }

    /** Nom à afficher : name propre ou nom du document lié */
    public function getDisplayName(): string
    {
        return $this->name ?? $this->document?->getName() ?? 'Template #' . $this->id;
    }

    public function getContent(): string { return $this->content; }
    public function setContent(string $content): self
    {
        $this->content = $content;
        $this->updated_at = new \DateTimeImmutable();
        return $this;
    }

    public function getOutputFormat(): string { return $this->output_format; }
    public function setOutputFormat(string $output_format): self { $this->output_format = $output_format; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): self { $this->description = $description; return $this; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->created_at; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updated_at; }
}
