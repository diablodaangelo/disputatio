import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Activity, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    Loader2, 
    RefreshCw, 
    RotateCcw 
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AiJobItem {
    id: number;
    job_uuid: string;
    job_type: string;
    status: string;
    retry_count: number;
    max_retries: number;
    error_message: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    paper?: {
        id: number;
        title: string;
        uploader?: { name: string };
    };
}

interface Props {
    jobs: {
        data: AiJobItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function AdminAiJobs({ jobs }: Props) {
    const [retryingId, setRetryingId] = useState<number | null>(null);

    const handleRetry = (jobId: number) => {
        setRetryingId(jobId);
        router.post(`/admin/ai-jobs/${jobId}/retry`, {}, {
            preserveScroll: true,
            onFinish: () => setRetryingId(null),
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-emerald-600 text-white flex items-center gap-1"><CheckCircle2 className="size-3" /> Selesai</Badge>;
            case 'PROCESSING':
                return <Badge variant="outline" className="border-amber-500 text-amber-600 animate-pulse flex items-center gap-1"><Loader2 className="size-3 animate-spin" /> Sedang Diproses</Badge>;
            case 'FAILED':
                return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="size-3" /> Gagal</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Monitor Job AI Admin', href: '/admin/ai-jobs' }]}>
            <Head title="Monitor Job AI - Admin" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <Activity className="size-6 text-foreground" />
                            Telemetri & Pemantauan Job AI
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pengawasan langsung tugas antrean background, latensi Gemini AI, log kegagalan, dan fitur coba ulang instan.
                        </p>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => router.reload()} className="flex items-center gap-1.5 text-xs">
                        <RefreshCw className="size-3.5" /> Muat Ulang
                    </Button>
                </div>

                {/* Jobs Table */}
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base">Daftar Tugas Pemrosesan AI Background ({jobs.total})</CardTitle>
                        <CardDescription className="text-xs">
                            Tugas yang dieksekusi oleh Laravel Queue dan Python FastAPI AI Engine.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 uppercase border-b">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">Job ID / UUID</th>
                                    <th className="py-3 px-4 font-semibold">Makalah</th>
                                    <th className="py-3 px-4 font-semibold">Tipe Tugas</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold">Percobaan Ulang</th>
                                    <th className="py-3 px-4 font-semibold">Log Error</th>
                                    <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {jobs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-neutral-400">
                                            Belum ada tugas AI background yang tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    jobs.data.map((job) => (
                                        <tr key={job.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                                            <td className="py-3 px-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                                                #{job.id} <br />
                                                <span className="text-[10px] text-neutral-400">{job.job_uuid.substring(0, 8)}...</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {job.paper ? (
                                                    <div className="font-medium text-neutral-900 dark:text-neutral-100 max-w-[200px] truncate">
                                                        {job.paper.title}
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400">Dihapus</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                                    {job.job_type}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                {getStatusBadge(job.status)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`font-semibold ${job.retry_count > 0 ? 'text-amber-600' : 'text-neutral-500'}`}>
                                                    {job.retry_count} / {job.max_retries}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 max-w-[220px]">
                                                {job.error_message ? (
                                                    <span className="text-red-600 dark:text-red-400 text-[11px] font-mono truncate block" title={job.error_message}>
                                                        {job.error_message}
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {job.status === 'FAILED' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRetry(job.id)}
                                                        disabled={retryingId === job.id}
                                                        className="text-xs h-7 px-2.5 flex items-center gap-1 ml-auto"
                                                    >
                                                        <RotateCcw className={`size-3 ${retryingId === job.id ? 'animate-spin' : ''}`} />
                                                        Coba Ulang
                                                    </Button>
                                                )}
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
