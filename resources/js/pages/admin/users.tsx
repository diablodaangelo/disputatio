import { useState, useTransition } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BookOpen,
    Check,
    ChevronDown,
    FileText,
    GraduationCap,
    Loader2,
    MessageSquare,
    MoreVertical,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    UserCheck,
    UserCog,
    Users,
    X,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface RoleItem {
    id: number;
    name: string;
    label: string;
    description?: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    created_at: string;
    papers_count?: number;
    reviews_count?: number;
    roles: RoleItem[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    users: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        links: PaginationLink[];
    };
    roles: RoleItem[];
    stats: {
        total_users: number;
        total_admins: number;
        total_reviewers: number;
        total_researchers: number;
    };
    filters: {
        search: string;
        role: string;
    };
}

export default function AdminUsers({ users, roles, stats, filters }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string } } }>().props;
    const currentUserId = auth?.user?.id;

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeRoleFilter, setActiveRoleFilter] = useState(filters.role || 'all');
    const [isPending, startTransition] = useTransition();

    // Modal state for Role Management
    const [roleModalUser, setRoleModalUser] = useState<UserItem | null>(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [isSavingRoles, setIsSavingRoles] = useState(false);

    // Modal state for Delete User
    const [deleteModalUser, setDeleteModalUser] = useState<UserItem | null>(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    // Filter handling
    const applyFilter = (newSearch: string, newRole: string) => {
        router.get(
            '/admin/users',
            {
                search: newSearch || undefined,
                role: newRole !== 'all' ? newRole : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter(searchQuery, activeRoleFilter);
    };

    const handleRoleTabChange = (role: string) => {
        setActiveRoleFilter(role);
        applyFilter(searchQuery, role);
    };

    // Quick single-role toggle
    const handleQuickToggleRole = (user: UserItem, roleId: number) => {
        router.post(
            `/admin/users/${user.id}/toggle-role`,
            { role_id: roleId },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    // Open Role Management Dialog
    const openRoleModal = (user: UserItem) => {
        setRoleModalUser(user);
        setSelectedRoleIds(user.roles.map((r) => r.id));
    };

    const toggleRoleInModal = (roleId: number) => {
        setSelectedRoleIds((prev) =>
            prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSaveRoles = () => {
        if (!roleModalUser) return;
        setIsSavingRoles(true);
        router.post(
            `/admin/users/${roleModalUser.id}/roles`,
            { role_ids: selectedRoleIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRoleModalUser(null);
                },
                onFinish: () => setIsSavingRoles(false),
            }
        );
    };

    // Open Delete User Confirmation Dialog
    const openDeleteModal = (user: UserItem) => {
        setDeleteModalUser(user);
    };

    const handleConfirmDelete = () => {
        if (!deleteModalUser) return;
        setIsDeletingUser(true);
        router.delete(`/admin/users/${deleteModalUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalUser(null);
            },
            onFinish: () => setIsDeletingUser(false),
        });
    };

    // Helper for role badge visual style
    const getRoleBadgeStyle = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return {
                    className: 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 font-semibold',
                    icon: Shield,
                    label: 'Admin',
                };
            case 'reviewer':
                return {
                    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium',
                    icon: UserCheck,
                    label: 'Reviewer',
                };
            default:
                return {
                    className: 'bg-muted text-muted-foreground border-border font-medium',
                    icon: GraduationCap,
                    label: 'Researcher',
                };
        }
    };

    // Initials generator
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Manajemen Pengguna', href: '/admin/users' }]}>
            <Head title="Manajemen Pengguna & Hak Akses - Disputatio Admin" />

            <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60 animate-enter">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border/80 text-muted-foreground text-xs font-medium mb-2.5">
                            <ShieldCheck className="size-3 text-foreground" />
                            <span>Konsol Administrasi Sistem</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            Manajemen Pengguna & Hak Akses
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola akun platform, tetapkan peran (Admin, Reviewer, Researcher), dan atur otorisasi akses secara terpadu.
                        </p>
                    </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-enter-delay-1">
                    <Card className="rounded-2xl border border-border/70 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">Total Akun Terdaftar</span>
                                <div className="text-2xl font-bold text-foreground">{stats.total_users}</div>
                                <span className="text-[11px] text-muted-foreground">Seluruh pengguna platform</span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-muted border border-border/70 flex items-center justify-center text-foreground">
                                <Users className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border/70 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">Administrator</span>
                                <div className="text-2xl font-bold text-foreground">{stats.total_admins}</div>
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Akses Penuh Sistem</span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
                                <Shield className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border/70 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">Reviewer Mitra Bestari</span>
                                <div className="text-2xl font-bold text-foreground">{stats.total_reviewers}</div>
                                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Evaluator Makalah</span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <UserCheck className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border/70 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">Peneliti / Pengguna</span>
                                <div className="text-2xl font-bold text-foreground">{stats.total_researchers}</div>
                                <span className="text-[11px] text-muted-foreground">Akses Unggah & Analisis</span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-muted border border-border/70 flex items-center justify-center text-foreground">
                                <GraduationCap className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and User Table Container */}
                <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden animate-enter-delay-2">
                    <CardHeader className="p-5 border-b border-border/60 bg-card">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Role Filter Tabs */}
                            <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50 text-xs">
                                {[
                                    { id: 'all', label: 'Semua Akun', count: stats.total_users },
                                    { id: 'admin', label: 'Admin', count: stats.total_admins },
                                    { id: 'reviewer', label: 'Reviewer', count: stats.total_reviewers },
                                    { id: 'researcher', label: 'Researcher', count: stats.total_researchers },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleRoleTabChange(tab.id)}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                                            activeRoleFilter === tab.id
                                                ? 'bg-background text-foreground shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                                            activeRoleFilter === tab.id ? 'bg-muted text-foreground' : 'text-muted-foreground'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Search Bar */}
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari nama atau email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 text-xs rounded-xl bg-background border-border"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                applyFilter('', activeRoleFilter);
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    )}
                                </div>
                                <Button type="submit" size="sm" variant="secondary" className="h-9 px-3 rounded-xl text-xs">
                                    Cari
                                </Button>
                            </form>
                        </div>
                    </CardHeader>

                    {/* Table */}
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/40 text-muted-foreground uppercase border-b border-border/60 text-[11px] font-semibold tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-5 font-semibold">Pengguna Platform</th>
                                    <th className="py-3.5 px-4 font-semibold">Aktivitas Riset</th>
                                    <th className="py-3.5 px-4 font-semibold">Peran & Akses (Klik untuk Ubah Cepat)</th>
                                    <th className="py-3.5 px-4 font-semibold">Terdaftar</th>
                                    <th className="py-3.5 px-5 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                            <Users className="size-8 mx-auto mb-2 opacity-40" />
                                            <p className="font-medium text-sm text-foreground">Tidak ada pengguna ditemukan</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Coba sesuaikan kata kunci pencarian atau filter peran.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => {
                                        const isSelf = user.id === currentUserId;
                                        const userRoleIds = user.roles.map((r) => r.id);

                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-muted/30 transition-colors group"
                                            >
                                                {/* User Info Column */}
                                                <td className="py-3.5 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-muted border border-border/80 flex items-center justify-center font-bold text-xs text-foreground shrink-0 shadow-xs">
                                                            {getInitials(user.name)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-foreground truncate max-w-[200px]">
                                                                    {user.name}
                                                                </span>
                                                                {isSelf && (
                                                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-mono">
                                                                        Anda
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-[11px] text-muted-foreground truncate block max-w-[220px]">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Activity Column */}
                                                <td className="py-3.5 px-4 text-muted-foreground">
                                                    <div className="flex items-center gap-3 text-[11px]">
                                                        <span className="flex items-center gap-1" title="Makalah Diunggah">
                                                            <FileText className="size-3.5 text-muted-foreground" />
                                                            <strong className="text-foreground">{user.papers_count ?? 0}</strong> Makalah
                                                        </span>
                                                        <span className="text-border">•</span>
                                                        <span className="flex items-center gap-1" title="Review Diberikan">
                                                            <MessageSquare className="size-3.5 text-muted-foreground" />
                                                            <strong className="text-foreground">{user.reviews_count ?? 0}</strong> Review
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Roles & Quick Toggles Column */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {/* Assigned Role Badges */}
                                                        {user.roles.length === 0 ? (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                Belum ada peran
                                                            </span>
                                                        ) : (
                                                            user.roles.map((r) => {
                                                                const style = getRoleBadgeStyle(r.name);
                                                                const Icon = style.icon;
                                                                return (
                                                                    <Badge
                                                                        key={r.id}
                                                                        variant="outline"
                                                                        className={`text-[11px] py-0.5 px-2 flex items-center gap-1.5 rounded-lg border shadow-2xs ${style.className}`}
                                                                    >
                                                                        <Icon className="size-3" />
                                                                        <span>{r.label || style.label}</span>
                                                                    </Badge>
                                                                );
                                                            })
                                                        )}

                                                        {/* Quick Role Toggle Dropdown */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className="text-[11px] px-2 py-0.5 rounded-lg border border-dashed border-border/80 hover:border-foreground/40 hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                                                                >
                                                                    <span>+ Ubah Cepat</span>
                                                                    <ChevronDown className="size-3 opacity-60" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" className="w-52 p-1.5 rounded-xl">
                                                                <DropdownMenuLabel className="text-[10px] text-muted-foreground font-mono uppercase px-2 py-1">
                                                                    Klik untuk Toggle Peran
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {roles.map((role) => {
                                                                    const isAssigned = userRoleIds.includes(role.id);
                                                                    return (
                                                                        <DropdownMenuItem
                                                                            key={role.id}
                                                                            onClick={() => handleQuickToggleRole(user, role.id)}
                                                                            className="flex items-center justify-between px-2 py-1.5 text-xs rounded-lg cursor-pointer"
                                                                        >
                                                                            <span className="font-medium text-foreground">
                                                                                {role.label}
                                                                            </span>
                                                                            {isAssigned ? (
                                                                                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                                                    <Check className="size-3.5" /> Aktif
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-[10px] text-muted-foreground">
                                                                                    Nonaktif
                                                                                </span>
                                                                            )}
                                                                        </DropdownMenuItem>
                                                                    );
                                                                })}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>

                                                {/* Created Date */}
                                                <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Manage Roles Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openRoleModal(user)}
                                                            className="h-8 px-2.5 text-xs rounded-xl border-border/80 hover:bg-muted text-foreground flex items-center gap-1.5"
                                                        >
                                                            <UserCog className="size-3.5 text-muted-foreground" />
                                                            <span>Atur Peran</span>
                                                        </Button>

                                                        {/* Delete User Button */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openDeleteModal(user)}
                                                            disabled={isSelf}
                                                            title={isSelf ? 'Anda tidak dapat menghapus akun Anda sendiri' : 'Hapus akun pengguna ini'}
                                                            className={`h-8 w-8 p-0 rounded-xl ${
                                                                isSelf
                                                                    ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                                                                    : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                                                            }`}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </CardContent>

                    {/* Pagination Footer */}
                    {users.total > 0 && (
                        <div className="p-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                            <div>
                                Menampilkan <strong className="text-foreground">{users.from ?? 0}</strong> -{' '}
                                <strong className="text-foreground">{users.to ?? 0}</strong> dari{' '}
                                <strong className="text-foreground">{users.total}</strong> pengguna
                            </div>

                            {/* Pagination Links */}
                            {users.links.length > 3 && (
                                <div className="flex items-center gap-1">
                                    {users.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 rounded-lg text-muted-foreground/50 text-xs border border-transparent"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => router.get(link.url!, {}, { preserveScroll: true, preserveState: true })}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'bg-background hover:bg-muted text-foreground border-border/80'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>

            {/* ROLE MANAGEMENT MODAL (DIALOG) */}
            <Dialog open={!!roleModalUser} onOpenChange={(open) => !open && setRoleModalUser(null)}>
                <DialogContent className="max-w-md rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <UserCog className="size-5 text-foreground" />
                            Kelola Hak Akses & Peran
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Pilih satu atau beberapa peran untuk pengguna{' '}
                            <strong className="text-foreground">{roleModalUser?.name}</strong> ({roleModalUser?.email}).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-3">
                        {roles.map((role) => {
                            const isChecked = selectedRoleIds.includes(role.id);
                            const style = getRoleBadgeStyle(role.name);
                            const Icon = style.icon;

                            return (
                                <div
                                    key={role.id}
                                    onClick={() => toggleRoleInModal(role.id)}
                                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                        isChecked
                                            ? 'border-primary/50 bg-primary/5 shadow-xs'
                                            : 'border-border/70 hover:border-border hover:bg-muted/40'
                                    }`}
                                >
                                    <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                        isChecked
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : 'border-muted-foreground/40 bg-background'
                                    }`}>
                                        {isChecked && <Check className="size-3.5 stroke-[3]" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Icon className="size-4 text-foreground shrink-0" />
                                            <span className="font-bold text-xs text-foreground">
                                                {role.label}
                                            </span>
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                                ({role.name})
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                            {role.name === 'admin' && 'Akses penuh ke seluruh konsol administrasi, log audit sistem, pekerjaan AI latar belakang, dan manajemen pengguna.'}
                                            {role.name === 'reviewer' && 'Dapat memberikan ulasan kualitatif sejawat, skor mitra bestari, serta tanggapan evaluasi makalah ilmiah.'}
                                            {role.name === 'researcher' && 'Hak standar untuk mengunggah naskah riset, melihat analisis komprehensif AI, asisten chatbot, dan matriks komparasi.'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/50">
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" className="rounded-xl text-xs">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            size="sm"
                            onClick={handleSaveRoles}
                            disabled={isSavingRoles}
                            className="rounded-xl text-xs bg-primary text-primary-foreground"
                        >
                            {isSavingRoles ? (
                                <>
                                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE USER CONFIRMATION MODAL (DIALOG) */}
            <Dialog open={!!deleteModalUser} onOpenChange={(open) => !open && setDeleteModalUser(null)}>
                <DialogContent className="max-w-md rounded-2xl p-6">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mb-3">
                            <AlertTriangle className="size-6" />
                        </div>
                        <DialogTitle className="text-lg font-bold text-foreground">
                            Hapus Akun Pengguna?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            Tindakan ini akan menghapus akun{' '}
                            <strong className="text-foreground font-semibold">{deleteModalUser?.name}</strong>{' '}
                            (<span className="font-mono text-foreground">{deleteModalUser?.email}</span>) secara permanen dari sistem.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3.5 text-xs text-destructive space-y-1.5 my-2">
                        <div className="font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="size-4 shrink-0" />
                            Peringatan Dampak Penghapusan:
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Seluruh data yang terhubung dengan akun ini (makalah riset yang diunggah, riwayat chat asisten AI, dan catatan review) akan ikut dibersihkan secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/50">
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" className="rounded-xl text-xs">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleConfirmDelete}
                            disabled={isDeletingUser}
                            className="rounded-xl text-xs"
                        >
                            {isDeletingUser ? (
                                <>
                                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                                    Menghapus Akun...
                                </>
                            ) : (
                                'Hapus Akun Permanen'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
