<?php

namespace App\Jobs;

use App\Enums\AiJobStatus;
use App\Enums\ReviewRecommendation;
use App\Models\AiJob;
use App\Models\Paper;
use App\Models\Review;
use App\Services\AiServiceClient;
use App\Services\AuditLogger;
use App\Services\PaperTextExtractor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class GenerateAiReviewJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 300;
    public int $paperId;
    public ?int $reviewerId;
    public ?string $jobUuid;

    public function __construct(int $paperId, ?int $reviewerId = null, ?string $jobUuid = null)
    {
        $this->paperId = $paperId;
        $this->reviewerId = $reviewerId;
        $this->jobUuid = $jobUuid ?? (string) Str::uuid();
    }

    public function handle(
        PaperTextExtractor $extractor,
        AiServiceClient $aiClient
    ): void {
        $paper = Paper::with('analysis')->find($this->paperId);
        if (! $paper) {
            return;
        }

        $aiJob = AiJob::firstOrCreate(
            ['job_uuid' => $this->jobUuid],
            [
                'paper_id' => $paper->id,
                'job_type' => 'GENERATE_AI_REVIEW',
                'status' => AiJobStatus::PROCESSING,
                'retry_count' => $this->attempts(),
                'max_retries' => $this->tries,
                'started_at' => now(),
            ]
        );

        $diskPath = Storage::disk('local')->path($paper->file_path);
        $extraction = $extractor->extract($diskPath);
        $fullText = $extraction['full_text'];

        $reviewResult = $aiClient->review(
            $paper->id,
            $fullText,
            $paper->analysis?->raw_ai_payload,
            $aiJob
        );

        // Convert recommendation string to enum
        $recRaw = strtoupper($reviewResult['recommendation'] ?? 'MAJOR_REVISION');
        $validRecommendations = array_column(ReviewRecommendation::cases(), 'value');
        if (! in_array($recRaw, $validRecommendations)) {
            $recRaw = ReviewRecommendation::MAJOR_REVISION->value;
        }

        Review::create([
            'paper_id' => $paper->id,
            'reviewer_id' => $this->reviewerId,
            'recommendation' => $recRaw,
            'summary' => $reviewResult['summary'] ?? '',
            'methodology_review' => $reviewResult['methodology_review'] ?? '',
            'novelty_review' => $reviewResult['novelty_review'] ?? '',
            'result_review' => $reviewResult['result_review'] ?? '',
            'reproducibility_review' => $reviewResult['reproducibility_review'] ?? '',
            'major_concerns' => $reviewResult['major_concerns'] ?? [],
            'minor_concerns' => $reviewResult['minor_concerns'] ?? [],
            'is_ai_generated' => true,
        ]);

        $aiJob->update([
            'status' => AiJobStatus::COMPLETED,
            'completed_at' => now(),
        ]);

        AuditLogger::log('AI_REVIEW_GENERATED', $paper, ['job_uuid' => $this->jobUuid], null, $this->reviewerId);
    }

    public function failed(?Throwable $exception): void
    {
        $aiJob = AiJob::where('job_uuid', $this->jobUuid)->first();
        if ($aiJob) {
            $aiJob->update([
                'status' => AiJobStatus::FAILED,
                'error_message' => $exception ? $exception->getMessage() : 'AI Review generation failed.',
                'completed_at' => now(),
            ]);
        }
    }
}
