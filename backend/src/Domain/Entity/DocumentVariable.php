<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'document_variables')]
class DocumentVariable
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Document::class, inversedBy: 'variables')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Document $document;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'string', length: 50)]
    private string $type; // api_field, calculated

    // Pour les variables API : le chemin JSON pour extraire la valeur
    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $json_path = null; // ex: "data.students[0].name"

    // ✨ Pour les variables calculées : la formule
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $calculation_formula = null; // ex: "Math.round(total / count)"

    #[ORM\Column(type: 'string', length: 1000, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 50)]
    private string $format = 'string'; // string, integer, decimal, date, boolean

    #[ORM\Column(type: 'boolean')]
    private bool $required = false;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $default_value = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $created_at;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updated_at;

    public function __construct(Document $document, string $name, string $type)
    {
        $this->document = $document;
        $this->name = $name;
        $this->type = $type;
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

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getJsonPath(): ?string
    {
        return $this->json_path;
    }

    public function setJsonPath(?string $json_path): self
    {
        $this->json_path = $json_path;
        return $this;
    }

    public function getCalculationFormula(): ?string
    {
        return $this->calculation_formula;
    }

    public function setCalculationFormula(?string $calculation_formula): self
    {
        $this->calculation_formula = $calculation_formula;
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

    public function getFormat(): string
    {
        return $this->format;
    }

    public function setFormat(string $format): self
    {
        $this->format = $format;
        return $this;
    }

    public function isRequired(): bool
    {
        return $this->required;
    }

    public function setRequired(bool $required): self
    {
        $this->required = $required;
        return $this;
    }

    public function getDefaultValue(): ?string
    {
        return $this->default_value;
    }

    public function setDefaultValue(?string $default_value): self
    {
        $this->default_value = $default_value;
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
