<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controller\Template;

use App\Application\Service\TemplateService;
use App\Domain\Entity\User;
use PhpOffice\PhpSpreadsheet\IOFactory as SpreadsheetFactory;
use Smalot\PdfParser\Parser as PdfParser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/templates/upload')]
#[IsGranted('ROLE_USER')]
final class TemplateUploadController extends AbstractController
{
    private const ALLOWED_MIME = [
        'text/plain',
        'text/html',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/octet-stream', // fallback for xlsx
    ];

    private const ALLOWED_EXT = ['txt', 'html', 'htm', 'pdf', 'xlsx', 'xls', 'csv'];

    public function __construct(
        private TemplateService $templateService,
    ) {}

    /**
     * POST /api/templates/upload
     * Analyse un fichier uploadé et retourne le contenu + les variables extraites.
     */
    #[Route('', name: 'templates_upload', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        $file = $request->files->get('file');

        if (!$file) {
            return $this->json(['error' => 'Aucun fichier reçu.'], Response::HTTP_BAD_REQUEST);
        }

        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, self::ALLOWED_EXT, true)) {
            return $this->json([
                'error' => 'Format non supporté. Accepté : ' . implode(', ', self::ALLOWED_EXT),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            [$content, $variables, $outputFormat] = match (true) {
                in_array($extension, ['txt', 'html', 'htm'], true) => $this->parseText($file->getPathname(), $extension),
                $extension === 'pdf'                               => $this->parsePdf($file->getPathname()),
                in_array($extension, ['xlsx', 'xls'], true)        => $this->parseExcel($file->getPathname()),
                $extension === 'csv'                               => $this->parseCsv($file->getPathname()),
                default => throw new \RuntimeException('Format non supporté'),
            };

            return $this->json([
                'content'      => $content,
                'variables'    => array_values(array_unique($variables)),
                'output_format' => $outputFormat,
                'source_name'  => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            ]);
        } catch (\Throwable $e) {
            return $this->json(
                ['error' => 'Erreur lors de l\'analyse : ' . $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }
    }

    /** Texte / HTML : extraire le contenu + chercher {{variables}} */
    private function parseText(string $path, string $extension): array
    {
        $content = file_get_contents($path);
        $variables = $this->extractHandlebarsVars($content);

        if ($extension === 'txt') {
            // Garder le contenu tel quel pour la génération texte
            return [$content, $variables, 'txt'];
        }

        // HTML/HTM : si pas de variables Handlebars, encapsuler le contenu brut
        if (empty($variables)) {
            $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');
            $content = "<!DOCTYPE html>\n<html><body>\n{$content}\n</body></html>";
        }

        return [$content, $variables, 'html'];
    }

    /** PDF : extraire le texte puis chercher les patterns */
    private function parsePdf(string $path): array
    {
        $parser  = new PdfParser();
        $pdf     = $parser->parseFile($path);
        $text    = $pdf->getText();

        $variables = $this->extractHandlebarsVars($text);

        // Génère un template HTML avec le texte extrait
        $escapedText = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
        $content = "<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"UTF-8\">\n  <style>body{font-family:Arial,sans-serif;padding:2rem;} pre{white-space:pre-wrap;}</style>\n</head>\n<body>\n<pre>{$escapedText}</pre>\n</body>\n</html>";

        return [$content, $variables, 'pdf'];
    }

    /** Excel/XLSX : lire les en-têtes de colonnes et générer un template de tableau */
    private function parseExcel(string $path): array
    {
        $spreadsheet = SpreadsheetFactory::load($path);
        $sheet       = $spreadsheet->getActiveSheet();
        $rows        = $sheet->toArray(null, true, true, false);

        if (empty($rows)) {
            throw new \RuntimeException('Le fichier Excel est vide.');
        }

        // Première ligne = en-têtes
        $headers = array_filter(array_map(fn($h) => $h !== null ? trim((string)$h) : null, $rows[0]));
        $headers = array_values($headers);

        if (empty($headers)) {
            throw new \RuntimeException('Impossible de lire les en-têtes du fichier Excel.');
        }

        // Convertit les en-têtes en noms de variables valides (snake_case)
        $variables = array_map(fn($h) => $this->toVarName($h), $headers);

        // Génère un template de tableau HTML
        $thCells = implode("\n        ", array_map(fn($h) => "<th>{$h}</th>", $headers));
        $tdCells = implode("\n        ", array_map(fn($v) => "<td>{{{{$v}}}}</td>", $variables));

        $content = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body  { font-family: Arial, sans-serif; padding: 2rem; }
    h1    { color: #d2a679; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th    { background: #d2a679; color: #fff; padding: 8px 12px; text-align: left; }
    td    { border-bottom: 1px solid #eee; padding: 8px 12px; }
    tr:nth-child(even) td { background: #fafafa; }
  </style>
</head>
<body>
  <h1>{{title}}</h1>
  <p>Généré le {{date generated_at "d/m/Y"}}</p>

  <table>
    <thead>
      <tr>
        {$thCells}
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        {$tdCells}
      </tr>
      {{/each}}
    </tbody>
  </table>
</body>
</html>
HTML;

        // Les variables du template incluent les colonnes + title, generated_at, items
        $allVars = array_merge(['title', 'generated_at', 'items'], $variables);

        return [$content, $allVars, 'xlsx'];
    }

    /** CSV : même logique que Excel mais avec fgetcsv */
    private function parseCsv(string $path): array
    {
        $handle = fopen($path, 'r');
        $headers = fgetcsv($handle);
        fclose($handle);

        if (!$headers) {
            throw new \RuntimeException('CSV vide ou illisible.');
        }

        $headers   = array_map('trim', $headers);
        $variables = array_map(fn($h) => $this->toVarName($h), $headers);

        $thCells = implode("\n        ", array_map(fn($h) => "<th>{$h}</th>", $headers));
        $tdCells = implode("\n        ", array_map(fn($v) => "<td>{{{{$v}}}}</td>", $variables));

        $content = <<<HTML
<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<style>body{font-family:Arial,sans-serif;padding:2rem;} table{width:100%;border-collapse:collapse;} th{background:#d2a679;color:#fff;padding:8px;} td{border-bottom:1px solid #eee;padding:8px;}</style>
</head><body>
<h1>{{title}}</h1>
<table><thead><tr>{$thCells}</tr></thead>
<tbody>{{#each items}}<tr>{$tdCells}</tr>{{/each}}</tbody>
</table></body></html>
HTML;

        return [$content, array_merge(['title', 'items'], $variables), 'xlsx'];
    }

    /** Extrait les noms de variables Handlebars {{varName}} */
    private function extractHandlebarsVars(string $content): array
    {
        preg_match_all('/\{\{(?!#|\/|>|!)([a-zA-Z_][a-zA-Z0-9_\.]*)\}\}/', $content, $matches);
        return $matches[1] ?? [];
    }

    /** Convertit un texte en nom de variable valide (snake_case) */
    private function toVarName(string $text): string
    {
        $var = strtolower($text);
        $var = preg_replace('/[^a-z0-9]+/', '_', $var);
        $var = trim($var, '_');
        return $var ?: 'column';
    }
}
