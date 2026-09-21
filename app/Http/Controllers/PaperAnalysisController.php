<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPaperAiAnalysisJob;
use App\Models\Paper;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PaperAnalysisController extends Controller
{
    public function status(Paper $paper): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (! $user->hasRole(\App\Enums\UserRole::ADMIN) && ! $user->hasRole(\App\Enums\UserRole::REVIEWER)) {
            if ($paper->uploaded_by !== $user->id) {
                abort(404);
            }
        }

        $latestJob = $paper->aiJobs()->latest()->first();

        return response()->json([
            'paper_id' => $paper->id,
            'status' => $paper->status->value,
            'is_analyzed' => $paper->status->value === 'ANALYZED',
            'is_failed' => $paper->status->value === 'FAILED',
            'latest_job' => $latestJob ? [
                'job_uuid' => $latestJob->job_uuid,
                'status' => $latestJob->status->value,
                'retry_count' => $latestJob->retry_count,
                'error_message' => $latestJob->error_message,
                'started_at' => $latestJob->started_at,
                'completed_at' => $latestJob->completed_at,
            ] : null,
        ]);
    }

    public function retry(Paper $paper, Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->hasRole('reviewer') && !$user->hasRole('admin') && $paper->uploaded_by !== $user->id) {
            if ($request->header('X-Inertia') || !$request->wantsJson()) {
                return redirect()->back()->withErrors(['message' => 'Reviewer tidak memiliki izin untuk melakukan analisis ulang makalah.']);
            }
            return response()->json([
                'message' => 'Reviewer tidak memiliki izin untuk melakukan analisis ulang makalah.',
            ], 403);
        }

        $jobUuid = (string) Str::uuid();
        ProcessPaperAiAnalysisJob::dispatch($paper->id, $jobUuid);

        AuditLogger::log('RETRY_AI_ANALYSIS', $paper, ['job_uuid' => $jobUuid]);

        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->back()->with('success', 'Analisis ulang sedang diproses di latar belakang.');
        }

        return response()->json([
            'status' => 'processing',
            'message' => 'AI analysis retry dispatched.',
            'job_uuid' => $jobUuid,
        ]);
    }
}
