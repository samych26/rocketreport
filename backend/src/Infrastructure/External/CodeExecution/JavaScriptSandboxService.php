<?php

declare(strict_types=1);

namespace App\Infrastructure\External\CodeExecution;

use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

final class JavaScriptSandboxService
{
    private string $sandboxScriptPath;
    private int $timeoutSeconds = 10;

    public function __construct(string $projectDir)
    {
        $this->sandboxScriptPath = $projectDir . '/scripts/sandbox-runner.js';
    }

    /**
     * Exécute du code JavaScript dans un environnement sandboxé
     * 
     * @param string $code Code JavaScript à exécuter
     * @param array $data Données à passer au code
     * @return array Résultat avec ['success' => bool, 'result' => mixed, 'logs' => array, 'error' => string|null]
     */
    public function execute(string $code, array $data): array
    {
        // Préparer l'input JSON
        $input = json_encode([
            'code' => $code,
            'data' => $data,
        ]);

        // Créer le process Node.js
        $process = new Process(['node', $this->sandboxScriptPath]);
        $process->setInput($input);
        $process->setTimeout($this->timeoutSeconds);

        try {
            $process->run();

            $output = $process->getOutput();
            $result = json_decode($output, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return [
                    'success' => false,
                    'result' => null,
                    'logs' => [],
                    'error' => 'Failed to parse sandbox output: ' . json_last_error_msg(),
                    'raw_output' => $output,
                ];
            }

            return $result;

        } catch (ProcessFailedException $e) {
            return [
                'success' => false,
                'result' => null,
                'logs' => [],
                'error' => 'Process failed: ' . $e->getMessage(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'result' => null,
                'logs' => [],
                'error' => 'Execution error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Teste le code avec des données de test
     */
    public function test(string $code, array $testData): array
    {
        $startTime = microtime(true);
        $result = $this->execute($code, $testData);
        $executionTime = (microtime(true) - $startTime) * 1000; // en ms

        return [
            'success' => $result['success'],
            'output_data' => $result['result'] ?? null,
            'logs' => $result['logs'] ?? [],
            'error' => $result['error'] ?? null,
            'execution_time_ms' => round($executionTime, 2),
        ];
    }
}
