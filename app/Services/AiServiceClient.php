<?php

namespace App\Services;

use App\Models\AiJob;
use App\Models\AiRequest;
use App\Models\AiResponse;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AiServiceClient
{
    protected string $baseUrl;
    protected string $internalKey;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('ai_service.base_url', 'http://127.0.0.1:8001'), '/');
        $this->internalKey = config('ai_service.internal_key', 'disputatio-secret-internal-token-2026');
        $this->timeout = (int) config('ai_service.timeout', 120);
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     * @throws Exception
     */
    public function send(string $endpoint, array $payload, ?AiJob $aiJob = null): array
    {
        $requestUuid = (string) Str::uuid();
        $payload['request_id'] = $requestUuid;

        $aiRequest = AiRequest::create([
            'ai_job_id' => $aiJob?->id,
            'request_uuid' => $requestUuid,
            'endpoint' => $endpoint,
            'payload' => $payload,
        ]);

        $startTime = microtime(true);

        try {
            $url = "{$this->baseUrl}/api/v1/{$endpoint}";
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'X-Internal-Key' => $this->internalKey,
                    'Accept' => 'application/json',
                ])
                ->post($url, $payload);

            $executionTimeMs = (int) round((microtime(true) - $startTime) * 1000);
            $statusCode = $response->status();
            $responseData = $response->json();

            AiResponse::create([
                'ai_request_id' => $aiRequest->id,
                'status_code' => $statusCode,
                'response_data' => $responseData,
                'execution_time_ms' => $executionTimeMs,
            ]);

            if (! $response->successful() || ($responseData['success'] ?? false) === false) {
                $errorMsg = $responseData['error']['message'] ?? "AI Service HTTP {$statusCode}: {$response->body()}";
                throw new Exception($errorMsg);
            }

            return $responseData['data'] ?? [];
        } catch (Exception $e) {
            $executionTimeMs = (int) round((microtime(true) - $startTime) * 1000);

            AiResponse::create([
                'ai_request_id' => $aiRequest->id,
                'status_code' => 500,
                'response_data' => ['error' => $e->getMessage()],
                'execution_time_ms' => $executionTimeMs,
            ]);

            throw $e;
        }
    }

    public function analyze(int $paperId, string $rawText, array $metadata = [], ?AiJob $aiJob = null): array
    {
        return $this->send('analyze', [
            'paper_id' => $paperId,
            'raw_text' => $rawText,
            'metadata' => $metadata,
        ], $aiJob);
    }

    public function review(int $paperId, string $rawText, ?array $analysisData = null, ?AiJob $aiJob = null): array
    {
        return $this->send('review', [
            'paper_id' => $paperId,
            'raw_text' => $rawText,
            'analysis_data' => $analysisData,
        ], $aiJob);
    }

    public function qa(int $paperId, string $question, string $rawText, ?string $customApiKey = null): array
    {
        $payload = [
            'paper_id' => $paperId,
            'question' => $question,
            'raw_text' => $rawText,
        ];

        if ($customApiKey) {
            $payload['api_key'] = $customApiKey;
        }

        return $this->send('qa', $payload);
    }

    public function compare(array $paperA, array $paperB, ?string $customApiKey = null): array
    {
        $payload = [
            'paper_a' => $paperA,
            'paper_b' => $paperB,
        ];

        if ($customApiKey) {
            $payload['api_key'] = $customApiKey;
        }

        return $this->send('compare', $payload);
    }
}
