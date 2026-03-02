<?php

declare(strict_types=1);

namespace App\Infrastructure\External\CodeExecution;

use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

final class JavaScriptSandboxService
{
    private string $sandboxScriptPath;
    private string $typescriptScriptPath;
    private string $pythonScriptPath;
    private string $nodePath;
    private int $timeoutSeconds = 10;

    public function __construct(string $projectDir)
    {
        $this->sandboxScriptPath    = $projectDir . '/scripts/sandbox-runner.js';
        $this->typescriptScriptPath = $projectDir . '/scripts/typescript-sandbox-runner.js';
        $this->pythonScriptPath     = $projectDir . '/scripts/python-sandbox-runner.py';
        // Use absolute node path so nvm-managed node is found regardless of server's PATH
        $this->nodePath = trim(shell_exec('which node 2>/dev/null') ?? 'node') ?: 'node';
    }

    public function execute(string $code, array $data, string $language = 'javascript'): array
    {
        $input = json_encode(['code' => $code, 'data' => $data]);

        $command = match($language) {
            'typescript' => [$this->nodePath, $this->typescriptScriptPath],
            'python'     => ['python3', $this->pythonScriptPath],
            default      => [$this->nodePath, $this->sandboxScriptPath],
        };

        $process = new Process($command);
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
    public function test(string $code, array $testData, string $language = 'javascript'): array
    {
        $startTime = microtime(true);
        $result = $this->execute($code, $testData, $language);
        $executionTime = (microtime(true) - $startTime) * 1000;// en ms

        return [
            'success' => $result['success'],
            'output_data' => $result['result'] ?? null,
            'logs' => $result['logs'] ?? [],
            'error' => $result['error'] ?? null,
            'execution_time_ms' => round($executionTime, 2),
        ];
    }
}
