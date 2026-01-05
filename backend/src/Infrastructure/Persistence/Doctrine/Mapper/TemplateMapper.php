<?php

namespace App\Infrastructure\Persistence\Doctrine\Mapper;

use App\Domain\Entity\Template;
use App\Domain\ValueObject\TemplateId;
use App\Domain\ValueObject\TemplateVariable;
use App\Infrastructure\Persistence\Doctrine\Entity\TemplateEntity;

final class TemplateMapper
{
    public static function toEntity(Template $template): TemplateEntity
    {
        $entity = new TemplateEntity();
        $entity->setId($template->id()->value());
        $entity->setName($template->name());
        $entity->setContent($template->content());
        $entity->setVersion($template->version());
        $entity->setCreatedAt($template->createdAt());

        // Convert TemplateVariable[] to array for JSON
        $variablesData = array_map(function (TemplateVariable $v) {
            return [
                'name' => $v->name(),
                'type' => $v->type(),
                'required' => $v->required(),
            ];
        }, $template->variables());
        $entity->setVariables($variablesData);

        return $entity;
    }

    public static function toDomain(TemplateEntity $entity): Template
    {
        // Convert JSON array to TemplateVariable[]
        $variables = array_map(function (array $v) {
            return new TemplateVariable($v['name'], $v['type'], $v['required']);
        }, $entity->getVariables());

        return new Template(
            TemplateId::fromString($entity->getId()),
            $entity->getName(),
            $entity->getContent(),
            $entity->getVersion(),
            $variables,
            $entity->getCreatedAt()
        );
    }
}
