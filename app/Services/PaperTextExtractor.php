<?php

namespace App\Services;

use Exception;
use Smalot\PdfParser\Parser;

class PaperTextExtractor
{
    protected Parser $parser;

    public function __construct()
    {
        $this->parser = new Parser();
    }

    /**
     * @return array{full_text: string, pages: array<int, string>, page_count: int}
     */
    public function extract(string $filePath): array
    {
        if (!file_exists($filePath)) {
            throw new Exception("PDF file not found at path: {$filePath}");
        }

        $pdf = $this->parser->parseFile($filePath);
        $pages = $pdf->getPages();
        $pagesText = [];
        $fullText = '';

        foreach ($pages as $index => $page) {
            $pageNum = $index + 1;
            $text = $page->getText();
            $pagesText[$pageNum] = trim($text);
            $fullText .= "\n\n--- [PAGE {$pageNum}] ---\n" . $text;
        }

        return [
            'full_text' => trim($fullText),
            'pages' => $pagesText,
            'page_count' => count($pages),
        ];
    }
}
