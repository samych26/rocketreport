<?php

namespace App\Domain\Service;

use App\Domain\Entity\ApiSource;

interface ApiClient
{
    /**
     * @param ApiSource $source
     * @param array $params Optional override of parameters
     * @return array The data fetched from the API source
     */
    public function fetchData(ApiSource $source, array $params = []): array;
}
