<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: \App\Infrastructure\Persistence\Doctrine\Repository\McpApiKeyRepository::class)]
#[ORM\Table(name: 'mcp_api_keys')]
class McpApiKey
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    /** Nom descriptif de la clé (ex: "Cursor", "Claude Desktop") */
    #[ORM\Column(type: 'string', length: 100)]
    private string $name;

    /** Hash SHA-256 de la clé brute — jamais la clé en clair */
    #[ORM\Column(type: 'string', length: 64, unique: true)]
    private string $keyHash;

    /** Les 12 premiers caractères de la clé pour affichage */
    #[ORM\Column(type: 'string', length: 12)]
    private string $keyPreview;

    #[ORM\Column(type: 'boolean')]
    private bool $revoked = false;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $lastUsedAt = null;

    public function __construct(User $user, string $name, string $keyHash, string $keyPreview)
    {
        $this->user       = $user;
        $this->name       = $name;
        $this->keyHash    = $keyHash;
        $this->keyPreview = $keyPreview;
        $this->createdAt  = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): User { return $this->user; }
    public function getName(): string { return $this->name; }
    public function getKeyHash(): string { return $this->keyHash; }
    public function getKeyPreview(): string { return $this->keyPreview; }
    public function isRevoked(): bool { return $this->revoked; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getLastUsedAt(): ?\DateTimeImmutable { return $this->lastUsedAt; }

    public function revoke(): self
    {
        $this->revoked = true;
        return $this;
    }

    public function touchLastUsed(): self
    {
        $this->lastUsedAt = new \DateTimeImmutable();
        return $this;
    }
}
