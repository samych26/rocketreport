<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'documents')]
class Document
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\ManyToOne(targetEntity: ApiSource::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ApiSource $api_source;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'string', length: 1000, nullable: true)]
    private ?string $description = null;

    #[ORM\ManyToOne(targetEntity: ApiEndpoint::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?ApiEndpoint $api_endpoint = null;

    #[ORM\Column(type: 'string', length: 50)]
    private string $status = 'active'; // active, inactive, archived

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $created_at;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updated_at;

    #[ORM\OneToMany(targetEntity: DocumentVariable::class, mappedBy: 'document', cascade: ['remove'])]
    private Collection $variables;

    #[ORM\OneToOne(targetEntity: CodeProcessor::class, mappedBy: 'document', cascade: ['remove'])]
    private ?CodeProcessor $code_processor = null;

    #[ORM\OneToOne(targetEntity: Template::class, mappedBy: 'document', cascade: ['remove'])]
    private ?Template $template = null;

    #[ORM\OneToMany(targetEntity: DocumentGeneration::class, mappedBy: 'document', cascade: ['remove'])]
    private Collection $generations;

    public function __construct(User $user, ApiSource $api_source, ?ApiEndpoint $api_endpoint, string $name)
    {
        $this->user = $user;
        $this->api_source = $api_source;
        $this->api_endpoint = $api_endpoint;
        $this->name = $name;
        $this->created_at = new \DateTimeImmutable();
        $this->updated_at = new \DateTimeImmutable();
        $this->variables = new ArrayCollection();
        $this->generations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getApiSource(): ApiSource
    {
        return $this->api_source;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        $this->updated_at = new \DateTimeImmutable();
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getApiEndpoint(): ?ApiEndpoint
    {
        return $this->api_endpoint;
    }

    public function setApiEndpoint(?ApiEndpoint $api_endpoint): self
    {
        $this->api_endpoint = $api_endpoint;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;
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

    public function getVariables(): Collection
    {
        return $this->variables;
    }

    public function getCodeProcessor(): ?CodeProcessor
    {
        return $this->code_processor;
    }

    public function setCodeProcessor(?CodeProcessor $code_processor): self
    {
        $this->code_processor = $code_processor;
        return $this;
    }

    public function getTemplate(): ?Template
    {
        return $this->template;
    }

    public function setTemplate(?Template $template): self
    {
        $this->template = $template;
        return $this;
    }

    public function getGenerations(): Collection
    {
        return $this->generations;
    }
}
