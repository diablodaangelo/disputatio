<?php

use App\Http\Controllers\Admin\AiJobController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\ComparisonController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaperAnalysisController;
use App\Http\Controllers\PaperController;
use App\Http\Controllers\PaperQaController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard with Real Metrics
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Research Papers Management
    Route::resource('papers', PaperController::class)->except(['edit', 'update']);
    Route::get('papers/{paper}/file', [PaperController::class, 'file'])->name('papers.file');
    Route::get('papers/{paper}/status', [PaperAnalysisController::class, 'status'])->name('papers.status');
    Route::post('papers/{paper}/retry', [PaperAnalysisController::class, 'retry'])->name('papers.retry');
    Route::post('papers/{paper}/qa', [PaperQaController::class, 'ask'])->name('papers.qa');

    // Paper Comparison
    Route::get('compare', [ComparisonController::class, 'index'])->name('compare.index');
    Route::post('compare', [ComparisonController::class, 'compare'])->name('compare.process');

    // Reviewer & Peer Reviews
    Route::middleware('role:reviewer,admin')->group(function () {
        Route::post('papers/{paper}/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    });
    // AI Review generation - open to all authenticated users
    Route::post('reviews/{review}/comments', [ReviewController::class, 'addComment'])->name('reviews.comments.store');
    Route::delete('reviews/comments/{comment}', [ReviewController::class, 'deleteComment'])->name('reviews.comments.destroy');

    // Admin Console
    Route::prefix('admin')->middleware('role:admin')->name('admin.')->group(function () {
        Route::get('ai-jobs', [AiJobController::class, 'index'])->name('ai-jobs.index');
        Route::post('ai-jobs/{aiJob}/retry', [AiJobController::class, 'retry'])->name('ai-jobs.retry');
        Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::post('users/{user}/roles', [UserManagementController::class, 'updateRoles'])->name('users.update-roles');
        Route::post('users/{user}/toggle-role', [UserManagementController::class, 'toggleRole'])->name('users.toggle-role');
        Route::delete('users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/settings.php';
