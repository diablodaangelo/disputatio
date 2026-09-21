<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $logs = AuditLog::with('user')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        if ($request->wantsJson()) {
            return response()->json($logs);
        }

        return Inertia::render('admin/audit-logs', [
            'logs' => $logs,
        ]);
    }
}
