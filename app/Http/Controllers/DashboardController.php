<?php

namespace App\Http\Controllers;

use App\Enums\AiJobStatus;
use App\Enums\PaperStatus;
use App\Models\AiJob;
use App\Models\Paper;
use App\Models\PaperAnalysis;
use App\Models\PaperScore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = \Illuminate\Support\Facades\Auth::user();
        $isPrivileged = $user->hasRole(\App\Enums\UserRole::ADMIN) || $user->hasRole(\App\Enums\UserRole::REVIEWER);

        $papersQuery = Paper::query();
        if (! $isPrivileged) {
            $papersQuery->where('uploaded_by', $user->id);
        }

        $totalPapers = (clone $papersQuery)->count();
        $analyzedCount = (clone $papersQuery)->where('status', PaperStatus::ANALYZED)->count();
        $processingCount = (clone $papersQuery)->where('status', PaperStatus::PROCESSING)->count();
        $failedCount = (clone $papersQuery)->where('status', PaperStatus::FAILED)->count();

        $scoresQuery = PaperScore::query();
        if (! $isPrivileged) {
            $scoresQuery->whereHas('paper', fn ($q) => $q->where('uploaded_by', $user->id));
        }
        $avgScore = round((float) $scoresQuery->avg('overall_score'), 1);

        // Papers by Research Domain
        $domainQuery = PaperAnalysis::select('research_domain', DB::raw('count(*) as count'))
            ->whereNotNull('research_domain');
        if (! $isPrivileged) {
            $domainQuery->whereHas('paper', fn ($q) => $q->where('uploaded_by', $user->id));
        }
        $domainDistribution = $domainQuery->groupBy('research_domain')
            ->orderByDesc('count')
            ->limit(8)
            ->get();

        // AI Jobs success rate
        $aiJobsQuery = AiJob::query();
        if (! $isPrivileged) {
            $aiJobsQuery->whereHas('paper', fn ($q) => $q->where('uploaded_by', $user->id));
        }
        $totalAiJobs = (clone $aiJobsQuery)->count();
        $completedAiJobs = (clone $aiJobsQuery)->where('status', AiJobStatus::COMPLETED)->count();
        $successRate = $totalAiJobs > 0 ? round(($completedAiJobs / $totalAiJobs) * 100, 1) : 100.0;

        // Recent papers scoped strictly
        $recentPapers = (clone $papersQuery)->with(['uploader', 'score', 'analysis'])
            ->latest()
            ->limit(5)
            ->get();

        $metrics = [
            'total_papers' => $totalPapers,
            'analyzed_papers' => $analyzedCount,
            'processing_papers' => $processingCount,
            'failed_papers' => $failedCount,
            'average_score' => $avgScore,
            'success_rate' => $successRate,
            'domain_distribution' => $domainDistribution,
            'recent_papers' => $recentPapers,
        ];

        if ($request->wantsJson()) {
            return response()->json($metrics);
        }

        return Inertia::render('dashboard', [
            'metrics' => $metrics,
        ]);
    }
}
