<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\DocumentGeneration;
use App\Domain\Entity\Document;
use App\Domain\Repository\DocumentGenerationRepositoryInterface;
use App\Infrastructure\External\CodeExecution\JavaScriptSandboxService;
use App\Infrastructure\External\TemplateRenderer\HandlebarsRenderer;
use App\Infrastructure\External\PdfGeneration\SnappyPdfService;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

final class DocumentGenerationService
{
    public function __construct(
        private DocumentGenerationRepositoryInterface $generationRepository,
        private TemplateService $templateService,
        private CodeProcessorService $codeProcessorService,
        private DocumentVariableService $variableService,
        private JavaScriptSandboxService $sandboxService,
        private HandlebarsRenderer $handlebarsRenderer,
        private SnappyPdfService $pdfService,
        private string $generatedFilesPath,
    ) {}

    /**
     * Crée un nouvel enregistrement de génération
     */
    public function createGeneration(Document $document, ?array $input_params = null): DocumentGeneration
    {
        $generation = new DocumentGeneration($document);
        $generation->setInputParams($input_params);
        $generation->setStatus('pending');

        $this->generationRepository->save($generation);

        return $generation;
    }

    /**
     * Met à jour l'état de la génération
     */
    public function updateGenerationStatus(
        DocumentGeneration $generation,
        string $status,
        ?array $api_response = null,
        ?array $processed_data = null,
        ?array $extracted_variables = null,
        ?string $rendered_output = null,
        ?string $file_path = null,
        ?string $error_message = null,
        ?string $execution_logs = null,
    ): DocumentGeneration {
        $generation->setStatus($status);

        if ($api_response !== null) {
            $generation->setApiResponse($api_response);
        }
        if ($processed_data !== null) {
            $generation->setProcessedData($processed_data);
        }
        if ($extracted_variables !== null) {
            $generation->setExtractedVariables($extracted_variables);
        }
        if ($rendered_output !== null) {
            $generation->setRenderedOutput($rendered_output);
        }
        if ($file_path !== null) {
            $generation->setFilePath($file_path);
        }
        if ($error_message !== null) {
            $generation->setErrorMessage($error_message);
        }
        if ($execution_logs !== null) {
            $generation->setExecutionLogs($execution_logs);
        }

        $this->generationRepository->save($generation);

        return $generation;
    }

    /**
     * Récupère les générations d'un document
     */
    public function getGenerationsByDocument(Document $document): array
    {
        return $this->generationRepository->findByDocument($document);
    }

    /**
     * Récupère les générations d'un document avec pagination
     */
    public function getGenerationsByDocumentPaginated(Document $document, int $page = 1, int $limit = 20): array
    {
        return $this->generationRepository->findByDocumentWithPagination($document, $page, $limit);
    }

    /**
     * Compte le nombre de générations pour un document
     */
    public function countGenerationsByDocument(Document $document): int
    {
        return $this->generationRepository->countByDocument($document);
    }

    /**
     * Récupère une génération spécifique
     */
    public function getGeneration(int $id): ?DocumentGeneration
    {
        return $this->generationRepository->findById($id);
    }
    /**
     * Exécute le workflow complet de génération de document
     */
    public function generateDocument(Document $document, ?array $input_params = []): DocumentGeneration
    {
        // 1. Démarrer la génération
        $generation = $this->createGeneration($document, $input_params);
        $this->updateGenerationStatus($generation, 'processing', execution_logs: "Starting generation process...\n");
        $logs = ["Starting generation process..."];
        
        try {
            // 2. Vérifier le template
            $template = $this->templateService->getTemplateByDocument($document);
            if (!$template) {
                throw new \RuntimeException("No template found for this document.");
            }
            $logs[] = "Template found: " . $template->getId();

            // 3. Préparer l'appel API
            $apiSource = $document->getApiSource();
            $baseUrl = rtrim($apiSource->getUrlBase(), '/');
            $endpoint = $document->getEndpoint();
            
            // Remplacer les path params
            foreach ($input_params as $key => $value) {
                if (is_scalar($value) && str_contains($endpoint, '{' . $key . '}')) {
                    $endpoint = str_replace('{' . $key . '}', (string)$value, $endpoint);
                }
            }
            
            $url = $baseUrl . '/' . ltrim($endpoint, '/');
            $logs[] = "Fetching data from: $url";

            // 4. Appel API
            $client = new Client();
            $requestOptions = [
                'query' => $document->getQueryParams(),
                'headers' => []
            ];

            // Authentification
            switch ($apiSource->getAuthType()) {
                case 'bearer':
                    // TODO: Décrypter le token si chiffré
                    $requestOptions['headers']['Authorization'] = 'Bearer ' . $apiSource->getAuthToken();
                    break;
                case 'basic':
                     // TODO: Gérer basic auth username:password
                    $requestOptions['headers']['Authorization'] = 'Basic ' . base64_encode($apiSource->getAuthToken());
                    break;
                case 'api_key':
                    // TODO: Supporter header custom ou query param
                    $requestOptions['headers']['X-API-Key'] = $apiSource->getAuthToken();
                    break;
            }

            // Headers custom
            if ($apiSource->getHeaders()) {
                foreach ($apiSource->getHeaders() as $key => $value) {
                    $requestOptions['headers'][$key] = $value;
                }
            }

            try {
                $response = $client->request($document->getMethod(), $url, $requestOptions);
                $apiData = json_decode($response->getBody()->getContents(), true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \RuntimeException("API did not return valid JSON: " . json_last_error_msg());
                }

                $this->updateGenerationStatus(
                    $generation, 
                    'processing', 
                    api_response: $apiData,
                    execution_logs: implode("\n", $logs) . "\nAPI data fetched successfully.\n"
                );
                $logs[] = "API data fetched successfully.";

            } catch (GuzzleException $e) {
                throw new \RuntimeException("API request failed: " . $e->getMessage());
            }

            // 5. Extraction des variables
            // TODO: Implémenter extraction via DocumentVariableService si nécessaire
            // Pour l'instant on utilise toute la réponse API comme base
            $processedData = $apiData;
            
            // 6. Exécution du Code Processor (si présent)
            $codeProcessor = $this->codeProcessorService->getCodeProcessorByDocument($document);
            
            if ($codeProcessor) {
                $logs[] = "Executing Code Processor...";
                $sandboxResult = $this->sandboxService->execute($codeProcessor->getCode(), $processedData);
                
                if (!$sandboxResult['success']) {
                    throw new \RuntimeException("Code execution failed: " . $sandboxResult['error']);
                }
                
                $processedData = $sandboxResult['result'];
                $logs[] = "Code execution successful.";
                if (!empty($sandboxResult['logs'])) {
                    $logs[] = "JS Logs: " . implode("\n", $sandboxResult['logs']);
                }
            }

            $this->updateGenerationStatus(
                $generation,
                'processing',
                processed_data: $processedData,
                execution_logs: implode("\n", $logs)
            );

            // 7. Rendu du Template
            $logs[] = "Rendering template...";
            try {
                $html = $this->handlebarsRenderer->render($template->getContent(), $processedData);
            } catch (\Exception $e) {
                throw new \RuntimeException("Template rendering failed: " . $e->getMessage());
            }
            
            $this->updateGenerationStatus(
                $generation,
                'processing',
                rendered_output: $html,
                execution_logs: implode("\n", $logs) . "\nTemplate rendered successfully.\n"
            );

            // 8. Génération du PDF (si format PDF)
            if ($template->getOutputFormat() === 'pdf') {
                $logs[] = "Generating PDF...";
                $fileName = sprintf('doc_%d_%s.pdf', $document->getId(), date('Ymd_His'));
                $filePath = $this->generatedFilesPath . '/' . $fileName;
                
                if (!file_exists($this->generatedFilesPath)) {
                    if (!mkdir($this->generatedFilesPath, 0777, true) && !is_dir($this->generatedFilesPath)) {
                         throw new \RuntimeException(sprintf('Directory "%s" was not created', $this->generatedFilesPath));
                    }
                }

                try {
                    $this->pdfService->generateFromHtml($html, $filePath);
                    $logs[] = "PDF generated at: $filePath";
                } catch (\Exception $e) {
                    throw new \RuntimeException("PDF generation failed: " . $e->getMessage());
                }
            } else {
                // TODO: Autres formats
                $filePath = null;
                $logs[] = "Output generation skipped (only PDF supported in MVP).";
            }

            // 9. Finalisation
            $this->updateGenerationStatus(
                $generation,
                'completed',
                file_path: $filePath,
                execution_logs: implode("\n", $logs) . "\nGeneration completed successfully."
            );

            return $generation;

        } catch (\Throwable $e) {
            $logs[] = "ERROR: " . $e->getMessage();
            $this->updateGenerationStatus(
                $generation,
                'failed',
                error_message: $e->getMessage(),
                execution_logs: implode("\n", $logs)
            );
            // On ne relance pas l'exception pour que le contrôleur reçoive l'objet generation en erreur
            return $generation;
        }
    }
}
