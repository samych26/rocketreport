<?php

declare(strict_types=1);

namespace App\Infrastructure\External\PdfGeneration;

use Knp\Snappy\Pdf;

final class SnappyPdfService
{
    private Pdf $snappy;

    public function __construct(string $wkhtmltopdfBinary)
    {
        $this->snappy = new Pdf($wkhtmltopdfBinary);
        
        // Configuration par défaut
        $this->snappy->setOptions([
            'page-size' => 'A4',
            'margin-top' => 10,
            'margin-right' => 10,
            'margin-bottom' => 10,
            'margin-left' => 10,
            'encoding' => 'UTF-8',
            'enable-local-file-access' => true,
        ]);
    }

    /**
     * Génère un PDF à partir de HTML
     * 
     * @param string $html Contenu HTML
     * @param string $outputPath Chemin du fichier de sortie
     * @param array $options Options supplémentaires pour wkhtmltopdf
     */
    public function generateFromHtml(string $html, string $outputPath, array $options = []): void
    {
        if (!empty($options)) {
            $this->snappy->setOptions($options);
        }

        $this->snappy->generateFromHtml($html, $outputPath);
    }

    /**
     * Génère un PDF et retourne le contenu binaire
     */
    public function generateFromHtmlString(string $html, array $options = []): string
    {
        if (!empty($options)) {
            $this->snappy->setOptions($options);
        }

        return $this->snappy->getOutputFromHtml($html);
    }
}
