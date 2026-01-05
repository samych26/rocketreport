<?php

namespace App\Infrastructure\Service;

use App\Domain\Entity\ApiSource;
use App\Domain\Service\ApiClient;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

final class GuzzleApiClient implements ApiClient
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client();
    }

    public function fetchData(ApiSource $source, array $params = []): array
    {
        $combinedData = [];
        $baseUrl = rtrim($source->baseUrl(), '/');

        foreach ($source->endpoints() as $endpoint) {
            try {
                $url = $baseUrl . '/' . ltrim($endpoint->path(), '/');
                $method = $source->method(); // Could be overridden by endpoint if needed

                $options = [
                    'headers' => $endpoint->headers(),
                    'query' => $endpoint->queryParams(),
                ];

                // Auth logic
                if ($source->authType() === 'API_KEY' && isset($options['headers']['X-API-KEY'])) {
                    // Already in headers from endpoint config
                } elseif ($source->authType() === 'Bearer' && isset($params['token'])) {
                    $options['headers']['Authorization'] = 'Bearer ' . $params['token'];
                }

                $response = $this->client->request($method, $url, $options);
                $content = $response->getBody()->getContents();
                $data = json_decode($content, true) ?: [];
                
                $filteredData = $this->applyFilters($data, $endpoint->filters());
                $combinedData = array_merge($combinedData, $filteredData);
            } catch (GuzzleException $e) {
                // Continue to next endpoint even if one fails
                continue;
            }
        }

        return $combinedData;
    }

    private function applyFilters(array $data, array $filters): array
    {
        if (empty($filters)) {
            return $data;
        }

        // Check if data is a list or a single object
        $isList = array_is_list($data);
        $items = $isList ? $data : [$data];

        $filteredItems = array_filter($items, function ($item) use ($filters) {
            foreach ($filters as $filter) {
                $field = $filter['field'] ?? null;
                $operator = $filter['operator'] ?? 'equals';
                $value = $filter['value'] ?? null;

                if (!$field || !isset($item[$field])) {
                    return false;
                }

                $itemValue = $item[$field];

                switch ($operator) {
                    case 'equals':
                        if ($itemValue != $value) return false;
                        break;
                    case 'not_equals':
                        if ($itemValue == $value) return false;
                        break;
                    case 'contains':
                        if (strpos((string)$itemValue, (string)$value) === false) return false;
                        break;
                    case 'greater_than':
                        if ($itemValue <= $value) return false;
                        break;
                    case 'less_than':
                        if ($itemValue >= $value) return false;
                        break;
                }
            }
            return true;
        });

        return $isList ? array_values($filteredItems) : (reset($filteredItems) ?: []);
    }
}
