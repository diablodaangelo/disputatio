<?php

namespace App\Jobs;

use App\Enums\AiJobStatus;
use App\Enums\PaperStatus;
use App\Models\AiJob;
use App\Models\Paper;
use App\Models\PaperAnalysis;
use App\Models\PaperFinding;
use App\Models\PaperReference;
use App\Models\PaperScore;
use App\Models\PaperSection;
use App\Services\AiServiceClient;
use App\Services\AuditLogger;
use App\Services\PaperTextExtractor;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ProcessPaperAiAnalysisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 300;
    public int $paperId;
    public ?string $jobUuid;

    public function __construct(int $paperId, ?string $jobUuid = null)
    {
        $this->paperId = $paperId;
        $this->jobUuid = $jobUuid ?? (string) Str::uuid();
    }

    public function backoff(): array
    {
        return [30, 60, 120];
    }

    public function handle(
        PaperTextExtractor $extractor,
        AiServiceClient $aiClient
    ): void {
        $paper = Paper::find($this->paperId);
        if (! $paper) {
            return;
        }

        // Initialize or update AiJob tracking
        $aiJob = AiJob::firstOrCreate(
            ['job_uuid' => $this->jobUuid],
            [
                'paper_id' => $paper->id,
                'job_type' => 'PAPER_ANALYSIS',
                'status' => AiJobStatus::PROCESSING,
                'retry_count' => $this->attempts(),
                'max_retries' => $this->tries,
                'started_at' => now(),
            ]
        );

        $aiJob->update([
            'status' => AiJobStatus::PROCESSING,
            'retry_count' => $this->attempts(),
        ]);

        $paper->update(['status' => PaperStatus::PROCESSING]);

        AuditLogger::log('AI_ANALYSIS_STARTED', $paper, ['job_uuid' => $this->jobUuid, 'attempt' => $this->attempts()], null, $paper->uploaded_by);

        // Resolve absolute PDF path
        $diskPath = Storage::disk('local')->path($paper->file_path);

        // 1. Extract text and page map from PDF
        $extraction = $extractor->extract($diskPath);
        $fullText = $extraction['full_text'];

        if (empty($fullText)) {
            throw new Exception("Unable to extract text from paper PDF. The file may be scanned or empty.");
        }

        // 2. Call FastAPI analyze endpoint
        $metadata = [
            'title' => $paper->title,
            'publication_year' => $paper->publication_year,
            'authors' => $paper->authors()->pluck('name')->toArray(),
        ];

        $aiResult = $aiClient->analyze($paper->id, $fullText, $metadata, $aiJob);

        // 3. Persist AI analysis in a clean transaction
        DB::transaction(function () use ($paper, $aiResult, $aiJob) {
            $classification = $aiResult['classification'] ?? [];
            $structure = $aiResult['structure'] ?? [];
            $scores = $aiResult['scores'] ?? [];
            $findings = $aiResult['findings'] ?? [];
            $references = $aiResult['references_audit'] ?? [];
            $keywords = $aiResult['keywords'] ?? [];

            // Update Paper keywords if returned
            if (! empty($keywords)) {
                $paper->update(['keywords' => array_unique(array_merge($paper->keywords ?? [], $keywords))]);
            }

            // Save PaperAnalysis
            PaperAnalysis::updateOrCreate(
                ['paper_id' => $paper->id],
                [
                    'paper_type' => $classification['research_type'] ?? null,
                    'research_domain' => $classification['domain'] ?? null,
                    'research_questions' => $structure['research_questions'] ?? [],
                    'research_objective' => $structure['research_objective'] ?? null,
                    'methodology' => $structure['methodology'] ?? null,
                    'key_findings' => $structure['key_findings'] ?? [],
                    'limitations' => $structure['limitations'] ?? [],
                    'strengths' => $structure['strengths'] ?? [],
                    'weaknesses' => $structure['weaknesses'] ?? [],
                    'raw_ai_payload' => $aiResult,
                ]
            );

            // Save PaperScore
            PaperScore::updateOrCreate(
                ['paper_id' => $paper->id],
                [
                    'methodology_score' => $scores['methodology'] ?? 0,
                    'novelty_score' => $scores['novelty'] ?? 0,
                    'clarity_score' => $scores['clarity'] ?? 0,
                    'evidence_score' => $scores['evidence'] ?? 0,
                    'reproducibility_score' => $scores['reproducibility'] ?? 0,
                    'writing_quality_score' => $scores['writing_quality'] ?? 0,
                    'overall_score' => $scores['overall'] ?? 0,
                    'explanations' => $scores['explanations'] ?? [],
                ]
            );

            // Save Findings
            $paper->findings()->delete();
            foreach ($findings as $finding) {
                PaperFinding::create([
                    'paper_id' => $paper->id,
                    'severity' => strtoupper($finding['severity'] ?? 'LOW'),
                    'category' => $finding['category'] ?? 'General',
                    'finding' => $finding['finding'] ?? '',
                    'explanation' => $finding['explanation'] ?? '',
                    'evidence' => $finding['evidence'] ?? null,
                    'page_number' => $finding['page_number'] ?? null,
                    'confidence' => $finding['confidence'] ?? 1.0,
                ]);
            }

            // Save Sections
            if (! empty($structure['sections'])) {
                $paper->sections()->delete();
                foreach ($structure['sections'] as $idx => $sec) {
                    PaperSection::create([
                        'paper_id' => $paper->id,
                        'title' => $sec['title'] ?? "Section " . ($idx + 1),
                        'content' => '',
                        'section_order' => $idx + 1,
                        'page_start' => $sec['page_start'] ?? null,
                        'page_end' => $sec['page_end'] ?? null,
                    ]);
                }
            }

            // Save References Audit
            $paper->references()->delete();
            foreach ($references['uncited_references'] ?? [] as $uncited) {
                PaperReference::create([
                    'paper_id' => $paper->id,
                    'raw_citation' => $uncited,
                    'is_cited_in_body' => false,
                    'missing_from_bibliography' => false,
                ]);
            }
            foreach ($references['missing_citations'] ?? [] as $missing) {
                PaperReference::create([
                    'paper_id' => $paper->id,
                    'raw_citation' => $missing,
                    'is_cited_in_body' => true,
                    'missing_from_bibliography' => true,
                ]);
            }

            // Mark Paper as ANALYZED
            $paper->update(['status' => PaperStatus::ANALYZED]);

            // Mark AiJob as COMPLETED
            $aiJob->update([
                'status' => AiJobStatus::COMPLETED,
                'completed_at' => now(),
            ]);
        });

        // Automatically dispatch AI Review generation so review report is instantly ready
        if (!\App\Models\Review::where('paper_id', $paper->id)->where('is_ai_generated', true)->exists()) {
            \App\Jobs\GenerateAiReviewJob::dispatch($paper->id, $paper->uploaded_by);
        }

        AuditLogger::log('AI_ANALYSIS_COMPLETED', $paper, ['job_uuid' => $this->jobUuid], null, $paper->uploaded_by);
    }

    public function failed(?Throwable $exception): void
    {
        $paper = Paper::find($this->paperId);
        if ($paper) {
            $paper->update(['status' => PaperStatus::FAILED]);
        }

        $aiJob = AiJob::where('job_uuid', $this->jobUuid)->first();
        if ($aiJob) {
            $aiJob->update([
                'status' => AiJobStatus::FAILED,
                'error_message' => $exception ? $exception->getMessage() : 'AI processing failed unexpectedly.',
                'completed_at' => now(),
            ]);
        }

        AuditLogger::log('AI_JOB_FAILED', $paper, [
            'job_uuid' => $this->jobUuid,
            'error' => $exception ? $exception->getMessage() : 'Unknown error',
        ]);
    }
}
