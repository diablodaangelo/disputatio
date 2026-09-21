<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPaperAiAnalysisJob;
use App\Models\AiJob;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AiJobController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $query = AiJob::with(['paper.uploader']);

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $jobs = $query->latest()->paginate(15)->withQueryString();

        if ($request->wantsJson()) {
            return response()->json($jobs);
        }

        return Inertia::render('admin/ai-jobs', [
            'jobs' => $jobs,
            'filters' => $request->only(['status']),
        ]);
    }

    public function retry(AiJob $aiJob, Request $request)
    {
        $newUuid = (string) Str::uuid();
        ProcessPaperAiAnalysisJob::dispatch($aiJob->paper_id, $newUuid);

        AuditLogger::log('ADMIN_RETRIED_AI_JOB', $aiJob->paper, [
            'old_job_uuid' => $aiJob->job_uuid,
            'new_job_uuid' => $newUuid,
        ]);

        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->back()->with('success', 'Job retry berhasil dijalankan.');
        }

        return response()->json([
            'message' => 'Job retry dispatched successfully.',
            'job_uuid' => $newUuid,
        ]);
    }
}
