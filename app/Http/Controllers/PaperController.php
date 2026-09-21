<?php

namespace App\Http\Controllers;

use App\Enums\PaperStatus;
use App\Enums\UserRole;
use App\Http\Requests\StorePaperRequest;
use App\Jobs\ProcessPaperAiAnalysisJob;
use App\Models\Paper;
use App\Models\PaperAuthor;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaperController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $user = Auth::user();
        $query = Paper::with(['uploader', 'score', 'analysis', 'reviews.reviewer']);

        // Only Admin and Reviewer can view all papers.
        // Researcher / Standard User ONLY sees papers they uploaded!
        if (! $user->hasRole(UserRole::ADMIN) && ! $user->hasRole(UserRole::REVIEWER)) {
            $query->where('uploaded_by', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $papers = $query->latest()->paginate(12)->withQueryString();

        if ($request->wantsJson()) {
            return response()->json($papers);
        }

        return Inertia::render('papers/index', [
            'papers' => $papers,
            'filters' => $request->only(['status']),
        ]);
    }

    public function store(StorePaperRequest $request): JsonResponse|\Illuminate\Http\RedirectResponse
    {
        $file = $request->file('pdf');
        $hash = hash_file('sha256', $file->getRealPath());
        $fileName = "papers/{$hash}.pdf";

        // Store file securely in local disk
        Storage::disk('local')->putFileAs('papers', $file, "{$hash}.pdf");

        $paper = Paper::create([
            'title' => $request->input('title') ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'abstract' => $request->input('abstract'),
            'publication_year' => $request->input('publication_year') ?: (int) date('Y'),
            'journal' => $request->input('journal'),
            'doi' => $request->input('doi'),
            'file_path' => $fileName,
            'file_hash' => $hash,
            'file_size_bytes' => $file->getSize(),
            'status' => PaperStatus::UPLOADED,
            'uploaded_by' => Auth::id(),
        ]);

        // Save authors if provided
        if ($request->has('authors')) {
            foreach ($request->input('authors') as $idx => $authorName) {
                PaperAuthor::create([
                    'paper_id' => $paper->id,
                    'name' => trim($authorName),
                    'order' => $idx + 1,
                ]);
            }
        }

        AuditLogger::log('USER_UPLOADED_PAPER', $paper, [
            'title' => $paper->title,
            'file_size' => $paper->file_size_bytes,
        ]);

        // Dispatch background queue job for AI processing
        $jobUuid = (string) Str::uuid();
        ProcessPaperAiAnalysisJob::dispatch($paper->id, $jobUuid);

        // Return JSON for API clients, redirect for Inertia
        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'status' => 'processing',
                'message' => 'Paper uploaded successfully. AI analysis has been queued.',
                'paper_id' => $paper->id,
                'slug' => $paper->slug,
                'job_uuid' => $jobUuid,
            ], 202);
        }

        return redirect()->route('papers.show', $paper)
            ->with('success', 'Makalah berhasil diunggah! Analisis AI sedang berjalan di latar belakang.');
    }

    public function show(Paper $paper, Request $request): Response|JsonResponse
    {
        $user = Auth::user();

        // Authorization check: only owner, reviewer, or admin can view
        if (! $user->hasRole(UserRole::ADMIN) && ! $user->hasRole(UserRole::REVIEWER)) {
            if ($paper->uploaded_by !== $user->id) {
                abort(404);
            }
        }

        $paper->load([
            'uploader',
            'authors',
            'sections',
            'analysis',
            'score',
            'findings' => fn ($q) => $q->orderByRaw("FIELD(severity, 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW')"),
            'references',
            'reviews.reviewer',
            'reviews.comments.user',
            'aiJobs' => fn ($q) => $q->latest()->limit(5),
            'qas',
        ]);

        if ($request->wantsJson()) {
            return response()->json($paper);
        }

        return Inertia::render('papers/show', [
            'paper' => $paper,
        ]);
    }

    public function file(Paper $paper)
    {
        $user = Auth::user();

        // Authorization check: only owner, reviewer, or admin can view/download
        if (! $user->hasRole(UserRole::ADMIN) && ! $user->hasRole(UserRole::REVIEWER)) {
            if ($paper->uploaded_by !== $user->id) {
                abort(404);
            }
        }

        if (! $paper->file_path || ! Storage::disk('local')->exists($paper->file_path)) {
            abort(404, 'Berkas PDF tidak ditemukan.');
        }

        $fileName = Str::slug($paper->title) . '.pdf';

        return Storage::disk('local')->response(
            $paper->file_path,
            $fileName,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $fileName . '"',
            ]
        );
    }

    public function destroy(Paper $paper, Request $request): \Illuminate\Http\RedirectResponse|JsonResponse
    {
        $user = Auth::user();

        if ($paper->uploaded_by !== $user->id && ! $user->hasRole(UserRole::ADMIN)) {
            abort(404);
        }

        // Delete physical file
        if ($paper->file_path && Storage::disk('local')->exists($paper->file_path)) {
            Storage::disk('local')->delete($paper->file_path);
        }

        // Invalidate text extraction cache
        \Illuminate\Support\Facades\Cache::forget("paper_fulltext_{$paper->id}");
        \Illuminate\Support\Facades\Cache::forget("paper_fulltext_{$paper->id}_" . ($paper->file_hash ?: md5($paper->file_path)));

        AuditLogger::log('USER_DELETED_PAPER', $paper, ['title' => $paper->title]);
        $paper->delete();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['message' => 'Makalah berhasil dihapus.']);
        }

        return redirect()->route('papers.index')->with('success', 'Makalah berhasil dihapus.');
    }
}
