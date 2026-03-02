<?php

declare(strict_types=1);

namespace App\Infrastructure\External\ReportGenerator;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

final class ExcelGeneratorService
{
    /**
     * Génère un fichier XLSX à partir des données traitées.
     *
     * - Tableau de tableaux/objets → table avec en-têtes
     * - Tableau plat (clé → valeur)  → deux colonnes Clé / Valeur
     */
    public function generateFromData(array $data, string $filePath): void
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Chercher un tableau de lignes dans la donnée (clé 'items', 'data', ou root array)
        $rows = null;
        if (isset($data['items']) && is_array($data['items'])) {
            $rows = $data['items'];
        } elseif (isset($data['data']) && is_array($data['data'])) {
            $rows = $data['data'];
        } elseif (array_is_list($data) && !empty($data) && is_array($data[0])) {
            $rows = $data;
        }

        if ($rows !== null && !empty($rows)) {
            $this->writeTable($sheet, $rows);
        } else {
            $this->writeKeyValue($sheet, $data);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
    }

    /** Écrit un tableau avec ligne d'en-tête stylisée */
    private function writeTable(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet, array $rows): void
    {
        $headers = array_keys((array) $rows[0]);

        // En-têtes
        foreach ($headers as $colIdx => $header) {
            $col = Coordinate::stringFromColumnIndex($colIdx + 1);
            $sheet->setCellValue("{$col}1", $header);
        }

        // Style en-tête
        $lastCol = Coordinate::stringFromColumnIndex(count($headers));
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D2A679']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // Données
        foreach ($rows as $rowIdx => $row) {
            $row = (array) $row;
            foreach ($headers as $colIdx => $header) {
                $value = $row[$header] ?? '';
                if (is_array($value)) {
                    $value = json_encode($value, JSON_UNESCAPED_UNICODE);
                }
                $col = Coordinate::stringFromColumnIndex($colIdx + 1);
                $sheet->setCellValue("{$col}" . ($rowIdx + 2), $value);
            }
        }

        // Auto-largeur colonnes
        foreach (range(1, count($headers)) as $colIdx) {
            $sheet->getColumnDimensionByColumn($colIdx)->setAutoSize(true);
        }
    }

    /** Écrit une table clé / valeur pour les objets plats */
    private function writeKeyValue(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet, array $data): void
    {
        $sheet->setCellValue('A1', 'Clé');
        $sheet->setCellValue('B1', 'Valeur');

        $sheet->getStyle('A1:B1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D2A679']],
        ]);

        $row = 2;
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value, JSON_UNESCAPED_UNICODE);
            }
            $sheet->setCellValue("A{$row}", $key);
            $sheet->setCellValue("B{$row}", $value);
            $row++;
        }

        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);
    }
}
