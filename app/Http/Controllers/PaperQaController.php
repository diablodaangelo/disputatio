<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaperQaRequest;
use App\Models\Paper;
use App\Services\AiServiceClient;
use App\Services\AuditLogger;
use App\Services\PaperTextExtractor;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class PaperQaController extends Controller
{
    public function ask(
        Paper $paper,
        PaperQaRequest $request,
        PaperTextExtractor $extractor,
        AiServiceClient $aiClient
    ): JsonResponse {
        $user = Auth::user();

        // Chatbot AI is exclusively for Researcher who owns the paper
        if ($paper->uploaded_by !== $user->id) {
            abort(404);
        }

        try {
            // Cache extracted text keyed by paper ID and unique file hash to prevent stale cache collisions
            $cacheKey = "paper_fulltext_{$paper->id}_" . ($paper->file_hash ?: md5($paper->file_path));
            $fullText = Cache::remember($cacheKey, 86400, function () use ($paper, $extractor) {
                $diskPath = Storage::disk('local')->path($paper->file_path);
                if (!file_exists($diskPath)) {
                    $diskPath = storage_path('app/private/' . $paper->file_path);
                }
                $extraction = $extractor->extract($diskPath);
                return $extraction['full_text'];
            });

            if (empty(trim($fullText))) {
                throw new Exception('Naskah PDF tidak memuat teks yang dapat diekstrak (kemungkinan berupa scan gambar murni).');
            }

            $question = $request->input('question');
            $customApiKey = $request->input('api_key') ?: $request->header('X-Gemini-Key');

            $qaResult = $aiClient->qa($paper->id, $question, $fullText, $customApiKey);

            // Persist Q&A to database so history is preserved across page visits
            $savedQa = \App\Models\PaperQa::create([
                'paper_id' => $paper->id,
                'user_id' => $user->id,
                'question' => $question,
                'answer' => $qaResult['answer'] ?? '',
                'evidence' => $qaResult['evidence'] ?? null,
                'found' => $qaResult['found'] ?? true,
            ]);

            AuditLogger::log('PAPER_QA_ASKED', $paper, [
                'question' => $question,
                'found' => $qaResult['found'] ?? false,
                'has_custom_key' => !empty($customApiKey),
                'qa_id' => $savedQa->id,
            ]);

            return response()->json([
                'success' => true,
                'data' => $qaResult,
                'qa' => $savedQa,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
