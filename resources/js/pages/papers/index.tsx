import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    AlertCircle, 
    ArrowRight, 
    Award,
    BookOpen,
    Bot,
    Calendar,
    CheckCircle2,
    CircleDot,
    Clock, 
    FileText, 
    Filter, 
    Loader2, 
    PenTool,
    Plus, 
    RefreshCw, 
    Search,
    Sparkles, 
    Star,
    Trash2, 
    UploadCloud,
    User,
    UserCheck
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Paper {
    id: number;
    title: string;
    slug?: string;
    publication_year: number | null;
    journal: string | null;
    status: string;
    created_at: string;
    uploader?: { name: string; email: string };
    score?: { overall_score: number };
    analysis?: { research_domain: string; paper_type: string };
    reviews?: { id: number; score?: number | null; is_ai_generated: boolean; reviewer?: { name: string } }[];
}

interface Props {
    papers: {
        data: Paper[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters?: { status?: string };
}

export default function PapersIndex({ papers, filters }: Props) {
    const page = usePage();
    const authUser = (page.props as any)?.auth?.user;
    const userRoles: string[] = authUser?.roles?.map((r: any) => r.name) || [];
    const isAdmin = userRoles.includes('admin');
    const isReviewer = userRoles.includes('reviewer');
    const isResearcher = userRoles.includes('researcher') || (!isAdmin && !isReviewer);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [journal, setJournal] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ANALYZED' | 'PROCESSING' | 'FAILED'>('ALL');

    // Auto-poll if any paper in the list is still being processed
    const hasProcessing = papers.data?.some((p) => p.status === 'PROCESSING' || p.status === 'UPLOADED');
    useEffect(() => {
        let interval: any;
        if (hasProcessing) {
            interval = setInterval(() => {
                router.reload({ only: ['papers'] });
            }, 2500);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [hasProcessing]);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setErrorMessage('Silakan pilih berkas PDF.');
            return;
        }

        setIsUploading(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('pdf', file);
        if (title) formData.append('title', title);
        if (year) formData.append('publication_year', year);
        if (journal) formData.append('journal', journal);

        router.post('/papers', formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsUploadOpen(false);
                setFile(null);
                setTitle('');
                setYear('');
                setJournal('');
                setIsUploading(false);
            },
            onError: (errors) => {
                setErrorMessage(Object.values(errors)[0] || 'Gagal mengunggah naskah.');
                setIsUploading(false);
            },
        });
    };

    const handleDelete = (paper: Paper) => {
        if (confirm('Apakah Anda yakin ingin menghapus naskah makalah ini?')) {
            router.delete(`/papers/${paper?.slug || (paper as any).id}`, {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ANALYZED':
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium text-[11px] gap-1 px-2.5 py-0.5">
                        <CheckCircle2 className="size-3" /> Teranalisis
                    </Badge>
                );
            case 'PROCESSING':
            case 'UPLOADED':
                return (
                    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse flex items-center gap-1 text-[11px] px-2.5 py-0.5">
                        <Loader2 className="size-3 animate-spin" /> Memproses AI
                    </Badge>
                );
            case 'FAILED':
                return (
                    <Badge variant="destructive" className="flex items-center gap-1 text-[11px] px-2.5 py-0.5">
                        <AlertCircle className="size-3" /> Gagal
                    </Badge>
                );
            default:
                return <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5">{status}</Badge>;
        }
    };

    // Filter papers client-side
    const filteredPapers = (papers.data || []).filter((paper) => {
        const matchesSearch = 
            paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (paper.journal && paper.journal.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (paper.analysis?.research_domain && paper.analysis.research_domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (paper.uploader?.name && paper.uploader.name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = 
            statusFilter === 'ALL' ||
            (statusFilter === 'ANALYZED' && paper.status === 'ANALYZED') ||
            (statusFilter === 'PROCESSING' && (paper.status === 'PROCESSING' || paper.status === 'UPLOADED')) ||
            (statusFilter === 'FAILED' && paper.status === 'FAILED');

        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout breadcrumbs={[{ title: isAdmin ? 'Manajemen Makalah' : (isReviewer ? 'Tinjauan Makalah (Reviewer)' : 'Makalah Riset'), href: '/papers' }]}>
            <Head title={isAdmin ? 'Manajemen Makalah - Disputatio' : (isReviewer ? 'Tinjauan Makalah Reviewer - Disputatio' : 'Koleksi Makalah Riset - Disputatio')} />

            <div className="flex flex-1 flex-col gap-8 p-6 sm:p-8 max-w-7xl mx-auto w-full">
                {/* Header with Role Badge & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60 animate-enter">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border/80 text-muted-foreground text-xs font-medium mb-2.5">
                            <CircleDot className="size-3 text-primary animate-pulse" />
                            <span>
                                {isAdmin ? 'Manajemen Makalah Platform' : (isReviewer ? 'Portal Penelaah / Peer Reviewer' : 'Repositori Naskah Pribadi')}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            {isAdmin ? 'Koleksi Makalah Ilmiah' : (isReviewer ? 'Tinjauan Makalah Ilmiah' : 'Makalah Riset Saya')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isAdmin
                                ? 'Kelola dan pantau seluruh naskah makalah ilmiah serta status evaluasi AI di platform.'
                                : (isReviewer 
                                    ? 'Daftar naskah riset yang masuk ke sistem untuk ditelaah, dievaluasi 5 dimensi, dan diberikan skor ulasan.'
                                    : 'Kelola naskah ilmiah Anda, lakukan evaluasi 5 dimensi AI, dan diskusikan hasil temuan dengan chatbot riset.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isResearcher && (
                            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                                <DialogTrigger asChild>
                                    <Button className="rounded-xl shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                                        <Plus className="size-4" />
                                        <span>Unggah Makalah (PDF)</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[540px] rounded-2xl border border-border/80 shadow-xl">
                                    <form onSubmit={handleUpload}>
                                        <DialogHeader className="pb-2">
                                            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
                                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                    <Sparkles className="size-5" />
                                                </div>
                                                Unggah Naskah Riset
                                            </DialogTitle>
                                            <DialogDescription className="text-xs text-muted-foreground">
                                                Unggah file PDF (maksimal 20MB). AI Gemini akan mengekstrak struktur hierarkis dan menghitung evaluasi 5 dimensi secara otomatis.
                                            </DialogDescription>
                                        </DialogHeader>

                                        {errorMessage && (
                                            <div className="bg-destructive/10 text-destructive text-xs p-3.5 rounded-xl border border-destructive/20 my-3 flex items-center gap-2">
                                                <AlertCircle className="size-4 shrink-0" />
                                                <span>{errorMessage}</span>
                                            </div>
                                        )}

                                        <div className="grid gap-4 py-3">
                                            <div className="grid gap-2">
                                                <Label htmlFor="pdf" className="text-xs font-semibold">Berkas PDF Makalah *</Label>
                                                <div className="border border-dashed border-border/80 rounded-xl p-4 bg-muted/20 hover:bg-muted/40 transition-colors text-center">
                                                    <Input
                                                        id="pdf"
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={(e) => {
                                                            const selected = e.target.files?.[0] || null;
                                                            setFile(selected);
                                                            if (selected && !title) {
                                                                setTitle(selected.name.replace(/\.pdf$/i, ''));
                                                            }
                                                        }}
                                                        required
                                                        className="text-xs cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-semibold file:mr-3"
                                                    />
                                                    <p className="text-[11px] text-muted-foreground mt-2">
                                                        Format yang didukung: .pdf berstandar IEEE, ACM, Springer, Elsevier
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="title" className="text-xs font-semibold">Judul Makalah (Opsional)</Label>
                                                <Input
                                                    id="title"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="Contoh: Analisis Komparatif Model NLP Terhadap Data Klinis"
                                                    className="text-xs rounded-xl"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="year" className="text-xs font-semibold">Tahun Publikasi</Label>
                                                    <Input
                                                        id="year"
                                                        type="number"
                                                        value={year}
                                                        onChange={(e) => setYear(e.target.value)}
                                                        placeholder="2026"
                                                        className="text-xs rounded-xl"
                                                    />
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="journal" className="text-xs font-semibold">Jurnal / Konferensi</Label>
                                                    <Input
                                                        id="journal"
                                                        value={journal}
                                                        onChange={(e) => setJournal(e.target.value)}
                                                        placeholder="IEEE / Scopus / Sinta"
                                                        className="text-xs rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="gap-2 pt-2 border-t">
                                            <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadOpen(false)} className="rounded-xl">
                                                Batal
                                            </Button>
                                            <Button type="submit" size="sm" disabled={isUploading} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="size-4 animate-spin mr-1.5" />
                                                        Memproses Ekstraksi...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="size-4 mr-1.5" />
                                                        Mulai Analisis AI
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 animate-enter-delay-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari judul makalah, domain, atau jurnal..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-xs rounded-xl border-border/80"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-muted/60 border border-border/70 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                statusFilter === 'ALL'
                                    ? 'bg-background text-foreground shadow-xs font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Semua ({papers.data?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('ANALYZED')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                statusFilter === 'ANALYZED'
                                    ? 'bg-background text-foreground shadow-xs font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Teranalisis
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('PROCESSING')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                statusFilter === 'PROCESSING'
                                    ? 'bg-background text-foreground shadow-xs font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Memproses AI
                        </button>
                    </div>
                </div>

                {/* Papers Grid */}
                {filteredPapers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-enter-delay-2">
                        {filteredPapers.map((paper) => {
                            const manualReviews = paper.reviews?.filter(r => !r.is_ai_generated && r.score !== null && r.score !== undefined) || [];
                            const reviewerScore = manualReviews.length > 0 
                                ? Math.round(manualReviews.reduce((acc, r) => acc + (r.score || 0), 0) / manualReviews.length)
                                : null;

                            return (
                                <Card 
                                    key={paper.id} 
                                    className="group flex flex-col justify-between rounded-2xl border border-border/70 shadow-xs hover:border-border hover:shadow-md transition-all duration-200"
                                >
                                    <CardHeader className="p-5 pb-3">
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            {getStatusBadge(paper.status)}
                                            {paper.analysis?.research_domain && (
                                                <Badge variant="secondary" className="text-[10px] font-medium truncate max-w-[140px]">
                                                    {paper.analysis.research_domain}
                                                </Badge>
                                            )}
                                        </div>

                                        <CardTitle className="text-base font-bold line-clamp-2 leading-snug">
                                            <Link 
                                                href={`/papers/${paper.slug || paper.id}`} 
                                                className="hover:text-primary transition-colors block text-foreground group-hover:text-primary"
                                            >
                                                {paper.title}
                                            </Link>
                                        </CardTitle>

                                        <CardDescription className="text-xs text-muted-foreground flex flex-col gap-1 mt-2.5 pt-2 border-t border-border/40">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <User className="size-3 text-muted-foreground shrink-0" />
                                                <span className="truncate">Pengunggah: <strong className="text-foreground">{paper.uploader?.name || 'Peneliti'}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                                                {paper.publication_year && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="size-3" />
                                                        {paper.publication_year}
                                                    </span>
                                                )}
                                                <span>{new Date(paper.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="px-5 py-2">
                                        {/* Two Scores Badge in Card */}
                                        <div className="grid grid-cols-2 gap-2 bg-muted/40 border border-border/60 p-3 rounded-xl text-center">
                                            <div className="border-r border-border/60 pr-2">
                                                <span className="text-[10px] text-muted-foreground block font-medium flex items-center justify-center gap-1">
                                                    <Bot className="size-3 text-primary" /> Skor AI
                                                </span>
                                                <span className="text-sm font-bold text-foreground font-mono">
                                                    {paper.score?.overall_score ? `${paper.score.overall_score}/100` : '-'}
                                                </span>
                                            </div>
                                            <div className="pl-2">
                                                <span className="text-[10px] text-muted-foreground block font-medium flex items-center justify-center gap-1">
                                                    <UserCheck className="size-3 text-emerald-600 dark:text-emerald-400" /> Reviewer
                                                </span>
                                                <span className="text-sm font-bold text-foreground font-mono">
                                                    {reviewerScore !== null ? `${reviewerScore}/100` : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="px-5 py-3 border-t border-border/50 flex items-center justify-between text-xs">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            asChild 
                                            className="p-0 h-auto text-primary hover:text-primary/80 font-semibold flex items-center gap-1 hover:bg-transparent"
                                        >
                                            <Link href={`/papers/${paper.slug || paper.id}`}>
                                                <span>{isAdmin ? 'Inspeksi & Kelola' : (isReviewer ? 'Beri Nilai & Review' : 'Buka Analisis')}</span>
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                        </Button>

                                        {(authUser?.id === (paper as any).uploaded_by || isAdmin) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(paper)}
                                                className="h-7 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                title="Hapus Makalah"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16 text-center">
                        <CardContent className="space-y-3">
                            <div className="p-3 rounded-2xl bg-muted inline-block text-muted-foreground">
                                <FileText className="size-8" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Tidak Ditemukan Makalah yang Sesuai'
                                    : (isAdmin 
                                        ? 'Belum Ada Makalah di Platform' 
                                        : (isReviewer ? 'Belum Ada Makalah yang Perlu Ditelaah' : 'Belum Ada Makalah Riset'))}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Coba ubah kata kunci pencarian atau reset filter status Anda.'
                                    : (isAdmin
                                        ? 'Belum ada berkas naskah penelitian yang diunggah oleh pengguna.'
                                        : (isReviewer
                                            ? 'Saat peneliti mengunggah makalah baru, naskah akan muncul di halaman ini untuk Anda ulas.'
                                            : 'Mulai dengan mengunggah berkas PDF makalah ilmiah Anda untuk dianalisis oleh AI Gemini.'))}
                            </p>
                            {isResearcher && !searchQuery && statusFilter === 'ALL' && (
                                <Button onClick={() => setIsUploadOpen(true)} size="sm" className="mt-4 rounded-xl">
                                    <Plus className="size-4 mr-1.5" />
                                    Unggah Makalah Pertama
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}