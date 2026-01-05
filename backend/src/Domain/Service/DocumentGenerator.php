<?php

namespace App\Domain\Service;

use App\Domain\Entity\Template;

interface DocumentGenerator
{
    /**
     * @param Template $template
     * @param array $data Map of variable name -> value
     * @param string $format e.g. "PDF", "HTML"
     * @return string The generated document content (binary or text)
     */
    public function generate(Template $template, array $data, string $format): string;
}
