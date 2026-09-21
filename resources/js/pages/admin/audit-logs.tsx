import { Head, router } from '@inertiajs/react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuditLogItem {
    id: number;
    action: string;
    auditable_type: string | null;
    auditable_id: number | null;
    old_values: any;
    new_values: any;
    ip_address: string | null;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
}

interface Props {
    logs: {
        data: AuditLogItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function AdminAuditLogs({ logs }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Log Audit', href: '/admin/audit-logs' }]}>
            <Head title="Log Audit Sistem - Admin" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center border-b pb-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <ShieldCheck className="size-6 text-foreground" />
                            Log Audit Sistem
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Jejak aktivitas permanen dari unggahan makalah, eksekusi job AI, penyerahan review, dan peristiwa administratif.
                        </p>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => router.reload()} className="flex items-center gap-1.5 text-xs">
                        <RefreshCw className="size-3.5" /> Muat Ulang
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base">Jejak Audit ({logs.total})</CardTitle>
                        <CardDescription className="text-xs">
                            Peristiwa sistem yang tercatat secara kronologis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 uppercase border-b">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">Waktu</th>
                                    <th className="py-3 px-4 font-semibold">Pengguna</th>
                                    <th className="py-3 px-4 font-semibold">Aksi</th>
                                    <th className="py-3 px-4 font-semibold">Target</th>
                                    <th className="py-3 px-4 font-semibold">Metadata</th>
                                    <th className="py-3 px-4 font-semibold">Alamat IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-neutral-400">
                                            Belum ada log audit yang tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                                            <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 font-medium">
                                                {log.user ? log.user.name : <span className="text-neutral-400">Sistem</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="font-mono text-[10px]">
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-neutral-500">
                                                {log.auditable_type ? `${log.auditable_type.split('\\').pop()} #${log.auditable_id}` : '-'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 max-w-[250px] truncate">
                                                {log.new_values ? JSON.stringify(log.new_values) : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-neutral-400 font-mono text-[10px]">
                                                {log.ip_address || '127.0.0.1'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
