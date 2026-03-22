<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'api_endpoints')]
class ApiEndpoint
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: ApiSource::class, inversedBy: 'endpoints')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ApiSource $api_source;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'string', length: 1000, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 500)]
    private string $path;

    #[ORM\Column(type: 'string', length: 10)]
    private string $method = 'GET'; // GET, POST, PUT, PATCH, DELETE

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $variables = null; // ["id", "total_price"]

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $query_params = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $path_params = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $body_schema = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $created_at;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updated_at;

    #[ORM\OneToMany(targetEntity: Document::class, mappedBy: 'api_endpoint', cascade: ['remove'])]
    private Collection $documents;

    public function __construct(ApiSource $api_source, string $name, string $path, string $method = 'GET')
    {
        $this->api_source = $api_source;
        $this->name = $name;
        $this->path = $path;
        $this->method = $method;
        $this->created_at = new \DateTimeImmutable();
        $this->updated_at = new \DateTimeImmutable();
        $this->documents = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getPath(): string
    {
        return $this->path;
    }

    public function setPath(string $path): self
    {
        $this->path = $path;
        return $this;
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function setMethod(string $method): self
    {
        $this->method = $method;
        return $this;
    }

    public function getVariables(): ?array
    {
        return $this->variables;
    }

    public function setVariables(?array $variables): self
    {
        $this->variables = $variables;
        return $this;
    }

    public function getQueryParams(): ?array
    {
        return $this->query_params;
    }

    public function setQueryParams(?array $query_params): self
    {
        $this->query_params = $query_params;
        return $this;
    }

    public function getPathParams(): ?array
    {
        return $this->path_params;
    }

    public function setPathParams(?array $path_params): self
    {
        $this->path_params = $path_params;
        return $this;
    }

    public function getBodySchema(): ?array
    {
        return $this->body_schema;
    }

    public function setBodySchema(?array $body_schema): self
    {
        $this->body_schema = $body_schema;
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

    public function setUpdatedAt(): self
    {
        $this->updated_at = new \DateTimeImmutable();
        return $this;
    }

    public function getDocuments(): Collection
    {
        return $this->documents;
    }
}
