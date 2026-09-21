<?php

namespace App\Http\Controllers;

use App\Http\Requests\ComparePaperRequest;
use App\Models\Paper;
use App\Services\AiServiceClient;
use App\Services\AuditLogger;
use App\Services\PaperTextExtractor;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ComparisonController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $query = Paper::select('id', 'title', 'status', 'publication_year', 'uploaded_by');

        // Researcher only sees their own papers; Reviewer & Admin can compare all papers
        if (! $user->hasRole(\App\Enums\UserRole::ADMIN) && ! $user->hasRole(\App\Enums\UserRole::REVIEWER)) {
            $query->where('uploaded_by', $user->id);
        }

        $papers = $query->latest()->get();

        return Inertia::render('papers/compare', [
            'available_papers' => $papers,
        ]);
    }

    public function compare(
        ComparePaperRequest $request,
        PaperTextExtractor $extractor,
        AiServiceClient $aiClient
    ): JsonResponse {
        try {
            $paperA = Paper::findOrFail($request->input('paper_a_id'));
            $paperB = Paper::findOrFail($request->input('paper_b_id'));

            $pathA = Storage::disk('local')->path($paperA->file_path);
            if (!file_exists($pathA)) {
                $pathA = storage_path('app/private/' . $paperA->file_path);
            }
            if (!file_exists($pathA)) {
                $pathA = storage_path('app/' . $paperA->file_path);
            }

            $pathB = Storage::disk('local')->path($paperB->file_path);
            if (!file_exists($pathB)) {
                $pathB = storage_path('app/private/' . $paperB->file_path);
            }
            if (!file_exists($pathB)) {
                $pathB = storage_path('app/' . $paperB->file_path);
            }

            $textA = $extractor->extract($pathA)['full_text'];
            $textB = $extractor->extract($pathB)['full_text'];

            $customApiKey = $request->input('api_key') ?: $request->header('X-Gemini-Key');

            $result = $aiClient->compare(
                ['id' => $paperA->id, 'title' => $paperA->title, 'text' => $textA],
                ['id' => $paperB->id, 'title' => $paperB->title, 'text' => $textB],
                $customApiKey
            );

            AuditLogger::log('PAPERS_COMPARED', null, [
                'paper_a_id' => $paperA->id,
                'paper_b_id' => $paperB->id,
            ]);

            return response()->json([
                'success' => true,
                'paper_a' => ['id' => $paperA->id, 'title' => $paperA->title],
                'paper_b' => ['id' => $paperB->id, 'title' => $paperB->title],
                'comparison' => $result,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
