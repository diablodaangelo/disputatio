import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Activity, 
    ArrowRight, 
    Award, 
    BookOpen, 
    Bot, 
    CheckCircle2, 
    CircleDot, 
    FileText, 
    Layers, 
    Plus, 
    Scale, 
    Sparkles, 
    TrendingUp, 
    UploadCloud,
    Calendar,
    User
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DomainItem {
    research_domain: string;
    count: number;
}

interface RecentPaper {
    id: number;
    slug?: string;
    title: string;
    publication_year: number | null;
    journal?: string | null;
    status: string;
    created_at: string;
    uploader?: { name: string; email: string };
    score?: { overall_score: number };
    analysis?: { research_domain: string; paper_type: string };
}

interface Metrics {
    total_papers: number;
    analyzed_papers: number;
    processing_papers: number;
    failed_papers: number;
    average_score: number;
    success_rate: number;
    domain_distribution: DomainItem[];
    recent_papers: RecentPaper[];
}

interface Props {
    metrics?: Metrics;
}

export default function Dashboard({ metrics }: Props) {
    const page = usePage();
    const authUser = (page.props as any)?.auth?.user;
    const userRoles: string[] = authUser?.roles?.map((r: any) => r.name) || [];
    const isAdmin = userRoles.includes('admin');
    const isReviewer = userRoles.includes('reviewer');

    const stats = metrics || {
        total_papers: 0,
        analyzed_papers: 0,
        processing_papers: 0,
        failed_papers: 0,
        average_score: 0,
        success_rate: 100,
        domain_distribution: [],
        recent_papers: [],
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard Analisis Makalah Ilmiah - Disputatio" />

            <div className="flex flex-1 flex-col gap-8 p-6 sm:p-8 max-w-7xl mx-auto w-full">
                {/* Header & Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#7F765C]/30 animate-enter">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#313F41] border border-[#7F765C]/50 text-[#CFB082] text-xs font-semibold mb-2.5 shadow-sm">
                            <CircleDot className="size-3 text-[#CFB082] animate-pulse" />
                            <span>
                                {isAdmin ? 'Administrator Console' : (isReviewer ? 'Reviewer Portal' : 'Peneliti & Akademisi')}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E7DEBB] flex items-center gap-2.5">
                            Selamat Datang, {authUser?.name || 'Peneliti'}
                        </h1>
                        <p className="text-sm text-[#E7DEBB]/75 mt-1">
                            Pantau telemetri riset, evaluasi kualitas 5 dimensi ilmiah, dan antrean analisis AI.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" asChild className="rounded-xl border-[#7F765C]/60 bg-[#313F41] text-[#E7DEBB] hover:bg-[#38484a] hover:text-[#CFB082] hover:border-[#CFB082]/60 shadow-sm transition-all">
                            <Link href="/compare" className="flex items-center gap-2">
                                <Scale className="size-4 text-[#CFB082]" />
                                <span>Komparasi Makalah</span>
                            </Link>
                        </Button>
                        <Button asChild className="rounded-xl shadow-md bg-gradient-to-r from-[#CFB082] to-[#E7DEBB] text-[#262229] font-bold hover:from-[#E7DEBB] hover:to-[#CFB082] hover:scale-[1.02] transition-all">
                            <Link href="/papers" className="flex items-center gap-2">
                                <Plus className="size-4 stroke-[3]" />
                                <span>{isReviewer && !isAdmin ? 'Tinjau Makalah' : 'Unggah & Analisis'}</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4 Core Metrics Cards with ColorMind Aesthetics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 animate-enter-delay-1">
                    
                    {/* Card 1: Total Makalah */}
                    <Card className="rounded-3xl border border-[#7F765C]/40 bg-[#313F41]/95 shadow-xl shadow-[#262229]/40 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#CFB082]/60 hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-[#CFB082] uppercase tracking-wider">Total Makalah</p>
                                <h3 className="text-3xl font-bold tracking-tight text-[#E7DEBB] mt-2 font-mono">{stats.total_papers}</h3>
                            </div>
                            <div className="p-2.5 rounded-2xl bg-[#262229] border border-[#7F765C]/50 text-[#CFB082] shadow-sm">
                                <FileText className="size-5" />
                            </div>
                        </div>
                        <div className="text-xs text-[#E7DEBB]/70 mt-4 pt-3 border-t border-[#7F765C]/30 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                <CheckCircle2 className="size-3.5" /> {stats.analyzed_papers} Teranalisis
                            </span>
                            {stats.processing_papers > 0 && (
                                <span className="text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    {stats.processing_papers} Antrean
                                </span>
                            )}
                        </div>
                    </Card>

                    {/* Card 2: Rata-rata Skor Ilmiah (Featured) */}
                    <Card className="rounded-3xl border border-[#CFB082]/60 bg-gradient-to-b from-[#38484a] to-[#313F41] shadow-2xl shadow-[#313F41]/60 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#CFB082] hover:-translate-y-1 ring-1 ring-[#CFB082]/30">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-[#CFB082] uppercase tracking-wider">Rata-rata Skor Ilmiah</p>
                                <div className="flex items-baseline gap-1.5 mt-2">
                                    <h3 className="text-3xl font-bold tracking-tight text-[#CFB082] font-mono">{stats.average_score}</h3>
                                    <span className="text-sm text-[#E7DEBB]/70 font-normal">/ 100</span>
                                </div>
                            </div>
                            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#CFB082] to-[#E7DEBB] text-[#262229] shadow-md shadow-[#CFB082]/20 font-bold">
                                <Award className="size-5" />
                            </div>
                        </div>
                        <div className="text-xs text-[#E7DEBB]/80 mt-4 pt-3 border-t border-[#7F765C]/40 flex items-center gap-1">
                            <span className="inline-block size-1.5 rounded-full bg-[#CFB082]" />
                            <span>Rubrik 5 dimensi evaluasi AI</span>
                        </div>
                    </Card>

                    {/* Card 3: Tingkat Keberhasilan AI */}
                    <Card className="rounded-3xl border border-[#7F765C]/40 bg-[#313F41]/95 shadow-xl shadow-[#262229]/40 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#CFB082]/60 hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-[#CFB082] uppercase tracking-wider">Tingkat Keberhasilan AI</p>
                                <h3 className="text-3xl font-bold tracking-tight text-[#E7DEBB] mt-2 font-mono">{stats.success_rate}%</h3>
                            </div>
                            <div className="p-2.5 rounded-2xl bg-[#262229] border border-[#7F765C]/50 text-[#CFB082] shadow-sm">
                                <Sparkles className="size-5" />
                            </div>
                        </div>
                        <div className="text-xs text-[#E7DEBB]/70 mt-4 pt-3 border-t border-[#7F765C]/30 flex items-center gap-1.5">
                            <TrendingUp className="size-3.5 text-emerald-400" />
                            <span>Ekstraksi struktur PDF & Gemini AI</span>
                        </div>
                    </Card>

                    {/* Card 4: Siklus Pemrosesan */}
                    <Card className="rounded-3xl border border-[#7F765C]/40 bg-[#313F41]/95 shadow-xl shadow-[#262229]/40 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#CFB082]/60 hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-[#CFB082] uppercase tracking-wider">Siklus Pemrosesan</p>
                                <h3 className="text-3xl font-bold tracking-tight text-[#E7DEBB] mt-2 font-mono">
                                    {stats.analyzed_papers + stats.processing_papers}
                                </h3>
                            </div>
                            <div className="p-2.5 rounded-2xl bg-[#262229] border border-[#7F765C]/50 text-[#CFB082] shadow-sm">
                                <Activity className="size-5" />
                            </div>
                        </div>
                        <div className="text-xs text-[#E7DEBB]/70 mt-4 pt-3 border-t border-[#7F765C]/30 flex items-center justify-between">
                            <span>Status sistem operasional</span>
                            <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                    </Card>
                </div>

                {/* Grid: Recent Research Papers (2 cols) + Domain Breakdown & Workflow (1 col) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-enter-delay-2">
                    {/* Recent Papers */}
                    <Card className="lg:col-span-2 rounded-3xl border border-[#7F765C]/50 bg-[#313F41]/95 shadow-2xl shadow-[#262229]/60 overflow-hidden">
                        <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-[#7F765C]/40 bg-[#262229]/50">
                            <div>
                                <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-[#E7DEBB] flex items-center gap-2">
                                    <FileText className="size-5 text-[#CFB082]" />
                                    <span>Makalah Riset Terbaru</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-[#E7DEBB]/70 mt-0.5">
                                    Naskah ilmiah yang baru dianalisis beserta ringkasan skor dan status.
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-xs text-[#CFB082] hover:text-[#E7DEBB] hover:bg-[#313F41] rounded-xl font-semibold">
                                <Link href="/papers" className="flex items-center gap-1.5">
                                    <span>Lihat Semua</span>
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3.5">
                            {stats.recent_papers.length === 0 ? (
                                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#7F765C]/50 bg-[#262229]/60">
                                    <UploadCloud className="size-10 mx-auto mb-3 text-[#CFB082]/70 opacity-80" />
                                    <h4 className="text-sm font-bold text-[#E7DEBB]">Belum Ada Makalah Riset</h4>
                                    <p className="text-xs text-[#E7DEBB]/70 mt-1 max-w-sm mx-auto">
                                        Unggah naskah riset berformat PDF untuk memulai evaluasi otomatis 5 dimensi ilmiah berbasis AI.
                                    </p>
                                    <Button asChild size="sm" className="mt-4 rounded-xl bg-gradient-to-r from-[#CFB082] to-[#E7DEBB] text-[#262229] font-bold hover:from-[#E7DEBB] hover:to-[#CFB082]">
                                        <Link href="/papers">Unggah Makalah Pertama</Link>
                                    </Button>
                                </div>
                            ) : (
                                stats.recent_papers.map((p) => (
                                    <div
                                        key={p.id}
                                        className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl border border-[#7F765C]/40 bg-[#262229]/80 hover:border-[#CFB082]/70 hover:bg-[#262229] transition-all duration-300 gap-4 shadow-sm hover:shadow-lg hover:shadow-[#262229]/80"
                                    >
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            {/* Status & Meta Badges */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {p.status === 'ANALYZED' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                                                        <CheckCircle2 className="size-3" />
                                                        Teranalisis
                                                    </span>
                                                ) : p.status === 'PROCESSING' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold animate-pulse">
                                                        <Bot className="size-3" />
                                                        Memproses AI
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#313F41] text-[#CFB082] border border-[#7F765C]/50 text-[10px] font-mono font-bold uppercase">
                                                        {p.status}
                                                    </span>
                                                )}

                                                {p.publication_year && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#313F41]/70 text-[#E7DEBB]/70 font-mono text-[10px] border border-[#7F765C]/30">
                                                        <Calendar className="size-2.5 text-[#CFB082]" />
                                                        {p.publication_year}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Paper Title Link */}
                                            <Link
                                                href={`/papers/${p.slug || p.id}`}
                                                className="text-sm sm:text-base font-bold text-[#E7DEBB] group-hover:text-[#CFB082] transition-colors truncate block"
                                            >
                                                {p.title}
                                            </Link>

                                            {/* Domain & Uploader Subtitles */}
                                            <div className="text-xs text-[#E7DEBB]/70 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                                                {p.analysis?.research_domain && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#313F41] text-[#CFB082] border border-[#7F765C]/40 text-[11px] font-semibold">
                                                        <BookOpen className="size-3" />
                                                        {p.analysis.research_domain}
                                                    </span>
                                                )}
                                                {p.uploader && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-[#E7DEBB]/60">
                                                        <User className="size-3 text-[#7F765C]" />
                                                        {p.uploader.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Score & Inspection CTA */}
                                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                            {p.score ? (
                                                <div className="text-right">
                                                    <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-gradient-to-br from-[#CFB082] to-[#E7DEBB] text-[#262229] shadow-sm flex items-center gap-1">
                                                        <span>{p.score.overall_score}</span>
                                                        <span className="text-[10px] opacity-75 font-normal">/100</span>
                                                    </div>
                                                </div>
                                            ) : null}
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                asChild 
                                                className="rounded-xl h-8.5 text-xs px-3.5 bg-[#313F41] text-[#CFB082] border-[#7F765C]/60 hover:bg-[#CFB082] hover:text-[#262229] hover:border-[#CFB082] font-semibold transition-all shadow-xs"
                                            >
                                                <Link href={`/papers/${p.slug || p.id}`} className="flex items-center gap-1.5">
                                                    <span>Inspeksi</span>
                                                    <ArrowRight className="size-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: Domain Distribution & Quick Guide */}
                    <div className="space-y-6">
                        {/* Domain Distribution */}
                        <Card className="rounded-3xl border border-[#7F765C]/50 bg-[#313F41]/95 shadow-2xl shadow-[#262229]/60 overflow-hidden">
                            <CardHeader className="p-6 pb-4 border-b border-[#7F765C]/40 bg-[#262229]/50">
                                <CardTitle className="text-base font-bold tracking-tight text-[#E7DEBB] flex items-center gap-2">
                                    <Layers className="size-4 text-[#CFB082]" />
                                    <span>Domain Bidang Riset</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-[#E7DEBB]/70">
                                    Distribusi ilmu makalah yang telah terdaftar.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-2.5">
                                {stats.domain_distribution.length === 0 ? (
                                    <p className="text-xs text-[#E7DEBB]/60 italic text-center py-6">
                                        Belum ada data distribusi bidang ilmu.
                                    </p>
                                ) : (
                                    stats.domain_distribution.map((d, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-[#262229]/70 border border-[#7F765C]/30 hover:border-[#CFB082]/40 transition-all">
                                            <span className="font-semibold text-[#E7DEBB] truncate pr-2">
                                                {d.research_domain}
                                            </span>
                                            <Badge className="bg-[#313F41] text-[#CFB082] border border-[#7F765C]/50 font-mono font-bold text-[11px] shrink-0">
                                                {d.count} makalah
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Disputatio Workflow Card */}
                        <Card className="rounded-3xl border border-[#CFB082]/40 bg-gradient-to-b from-[#313F41] to-[#262229] shadow-2xl shadow-[#262229]/60 overflow-hidden">
                            <CardHeader className="p-6 pb-3 border-b border-[#7F765C]/30 bg-[#262229]/40">
                                <CardTitle className="text-sm font-bold tracking-tight text-[#E7DEBB] flex items-center gap-2">
                                    <Sparkles className="size-4 text-[#CFB082]" />
                                    <span>Alur Kerja Disputatio AI</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-4 space-y-4">
                                <div className="flex items-start gap-3 text-xs">
                                    <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded-lg bg-[#CFB082] text-[#262229] font-bold font-mono text-[11px] shadow-xs">
                                        1
                                    </div>
                                    <div className="text-[#E7DEBB]/75">
                                        <strong className="text-[#CFB082] block mb-0.5">Unggah PDF Makalah</strong>
                                        Sistem mengekstrak struktur teks, metodologi, dan pustaka secara hierarkis.
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-xs">
                                    <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded-lg bg-[#CFB082] text-[#262229] font-bold font-mono text-[11px] shadow-xs">
                                        2
                                    </div>
                                    <div className="text-[#E7DEBB]/75">
                                        <strong className="text-[#CFB082] block mb-0.5">Evaluasi 5 Dimensi Ilmiah</strong>
                                        AI mengukur kejelasan, metodologi, temuan, kebaruan, dan reproduksibilitas.
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-xs">
                                    <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded-lg bg-[#CFB082] text-[#262229] font-bold font-mono text-[11px] shadow-xs">
                                        3
                                    </div>
                                    <div className="text-[#E7DEBB]/75">
                                        <strong className="text-[#CFB082] block mb-0.5">Review & Tanya Jawab AI</strong>
                                        Mitra bestari memberikan penilaian dan peneliti dapat berdiskusi via chatbot riset.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}