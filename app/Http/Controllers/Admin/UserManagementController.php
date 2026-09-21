<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');

        $query = User::with('roles')
            ->withCount(['papers', 'reviews']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            $query->whereHas('roles', function ($q) use ($roleFilter) {
                $q->where('name', $roleFilter);
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();
        $roles = Role::all();

        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::whereHas('roles', fn ($q) => $q->where('name', 'admin'))->count(),
            'total_reviewers' => User::whereHas('roles', fn ($q) => $q->where('name', 'reviewer'))->count(),
            'total_researchers' => User::whereHas('roles', fn ($q) => $q->where('name', 'researcher'))->count(),
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'users' => $users,
                'roles' => $roles,
                'stats' => $stats,
                'filters' => [
                    'search' => $search,
                    'role' => $roleFilter ?? 'all',
                ],
            ]);
        }

        return Inertia::render('admin/users', [
            'users' => $users,
            'roles' => $roles,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?? '',
                'role' => $roleFilter ?? 'all',
            ],
        ]);
    }

    public function toggleRole(User $user, Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($request->input('role_id'));
        $hasRole = $user->roles()->where('roles.id', $role->id)->exists();

        // Safety: Prevent removing last admin from oneself
        if ($hasRole && $role->name === 'admin' && $user->id === auth()->id()) {
            $adminCount = User::whereHas('roles', fn ($q) => $q->where('name', 'admin'))->count();
            if ($adminCount <= 1) {
                return redirect()->back()->with('error', 'Anda tidak dapat mencabut peran Admin dari akun Anda sendiri karena Anda adalah satu-satunya administrator.');
            }
        }

        if ($hasRole) {
            $user->roles()->detach($role->id);
            AuditLogger::log('ADMIN_REMOVED_ROLE', $user, [
                'role' => $role->name,
                'role_label' => $role->label,
            ]);
            $message = "Peran {$role->label} berhasil dicabut dari {$user->name}.";
        } else {
            $user->roles()->attach($role->id);
            AuditLogger::log('ADMIN_ASSIGNED_ROLE', $user, [
                'role' => $role->name,
                'role_label' => $role->label,
            ]);
            $message = "Peran {$role->label} berhasil diberikan ke {$user->name}.";
        }

        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->back()->with('success', $message);
        }

        return response()->json([
            'message' => $message,
            'roles' => $user->fresh()->roles,
        ]);
    }

    public function updateRoles(User $user, Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'role_ids' => 'present|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $roleIds = $request->input('role_ids', []);

        // Safety: check self admin removal
        if ($user->id === auth()->id()) {
            $adminRole = Role::where('name', 'admin')->first();
            if ($adminRole && !in_array($adminRole->id, $roleIds)) {
                return redirect()->back()->with('error', 'Anda tidak dapat mencabut peran Admin dari akun Anda sendiri.');
            }
        }

        $oldRoles = $user->roles->pluck('name')->toArray();
        $user->roles()->sync($roleIds);
        $newRoles = $user->fresh()->roles->pluck('name')->toArray();

        AuditLogger::log('ADMIN_SYNCED_ROLES', $user, [
            'old_roles' => $oldRoles,
            'new_roles' => $newRoles,
        ]);

        $message = "Hak akses & peran untuk {$user->name} berhasil diperbarui.";

        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->back()->with('success', $message);
        }

        return response()->json([
            'message' => $message,
            'roles' => $user->fresh()->roles,
        ]);
    }

    public function destroy(User $user, Request $request): RedirectResponse|JsonResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        // Safety: check if user is the last admin
        if ($user->hasRole('admin')) {
            $adminCount = User::whereHas('roles', fn ($q) => $q->where('name', 'admin'))->count();
            if ($adminCount <= 1) {
                return redirect()->back()->with('error', 'Akun administrator ini tidak dapat dihapus karena merupakan satu-satunya admin aktif.');
            }
        }

        $userName = $user->name;
        $userEmail = $user->email;
        $userId = $user->id;

        AuditLogger::log('ADMIN_DELETED_USER', null, [
            'deleted_user_id' => $userId,
            'name' => $userName,
            'email' => $userEmail,
        ]);

        $user->delete();

        $message = "Akun pengguna {$userName} ({$userEmail}) berhasil dihapus permanen.";

        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->back()->with('success', $message);
        }

        return response()->json([
            'message' => $message,
        ]);
    }
}
