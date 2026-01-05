<?php

namespace App\Infrastructure\Service;

use App\Domain\Entity\Template;
use App\Domain\Service\DocumentGenerator;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

final class TwigDocumentGenerator implements DocumentGenerator
{
    private Environment $twig;

    public function __construct()
    {
        // We use a fresh Twig environment with ArrayLoader to handle dynamic string templates
        $this->twig = new Environment(new ArrayLoader([]));
    }

    public function generate(Template $template, array $data, string $format): string
    {
        $templateName = 'template_' . $template->id()->value();
        $loader = $this->twig->getLoader();
        
        if ($loader instanceof ArrayLoader) {
            $loader->setTemplate($templateName, $template->content());
        }

        $html = $this->twig->render($templateName, $data);

        if ($format === 'PDF') {
            // Placeholder for PDF generation
            // return $this->convertToPdf($html);
            return "PDF Binary for: " . $html;
        }

        return $html;
    }
}
