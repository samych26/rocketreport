<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\DocumentVariable;
use App\Domain\Entity\Document;
use App\Domain\Repository\DocumentVariableRepositoryInterface;

final class DocumentVariableService
{
    public function __construct(
        private DocumentVariableRepositoryInterface $variableRepository,
    ) {}

    /**
     * Crée une nouvelle variable
     */
    public function createVariable(
        Document $document,
        string $name,
        string $type, // 'api_field' ou 'calculated'
        ?string $json_path = null,
        ?string $calculation_formula = null,
        string $format = 'string',
        bool $required = false,
        ?string $default_value = null,
    ): DocumentVariable {
        $variable = new DocumentVariable($document, $name, $type);
        $variable->setJsonPath($json_path);
        $variable->setCalculationFormula($calculation_formula);
        $variable->setFormat($format);
        $variable->setRequired($required);
        $variable->setDefaultValue($default_value);

        $this->variableRepository->save($variable);

        return $variable;
    }

    /**
     * Met à jour une variable
     */
    public function updateVariable(DocumentVariable $variable, array $data): DocumentVariable
    {
        if (isset($data['name'])) {
            $variable->setName($data['name']);
        }
        if (isset($data['json_path'])) {
            $variable->setJsonPath($data['json_path']);
        }
        if (isset($data['calculation_formula'])) {
            $variable->setCalculationFormula($data['calculation_formula']);
        }
        if (isset($data['description'])) {
            $variable->setDescription($data['description']);
        }
        if (isset($data['format'])) {
            $variable->setFormat($data['format']);
        }
        if (isset($data['required'])) {
            $variable->setRequired((bool) $data['required']);
        }
        if (isset($data['default_value'])) {
            $variable->setDefaultValue($data['default_value']);
        }

        $this->variableRepository->save($variable);

        return $variable;
    }

    /**
     * Récupère les variables d'un document
     */
    public function getVariablesByDocument(Document $document): array
    {
        return $this->variableRepository->findByDocument($document);
    }

    /**
     * Récupère les variables API d'un document
     */
    public function getApiFieldsByDocument(Document $document): array
    {
        return $this->variableRepository->findApiFieldsByDocument($document);
    }

    /**
     * Récupère les variables calculées d'un document
     */
    public function getCalculatedByDocument(Document $document): array
    {
        return $this->variableRepository->findCalculatedByDocument($document);
    }

    /**
     * Supprime une variable
     */
    public function deleteVariable(DocumentVariable $variable): void
    {
        $this->variableRepository->delete($variable);
    }

    /**
     * Extrait automatiquement les variables d'une réponse JSON
     */
    public function extractVariablesFromJson(Document $document, array $jsonData, string $parentPath = ''): array
    {
        $variables = [];

        foreach ($jsonData as $key => $value) {
            $fullPath = $parentPath ? "{$parentPath}.{$key}" : $key;

            if (is_array($value) && !empty($value)) {
                // Recursively explore nested arrays
                if (isset($value[0]) && is_array($value[0])) {
                    // Array of objects
                    $variables = array_merge($variables, $this->extractVariablesFromJson($document, $value[0], "{$fullPath}[0]"));
                } else {
                    // Nested object
                    $variables = array_merge($variables, $this->extractVariablesFromJson($document, $value, $fullPath));
                }
            } else {
                // Scalar value
                $type = is_numeric($value) ? 'integer' : 'string';
                if (is_bool($value)) {
                    $type = 'boolean';
                }

                $variables[] = [
                    'name' => $key,
                    'json_path' => $fullPath,
                    'type' => 'api_field',
                    'format' => $type,
                ];
            }
        }

        return $variables;
    }
}
