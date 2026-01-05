<?php

namespace App\Domain\Entity;

use App\Domain\ValueObject\TemplateId;
use App\Domain\ValueObject\TemplateVariable;
use DateTimeImmutable;

final class Template
{
    private TemplateId $id;
    private string $name;
    private string $content;
    private int $version;
    private DateTimeImmutable $createdAt;
    /** @var TemplateVariable[] */
    private array $variables;

    public function __construct(
        TemplateId $id,
        string $name,
        string $content,
        int $version = 1,
        array $variables = [],
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->content = $content;
        $this->version = $version;
        $this->variables = $variables;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function id(): TemplateId
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function content(): string
    {
        return $this->content;
    }

    public function version(): int
    {
        return $this->version;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    /** @return TemplateVariable[] */
    public function variables(): array
    {
        return $this->variables;
    }
}
