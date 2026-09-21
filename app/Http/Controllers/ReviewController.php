<?php

namespace App\Http\Controllers;

use App\Enums\ReviewRecommendation;
use App\Http\Requests\StoreReviewRequest;
use App\Jobs\GenerateAiReviewJob;
use App\Models\Paper;
use App\Models\Review;
use App\Models\ReviewComment;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    public function store(Paper $paper, StoreReviewRequest $request)
    {
        $review = Review::create([
            'paper_id' => $paper->id,
            'reviewer_id' => Auth::id(),
            'score' => $request->filled('score') ? (int) $request->input('score') : null,
            'recommendation' => ReviewRecommendation::from($request->input('recommendation')),
            'summary' => $request->input('summary'),
            'methodology_review' => $request->input('methodology_review'),
            'novelty_review' => $request->input('novelty_review'),
            'result_review' => $request->input('result_review'),
            'reproducibility_review' => $request->input('reproducibility_review'),
            'major_concerns' => $request->input('major_concerns', []),
            'minor_concerns' => $request->input('minor_concerns', []),
            'is_ai_generated' => false,
        ]);

        AuditLogger::log('REVIEWER_SUBMITTED_REVIEW', $paper, [
            'review_id' => $review->id,
            'score' => $review->score,
            'recommendation' => $review->recommendation->value,
        ]);

        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->back()->with('success', 'Ulasan dan penilaian berhasil disimpan.');
        }

        return response()->json([
            'message' => 'Review submitted successfully.',
            'review' => $review,
        ], 201);
    }

    public function generateAiReview(Paper $paper): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole('researcher') && $paper->uploaded_by !== $user->id) {
            return response()->json([
                'message' => 'Hanya Peneliti pemilik makalah yang berhak membuat ulasan otomatis AI.',
            ], 403);
        }

        $jobUuid = (string) Str::uuid();
        GenerateAiReviewJob::dispatch($paper->id, $user->id, $jobUuid);

        AuditLogger::log('REQUESTED_AI_REVIEW_GENERATION', $paper, ['job_uuid' => $jobUuid]);

        return response()->json([
            'status' => 'processing',
            'message' => 'AI Review report generation has been queued.',
            'job_uuid' => $jobUuid,
        ]);
    }

    public function addComment(Review $review, Request $request)
    {
        $request->validate(['comment' => 'required|string|max:2000']);

        $comment = ReviewComment::create([
            'review_id' => $review->id,
            'user_id' => Auth::id(),
            'comment' => $request->input('comment'),
        ]);

        AuditLogger::log('REVIEW_COMMENT_ADDED', $review, ['comment_id' => $comment->id]);

        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->back()->with('success', 'Komentar berhasil ditambahkan.');
        }

        return response()->json([
            'message' => 'Comment added.',
            'comment' => $comment->load('user'),
        ]);
    }

    public function deleteComment(ReviewComment $comment, Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Only the comment author or an Admin can delete the comment
        if ($comment->user_id !== $user->id && !$user->hasRole(\App\Enums\UserRole::ADMIN)) {
            if ($request->header('X-Inertia') || !$request->wantsJson()) {
                return redirect()->back()->withErrors(['message' => 'Akses Ditolak: Anda hanya dapat menghapus komentar Anda sendiri.']);
            }
            return response()->json([
                'message' => 'Akses Ditolak: Anda hanya dapat menghapus komentar Anda sendiri.',
            ], 403);
        }

        AuditLogger::log('REVIEW_COMMENT_DELETED', $comment, ['comment_id' => $comment->id]);

        $comment->delete();

        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->back()->with('success', 'Komentar berhasil dihapus.');
        }

        return response()->json([
            'message' => 'Komentar berhasil dihapus.',
        ]);
    }
}
