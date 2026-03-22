<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'api_sources')]
class ApiSource
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'string', length: 1000, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 500)]
    private string $url_base;

    #[ORM\Column(type: 'string', length: 50)]
    private string $auth_type = 'none'; // none, bearer, api_key, basic

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $auth_token = null; // Encrypted

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $headers = null;

    #[ORM\Column(type: 'string', length: 50)]
    private string $status = 'active'; // active, inactive, archived

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $created_at;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updated_at;

    #[ORM\OneToMany(targetEntity: Document::class, mappedBy: 'api_source', cascade: ['remove'])]
    private Collection $documents;

    #[ORM\OneToMany(targetEntity: ApiEndpoint::class, mappedBy: 'api_source', cascade: ['remove'])]
    private Collection $endpoints;

    public function __construct(User $user, string $name, string $url_base)
    {
        $this->user = $user;
        $this->name = $name;
        $this->url_base = $url_base;
        $this->created_at = new \DateTimeImmutable();
        $this->updated_at = new \DateTimeImmutable();
        $this->documents = new ArrayCollection();
        $this->endpoints = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
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

    public function getUrlBase(): string
    {
        return $this->url_base;
    }

    public function setUrlBase(string $url_base): self
    {
        $this->url_base = $url_base;
        return $this;
    }

    public function getAuthType(): string
    {
        return $this->auth_type;
    }

    public function setAuthType(string $auth_type): self
    {
        $this->auth_type = $auth_type;
        return $this;
    }

    public function getAuthToken(): ?string
    {
        return $this->auth_token;
    }

    public function setAuthToken(?string $auth_token): self
    {
        $this->auth_token = $auth_token;
        return $this;
    }

    public function getHeaders(): ?array
    {
        return $this->headers;
    }

    public function setHeaders(?array $headers): self
    {
        $this->headers = $headers;
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

    public function getDocuments(): Collection
    {
        return $this->documents;
    }

    public function getEndpoints(): Collection
    {
        return $this->endpoints;
    }
}
