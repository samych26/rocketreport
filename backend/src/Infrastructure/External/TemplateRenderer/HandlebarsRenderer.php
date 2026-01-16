<?php

declare(strict_types=1);

namespace App\Infrastructure\External\TemplateRenderer;

use LightnCandy\LightnCandy;

final class HandlebarsRenderer
{
    /**
     * Compile et rend un template Handlebars avec des données
     */
    public function render(string $template, array $data): string
    {
        // Compiler le template avec LightnCandy
        $phpCode = LightnCandy::compile($template, [
            'flags' => LightnCandy::FLAG_HANDLEBARS | 
                       LightnCandy::FLAG_ERROR_EXCEPTION |
                       LightnCandy::FLAG_RUNTIMEPARTIAL,
            'helpers' => [
                'uppercase' => function ($str) {
                    return strtoupper($str);
                },
                'lowercase' => function ($str) {
                    return strtolower($str);
                },
                'date' => function ($date, $format = 'Y-m-d') {
                    if ($date instanceof \DateTimeInterface) {
                        return $date->format($format);
                    }
                    return date($format, strtotime($date));
                },
                'number' => function ($number, $decimals = 2) {
                    return number_format((float)$number, $decimals, '.', ' ');
                },
                'currency' => function ($amount, $symbol = '€') {
                    return number_format((float)$amount, 2, '.', ' ') . ' ' . $symbol;
                },
            ],
        ]);

        // Créer la fonction de rendu
        $renderer = eval('?>' . $phpCode);

        // Rendre avec les données
        return $renderer($data);
    }

    /**
     * Valide qu'un template peut être compilé
     */
    public function validate(string $template): array
    {
        $errors = [];
        
        try {
            LightnCandy::compile($template, [
                'flags' => LightnCandy::FLAG_HANDLEBARS | LightnCandy::FLAG_ERROR_EXCEPTION,
            ]);
        } catch (\Exception $e) {
            $errors[] = $e->getMessage();
        }

        return $errors;
    }
}
