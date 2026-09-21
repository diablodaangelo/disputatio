import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    AlertCircle, 
    ArrowLeft, 
    Award, 
    BookCheck, 
    BookOpen, 
    Bot, 
    CheckCircle2, 
    Check,
    Clock, 
    Download,
    ExternalLink, 
    FileText,
    HelpCircle, 
    Key,
    Layers, 
    Lightbulb, 
    Loader2, 
    Lock,
    MessageSquare, 
    PenTool,
    Plus,
    Quote, 
    RefreshCw, 
    Send, 
    ShieldAlert, 
    Sparkles, 
    Star,
    Trash2,
    UserCheck, 
    Zap 
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaperFinding {
    id: number;
    severity: string;
    category: string;
    finding: string;
    explanation: string;
    evidence: string | null;
    page_number: number | null;
    confidence: number | null;
}

interface ReviewComment {
    id: number;
    user_id?: number;
    comment: string;
    user?: { id?: number; name: string };
    created_at: string;
}

interface ReviewItem {
    id: number;
    score?: number | null;
    recommendation: string;
    summary: string;
    methodology_review?: string;
    novelty_review?: string;
    result_review?: string;
    reproducibility_review?: string;
    strengths?: string[];
    major_concerns?: string[];
    minor_concerns?: string[];
    is_ai_generated: boolean;
    reviewer?: { name: string };
    comments?: ReviewComment[];
    created_at: string;
}

interface PaperDetail {
    id: number;
    title: string;
    slug?: string;
    abstract: string | null;
    publication_year: number | null;
    journal: string | null;
    doi: string | null;
    status: string;
    file_path: string;
    file_size_bytes: number;
    uploaded_by: number;
    created_at: string;
    uploader?: { id: number; name: string; email: string };
    authors?: { id: number; name: string }[];
    score?: {
        overall_score: number;
        methodology_score: number;
        novelty_score: number;
        clarity_score: number;
        evidence_score: number;
        reproducibility_score: number;
        writing_quality_score: number;
        explanations?: Record<string, string>;
    };
    analysis?: {
        research_domain: string;
        paper_type: string;
        research_problem?: string;
        research_questions?: string[];
        research_objective?: string;
        methodology?: {
            type?: string;
            method?: string;
            dataset?: string;
            sample_size?: any;
        };
        key_findings?: string[];
        limitations?: string[];
        strengths?: string[];
        weaknesses?: string[];
    };
    findings?: PaperFinding[];
    references?: {
        id: number;
        raw_citation: string;
        is_cited_in_body: boolean;
        missing_from_bibliography: boolean;
    }[];
    reviews?: ReviewItem[];
}

interface Props {
    paper: PaperDetail;
}

export default function PaperShow({ paper }: Props) {
    const page = usePage();
    const authUser = (page.props as any)?.auth?.user;
    const userRoles: string[] = Array.isArray(authUser?.roles)
        ? authUser.roles.map((r: any) => (typeof r === 'string' ? r.toLowerCase() : r?.name?.toLowerCase()))
        : [];
    const isAdmin = userRoles.includes('admin');
    const isReviewer = userRoles.includes('reviewer');
    const isPaperOwner = authUser?.id === paper.uploaded_by;
    const isResearcher = userRoles.includes('researcher') || (isPaperOwner && !isAdmin && !isReviewer);

    const [currentPaper, setCurrentPaper] = useState(paper);

    useEffect(() => {
        setCurrentPaper(paper);
    }, [paper]);

    const [activeTab, setActiveTab] = useState<'overview' | 'structure' | 'findings' | 'citations' | 'qa' | 'reviews'>('overview');
    
    // Q&A State
    const [question, setQuestion] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [qaHistory, setQaHistory] = useState<{ question: string; answer: string; evidence?: any; found: boolean }[]>(() => {
        return (paper as any).qas?.map((q: any) => ({
            question: q.question,
            answer: q.answer,
            evidence: q.evidence,
            found: q.found,
        })) || [];
    });

    useEffect(() => {
        if ((currentPaper as any).qas) {
            setQaHistory((currentPaper as any).qas.map((q: any) => ({
                question: q.question,
                answer: q.answer,
                evidence: q.evidence,
                found: q.found,
            })));
        }
    }, [currentPaper]);
    
    // Custom API Key state
    const [customApiKey, setCustomApiKey] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('disputatio_user_gemini_key') || '';
        }
        return '';
    });
    const [tempApiKey, setTempApiKey] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);

    // Review submission state for Reviewer
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        score: '85',
        recommendation: 'ACCEPT',
        summary: '',
        methodology_review: '',
        novelty_review: '',
        result_review: '',
        reproducibility_review: '',
    });

    // Comment state
    const [activeCommentReviewId, setActiveCommentReviewId] = useState<number | null>(null);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const [isRetrying, setIsRetrying] = useState(false);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);

    // Polling if paper is still processing
    useEffect(() => {
        let interval: any;
        if (currentPaper.status === 'PROCESSING' || currentPaper.status === 'UPLOADED') {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/papers/${currentPaper.slug || currentPaper.id}/status`, {
                        headers: { Accept: 'application/json' },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status !== currentPaper.status) {
                            router.reload();
                        }
                    }
                } catch (e) {
                    // Ignore polling errors
                }
            }, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [currentPaper.status, currentPaper.slug, currentPaper.id]);

    const handleSaveCustomKey = () => {
        const trimmed = tempApiKey.trim();
        setCustomApiKey(trimmed);
        if (typeof window !== 'undefined') {
            if (trimmed) {
                localStorage.setItem('disputatio_user_gemini_key', trimmed);
            } else {
                localStorage.removeItem('disputatio_user_gemini_key');
            }
        }
        setShowKeyModal(false);
    };

    const handleClearCustomKey = () => {
        setCustomApiKey('');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('disputatio_user_gemini_key');
        }
    };

    const handleRetry = () => {
        setIsRetrying(true);
        router.post(`/papers/${currentPaper.slug || currentPaper.id}/retry`, {}, {
            preserveScroll: true,
            onFinish: () => setIsRetrying(false),
            onError: (err) => {
                alert(Object.values(err)[0] || 'Gagal mengulang analisis.');
            }
        });
    };

    const handleGenerateReview = () => {
        setIsGeneratingReview(true);
        router.post(`/papers/${currentPaper.slug || currentPaper.id}/ai-review`, {}, {
            preserveScroll: true,
            onFinish: () => setIsGeneratingReview(false),
            onError: (err) => {
                alert(Object.values(err)[0] || 'Gagal memulai review AI.');
            }
        });
    };

    const handleSubmitManualReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewForm.summary.trim()) return;

        setIsSubmittingReview(true);
        router.post(`/papers/${currentPaper.slug || currentPaper.id}/reviews`, reviewForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReviewModal(false);
                setReviewForm({
                    score: '85',
                    recommendation: 'ACCEPT',
                    summary: '',
                    methodology_review: '',
                    novelty_review: '',
                    result_review: '',
                    reproducibility_review: '',
                });
            },
            onError: (errors) => {
                alert(Object.values(errors)[0] || 'Gagal menyimpan ulasan.');
            },
            onFinish: () => setIsSubmittingReview(false),
        });
    };

    const handleAddComment = (reviewId: number) => {
        if (!commentText.trim()) return;

        setIsSubmittingComment(true);
        router.post(`/reviews/${reviewId}/comments`, { comment: commentText }, {
            preserveScroll: true,
            onSuccess: () => {
                setCommentText('');
                setActiveCommentReviewId(null);
            },
            onError: (errors) => {
                alert(Object.values(errors)[0] || 'Gagal menambahkan tanggapan.');
            },
            onFinish: () => setIsSubmittingComment(false),
        });
    };

    const handleDeleteComment = (commentId: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus tanggapan komentar ini?')) return;
        router.delete(`/reviews/comments/${commentId}`, {
            preserveScroll: true,
            onError: (errors) => {
                alert(Object.values(errors)[0] || 'Gagal menghapus komentar.');
            },
        });
    };

    const handleExportReport = () => {
        const report = [
            `# LAPORAN ANALISIS & PEER REVIEW ILMIAH`,
            `**Platform:** Disputatio AI Research Assistant`,
            `**Tanggal Ekspor:** ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`,
            `\n---\n`,
            `## 1. INFORMASI MAKALAH`,
            `- **Judul:** ${currentPaper.title}`,
            `- **Pengunggah:** ${currentPaper.uploader?.name || 'Peneliti'}`,
            `- **Penulis:** ${currentPaper.authors?.map(a => a.name).join(', ') || 'Tidak tertera'}`,
            `- **Tahun Publikasi:** ${currentPaper.publication_year || '-'}`,
            `- **Jurnal:** ${currentPaper.journal || '-'}`,
            `- **DOI:** ${currentPaper.doi || '-'}`,
            `- **Domain Riset:** ${currentPaper.analysis?.research_domain || '-'}`,
            `- **Tipe Naskah:** ${currentPaper.analysis?.paper_type || '-'}`,
            `\n---\n`,
            `## 2. REKAPITULASI DUA NILAI MAKALAH`,
            `- **1. SKOR KUALITAS AI (Gemini Engine):** ${currentPaper.score?.overall_score ?? 'Belum teranalisis'}/100`,
            `- **2. SKOR PENILAIAN REVIEWER SEJAWAT:** ${manualReviewerScore !== null ? `${manualReviewerScore}/100` : 'Belum dinilai reviewer'}`,
            `\n---\n`,
            `## 3. SKOR DETAIL 5 DIMENSI ILMIAH (AI PIPELINE)`,
            `- **Kejelasan & Struktur (Clarity):** ${currentPaper.score?.clarity_score || 0}/100`,
            `- **Metodologi Penelitian (Methodology):** ${currentPaper.score?.methodology_score || 0}/100`,
            `- **Kebaruan & Orisinalitas (Novelty):** ${currentPaper.score?.novelty_score || 0}/100`,
            `- **Kesahihan Bukti (Soundness):** ${currentPaper.score?.evidence_score || 0}/100`,
            `- **Reproduksibilitas (Reproducibility):** ${currentPaper.score?.reproducibility_score || 0}/100`,
            `- **Kualitas Penulisan (Writing):** ${currentPaper.score?.writing_quality_score || 0}/100`,
            `\n---\n`,
            `## 4. TEMUAN KUNCI & RISIKO (FINDINGS)`,
            ...(currentPaper.findings && currentPaper.findings.length > 0
                ? currentPaper.findings.map((f, i) => `${i + 1}. **[${f.severity}] ${f.finding}** (${f.category})\n   - *Penjelasan:* ${f.explanation}\n   - *Bukti Kutipan:* "${f.evidence || '-'}"`)
                : ['Belum ada temuan risiko khusus.']),
            `\n---\n`,
            `## 5. LAPORAN PEER REVIEW SEJAWAT & AI`,
            ...(currentPaper.reviews && currentPaper.reviews.length > 0
                ? currentPaper.reviews.map((r, i) => `### Review #${i + 1} (${r.is_ai_generated ? '🤖 AI Reviewer' : `👤 ${r.reviewer?.name || 'Reviewer'}`})\n- **Nilai:** ${r.score ?? '-'}/100\n- **Rekomendasi:** ${r.recommendation}\n- **Ringkasan:** ${r.summary}\n- **Ulasan Metodologi:** ${r.methodology_review || '-'}\n- **Ulasan Kebaruan:** ${r.novelty_review || '-'}`)
                : ['Belum ada laporan review tersimpan.']),
        ].join('\n\n');

        const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Laporan_Review_${currentPaper.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsAsking(true);
        const qText = question;
        setQuestion('');

        try {
            const reqHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };
            if (customApiKey.trim()) {
                reqHeaders['X-Gemini-Key'] = customApiKey.trim();
            }

            const res = await fetch(`/papers/${currentPaper.slug || currentPaper.id}/qa`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: reqHeaders,
                body: JSON.stringify({ question: qText }),
            });

            if (res.ok) {
                const data = await res.json();
                setQaHistory((prev) => [
                    ...prev,
                    {
                        question: qText,
                        answer: data.data?.answer || 'Tidak ada jawaban.',
                        evidence: data.data?.evidence,
                        found: data.data?.found ?? false,
                    },
                ]);
            } else {
                const err = await res.json().catch(() => ({}));
                setQaHistory((prev) => [
                    ...prev,
                    {
                        question: qText,
                        answer: `Gagal memproses pertanyaan: ${err.error || err.message || 'Terjadi kesalahan pada service AI.'}`,
                        found: false,
                    },
                ]);
            }
        } catch (e: any) {
            setQaHistory((prev) => [
                ...prev,
                {
                    question: qText,
                    answer: `Gagal terhubung ke service: ${e.message}`,
                    found: false,
                },
            ]);
        } finally {
            setIsAsking(false);
        }
    };

    const scoreDimensionLabels: Record<string, string> = {
        clarity_score: 'Kejelasan & Struktur',
        methodology_score: 'Metodologi Penelitian',
        novelty_score: 'Kebaruan & Orisinalitas',
        evidence_score: 'Kesahihan Bukti',
        reproducibility_score: 'Reproduksibilitas',
        writing_quality_score: 'Kualitas Penulisan',
    };

    const findingCategoryLabels: Record<string, string> = {
        methodology: 'Metodologi',
        dataset: 'Dataset & Data',
        sample_size: 'Ukuran Sampel',
        research_question: 'Pertanyaan Riset',
        unsupported_claims: 'Klaim Tanpa Bukti',
        limitations: 'Keterbatasan',
        citations: 'Sitasi',
        reproducibility: 'Reproduksibilitas',
    };

    const recommendationLabels: Record<string, string> = {
        ACCEPT: 'Diterima (Accept)',
        MINOR_REVISION: 'Revisi Minor',
        MAJOR_REVISION: 'Revisi Mayor',
        REJECT: 'Ditolak (Reject)',
    };

    const getSeverityBadge = (sev: string) => {
        switch (sev.toUpperCase()) {
            case 'CRITICAL':
                return <Badge className="bg-red-600 hover:bg-red-700 text-white">KRITIS</Badge>;
            case 'HIGH':
                return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">TINGGI</Badge>;
            case 'MEDIUM':
                return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">SEDANG</Badge>;
            default:
                return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">RENDAH</Badge>;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500';
        if (score >= 70) return 'text-foreground border-border';
        if (score >= 50) return 'text-amber-600 dark:text-amber-400 border-amber-500';
        return 'text-red-600 dark:text-red-400 border-red-500';
    };

    // Calculate manual reviewer score if any reviewer has graded
    const manualReviews = currentPaper.reviews?.filter(r => !r.is_ai_generated && r.score !== null && r.score !== undefined) || [];
    const manualReviewerScore = manualReviews.length > 0 
        ? Math.round(manualReviews.reduce((acc, r) => acc + (r.score || 0), 0) / manualReviews.length)
        : null;

    const isProcessing = currentPaper.status === 'PROCESSING' || currentPaper.status === 'UPLOADED';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Makalah Riset', href: '/papers' },
                { title: currentPaper.title, href: `/papers/${currentPaper.slug || currentPaper.id}` },
            ]}
        >
            <Head title={`${currentPaper.title} - Analisis AI Makalah`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Top Action & Navigation Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border/70 rounded-2xl p-6 shadow-xs animate-enter">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-muted-foreground hover:text-foreground">
                                <Link href="/papers" className="flex items-center gap-1.5 text-xs font-medium">
                                    <ArrowLeft className="size-3.5" /> Kembali ke Koleksi
                                </Link>
                            </Button>
                            <span className="text-border">•</span>
                            <Badge variant={currentPaper.status === 'ANALYZED' ? 'default' : isProcessing ? 'outline' : 'destructive'} className="text-[10px] font-mono">
                                {isProcessing && <Loader2 className="size-3 animate-spin mr-1 inline" />}
                                {currentPaper.status === 'ANALYZED' ? 'TERANALISIS' : isProcessing ? 'DIPROSES' : 'GAGAL'}
                            </Badge>
                            {currentPaper.analysis?.research_domain && (
                                <Badge variant="secondary" className="text-[10px]">{currentPaper.analysis.research_domain}</Badge>
                            )}
                        </div>

                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                            {currentPaper.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                            <span>Pengunggah: <strong className="text-foreground">{currentPaper.uploader?.name || 'Peneliti'}</strong></span>
                            {currentPaper.authors && currentPaper.authors.length > 0 && (
                                <span>Penulis: {currentPaper.authors.map((a) => a.name).join(', ')}</span>
                            )}
                            {currentPaper.publication_year && <span>Tahun: {currentPaper.publication_year}</span>}
                            {currentPaper.journal && <span>Jurnal: {currentPaper.journal}</span>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {/* Researcher exclusive actions */}
                        {isResearcher && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRetry}
                                    disabled={isRetrying || isProcessing}
                                    className="flex items-center gap-1.5"
                                >
                                    <RefreshCw className={`size-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                                    Analisis Ulang
                                </Button>



                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setActiveTab('qa')}
                                    className="flex items-center gap-1.5"
                                >
                                    <HelpCircle className="size-3.5 text-foreground" />
                                    Tanya Makalah (Q&A)
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportReport}
                                    className="flex items-center gap-1.5"
                                >
                                    <Download className="size-3.5 text-neutral-600 dark:text-foreground" />
                                    Ekspor Laporan
                                </Button>
                            </>
                        )}

                        {/* Reviewer actions: Lihat File PDF & Beri Review */}
                        {isReviewer && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="flex items-center gap-1.5"
                                >
                                    <a
                                        href={`/papers/${currentPaper.slug || currentPaper.id}/file`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FileText className="size-3.5" />
                                        Lihat File PDF
                                    </a>
                                </Button>

                                <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm">
                                            <PenTool className="size-3.5" />
                                            Beri Review & Nilai
                                        </Button>
                                    </DialogTrigger>
                                <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                                    <form onSubmit={handleSubmitManualReview}>
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <PenTool className="size-5 text-emerald-600" />
                                                Form Penilaian & Review Sejawat (Mitra Bestari)
                                            </DialogTitle>
                                            <DialogDescription className="text-xs">
                                                Berikan skor penilaian akademik dan rekomendasi publikasi resmi untuk naskah makalah ini.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="revScore" className="text-xs font-semibold">
                                                        Nilai Reviewer (0 - 100) *
                                                    </Label>
                                                    <Input
                                                        id="revScore"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        required
                                                        value={reviewForm.score}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, score: e.target.value })}
                                                        placeholder="85"
                                                        className="font-mono text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="revRec" className="text-xs font-semibold">
                                                        Rekomendasi Keputusan *
                                                    </Label>
                                                    <select
                                                        id="revRec"
                                                        value={reviewForm.recommendation}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, recommendation: e.target.value })}
                                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                    >
                                                        <option value="ACCEPT">Diterima (Accept)</option>
                                                        <option value="MINOR_REVISION">Revisi Minor (Minor Revision)</option>
                                                        <option value="MAJOR_REVISION">Revisi Mayor (Major Revision)</option>
                                                        <option value="REJECT">Ditolak (Reject)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="revSummary" className="text-xs font-semibold">
                                                    Ringkasan Evaluasi & Catatan Reviewer *
                                                </Label>
                                                <textarea
                                                    id="revSummary"
                                                    required
                                                    rows={3}
                                                    value={reviewForm.summary}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, summary: e.target.value })}
                                                    placeholder="Tuliskan evaluasi menyeluruh mengenai kualitas naskah, keunggulan, dan catatan perbaikan..."
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="revMethodology" className="text-xs">
                                                    Ulasan Metodologi (Opsional)
                                                </Label>
                                                <textarea
                                                    id="revMethodology"
                                                    rows={2}
                                                    value={reviewForm.methodology_review}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, methodology_review: e.target.value })}
                                                    placeholder="Komentar mengenai ketepatan desain eksperimen, sampling, atau dataset..."
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="revNovelty" className="text-xs">
                                                    Ulasan Kebaruan & Kontribusi (Opsional)
                                                </Label>
                                                <textarea
                                                    id="revNovelty"
                                                    rows={2}
                                                    value={reviewForm.novelty_review}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, novelty_review: e.target.value })}
                                                    placeholder="Komentar mengenai kebaruan temuan dan relevansi bagi bidang ilmu..."
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                />
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setShowReviewModal(false)}>
                                                Batal
                                            </Button>
                                            <Button type="submit" size="sm" disabled={isSubmittingReview} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                {isSubmittingReview ? <Loader2 className="size-4 animate-spin mr-1" /> : <Check className="size-4 mr-1" />}
                                                Simpan & Kirim Ulasan
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            </>
                        )}
                    </div>
                </div>

                {/* 2 DISTINCT SCORES DISPLAY: AI Quality Score + Reviewer Score */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-enter-delay-1">
                    {/* Score 1: AI Quality Score */}
                    <div className="bg-card border border-border/70 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Bot className="size-4 text-foreground" />
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    1. Skor Kualitas AI (Gemini Engine)
                                </span>
                            </div>
                            <h4 className="text-sm font-semibold text-foreground dark:text-foreground">
                                {currentPaper.score?.overall_score ? (
                                    currentPaper.score.overall_score >= 85 ? 'Sangat Layak Publikasi' :
                                    currentPaper.score.overall_score >= 70 ? 'Layak Publikasi dengan Revisi' :
                                    currentPaper.score.overall_score >= 50 ? 'Perlu Revisi Mayor' : 'Belum Memenuhi Standar'
                                ) : 'Menunggu Analisis AI'}
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                                Dihitung otomatis dari 5 pilar ilmiah (Metodologi, Kebaruan, Kejelasan, Bukti, Reproduksibilitas).
                            </p>
                        </div>
                        <div className="shrink-0 text-center">
                            <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-extrabold text-2xl ${
                                currentPaper.score?.overall_score ? getScoreColor(currentPaper.score.overall_score) : 'border-neutral-300 text-muted-foreground'
                            } bg-muted shadow-sm`}>
                                {currentPaper.score?.overall_score ?? '-'}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono mt-1 block">Skala 0 - 100</span>
                        </div>
                    </div>

                    {/* Score 2: Human Reviewer Score */}
                    <div className="bg-card border border-border/70 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    2. Skor Penilaian Reviewer Sejawat
                                </span>
                            </div>
                            <h4 className="text-sm font-semibold text-foreground dark:text-foreground">
                                {manualReviewerScore !== null ? (
                                    manualReviewerScore >= 85 ? 'Direkomendasikan Reviewer' :
                                    manualReviewerScore >= 70 ? 'Revisi Sesuai Masukan' : 'Perlu Perbaikan Mendalam'
                                ) : 'Belum Dinilai oleh Reviewer'}
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                                {manualReviews.length > 0 
                                    ? `Rata-rata dari ${manualReviews.length} penilaian reviewer mitra bestari.`
                                    : 'Reviewer dapat memasukkan nilai melalui tombol "Beri Review & Nilai".'}
                            </p>
                        </div>
                        <div className="shrink-0 text-center">
                            <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-extrabold text-2xl ${
                                manualReviewerScore !== null ? getScoreColor(manualReviewerScore) : 'border-neutral-300 text-muted-foreground'
                            } bg-muted shadow-sm`}>
                                {manualReviewerScore !== null ? manualReviewerScore : '-'}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono mt-1 block">Skala 0 - 100</span>
                        </div>
                    </div>
                </div>

                {/* Processing Notification if ongoing */}
                {isProcessing && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex items-center gap-3">
                        <Loader2 className="size-6 text-amber-600 animate-spin shrink-0" />
                        <div>
                            <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                                Ekstraksi Dokumen & Penilaian AI Sedang Berlangsung
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                Queue worker sedang membaca bagian-bagian PDF, menjalankan analisis terstruktur Gemini, dan menghitung skor kualitas. Halaman ini akan memuat ulang otomatis setelah selesai.
                            </p>
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="flex border-b border-neutral-200 dark:border-border/60 overflow-x-auto gap-2 animate-enter-delay-2">
                    {[
                        { id: 'overview', label: 'Ringkasan & Skor AI', icon: Award },
                        { id: 'structure', label: 'Struktur Riset', icon: Layers },
                        { id: 'findings', label: 'Temuan & Risiko', icon: AlertCircle, count: currentPaper.findings?.length },
                        { id: 'citations', label: 'Integritas Sitasi', icon: BookOpen },
                        ...(isResearcher ? [{ id: 'qa', label: 'Asisten AI (Chatbot)', icon: Bot, isOwnerOnly: true }] : []),
                        { id: 'reviews', label: 'Laporan Reviewer & Diskusi', icon: MessageSquare, count: currentPaper.reviews?.length },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                                    isActive
                                        ? 'border-primary text-foreground'
                                        : 'border-transparent text-muted-foreground hover:text-foreground dark:hover:text-foreground'
                                }`}
                            >
                                <Icon className="size-4" />
                                <span>{tab.label}</span>
                                {tab.isOwnerOnly && (
                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-muted border border-border text-foreground dark:text-foreground">
                                        Researcher
                                    </span>
                                )}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                                        {tab.count}
                                    </Badge>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: OVERVIEW & SCORING */}
                {activeTab === 'overview' && (
                    <div className="flex flex-col gap-6">
                        {/* Executive Synthesis Banner */}
                        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-muted border border-border/20 flex items-center justify-center text-foreground">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">
                                            Sintesis & Klasifikasi AI Makalah
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Ringkasan evaluasi otomatis model Gemini terhadap kualitas naskah ilmiah.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <Badge variant="outline" className="font-mono bg-muted border-border/60 text-foreground">
                                        Domain: <strong className="ml-1 text-foreground">{currentPaper.analysis?.research_domain || 'General'}</strong>
                                    </Badge>
                                    <Badge variant="outline" className="font-mono bg-muted border-border/60 text-foreground">
                                        Tipe: <strong className="ml-1 text-emerald-400">{currentPaper.analysis?.paper_type || 'Research Paper'}</strong>
                                    </Badge>
                                </div>
                            </div>

                            {/* Abstract */}
                            <div className="space-y-1.5 text-xs">
                                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                                    <BookOpen className="size-3.5 text-foreground" /> Abstrak Penelitian:
                                </h4>
                                <p className="text-muted-foreground leading-relaxed bg-muted/40 p-3.5 rounded-xl border border-border/60">
                                    {currentPaper.abstract || 'Abstrak tidak ditemukan atau belum diekstrak.'}
                                </p>
                            </div>
                        </div>

                        {/* 6 Scientific Dimensions Scorecards Grid (No generic progress bars) */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                                    <Award className="size-4 text-foreground" />
                                    Matriks Evaluasi 6 Dimensi Ilmiah
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    Skala Penilaian: <strong>0 - 100 Poin Objektif</strong>
                                </span>
                            </div>

                            {currentPaper.score ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { key: 'clarity_score', score: currentPaper.score.clarity_score, icon: CheckCircle2 },
                                        { key: 'methodology_score', score: currentPaper.score.methodology_score, icon: Layers },
                                        { key: 'novelty_score', score: currentPaper.score.novelty_score, icon: Sparkles },
                                        { key: 'evidence_score', score: currentPaper.score.evidence_score, icon: BookCheck },
                                        { key: 'reproducibility_score', score: currentPaper.score.reproducibility_score, icon: RefreshCw },
                                        { key: 'writing_quality_score', score: currentPaper.score.writing_quality_score, icon: PenTool },
                                    ].map((dim) => {
                                        const label = scoreDimensionLabels[dim.key] || dim.key;
                                        const explanation = currentPaper.score?.explanations?.[dim.key];
                                        const Icon = dim.icon;
                                        const score = dim.score ?? 0;
                                        
                                        const badgeColor = score >= 85 
                                            ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' 
                                            : score >= 70 
                                            ? 'bg-muted text-foreground border-border'
                                            : score >= 50
                                            ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20'
                                            : 'bg-destructive/10 text-destructive border-destructive/20';

                                        const ratingLabel = score >= 85 
                                            ? 'Sangat Kuat' 
                                            : score >= 70 
                                            ? 'Memadai' 
                                            : score >= 50 
                                            ? 'Cukup' 
                                            : 'Perlu Peningkatan';

                                        return (
                                            <div
                                                key={dim.key}
                                                className="bg-card border border-border/60 hover:border-border/60 transition-all rounded-2xl p-4.5 flex flex-col justify-between shadow-sm group"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-foreground group-hover:text-foreground transition-colors">
                                                                <Icon className="size-4" />
                                                            </div>
                                                            <span className="text-xs font-bold text-foreground">
                                                                {label}
                                                            </span>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className="font-mono text-base font-extrabold text-foreground">
                                                                {score}<span className="text-[10px] text-muted-foreground">/100</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                                                        {explanation || 'Evaluasi dimensi objektif berdasarkan rubrik analisis mendalam AI.'}
                                                    </p>
                                                </div>

                                                <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
                                                    <span className="text-muted-foreground">Kualitas:</span>
                                                    <span className={`px-2 py-0.5 rounded-md font-semibold border text-[10px] font-mono ${badgeColor}`}>
                                                        {ratingLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground text-xs bg-card border border-border/60 rounded-2xl">
                                    Skor evaluasi dimensi belum tersedia.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: STRUCTURE */}
                {activeTab === 'structure' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Lightbulb className="size-4 text-amber-500" />
                                    Masalah & Pertanyaan Riset
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div>
                                    <h5 className="font-semibold text-neutral-700 dark:text-foreground mb-1">Masalah Penelitian (Problem):</h5>
                                    <p className="text-neutral-600 dark:text-muted-foreground bg-muted p-3 rounded-lg border border-border/60 leading-relaxed">
                                        {currentPaper.analysis?.research_problem || 'Tidak ditemukan secara eksplisit.'}
                                    </p>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-neutral-700 dark:text-foreground mb-1">Pertanyaan Penelitian (Questions):</h5>
                                    {currentPaper.analysis?.research_questions && currentPaper.analysis.research_questions.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1 bg-muted p-3 rounded-lg border border-border/60 text-neutral-600 dark:text-muted-foreground">
                                            {currentPaper.analysis.research_questions.map((q, i) => (
                                                <li key={i}>{q}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground italic text-xs">Pertanyaan penelitian tidak diformulasikan eksplisit.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-emerald-500" />
                                    Temuan Kunci & Keterbatasan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div>
                                    <h5 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Temuan Utama (Key Findings):</h5>
                                    {currentPaper.analysis?.key_findings && currentPaper.analysis.key_findings.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 text-neutral-700 dark:text-foreground">
                                            {currentPaper.analysis.key_findings.map((f, i) => (
                                                <li key={i}>{f}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground italic text-xs">Temuan kunci belum diekstrak.</p>
                                    )}
                                </div>
                                <div>
                                    <h5 className="font-semibold text-amber-700 dark:text-amber-400 mb-1">Keterbatasan Riset (Limitations):</h5>
                                    {currentPaper.analysis?.limitations && currentPaper.analysis.limitations.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900 text-neutral-700 dark:text-foreground">
                                            {currentPaper.analysis.limitations.map((l, i) => (
                                                <li key={i}>{l}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground italic text-xs">Keterbatasan riset tidak tertera.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 3: FINDINGS & RISKS */}
                {activeTab === 'findings' && (
                    <div className="flex flex-col gap-4">
                        {currentPaper.findings && currentPaper.findings.length > 0 ? (
                            currentPaper.findings.map((finding) => (
                                <Card key={finding.id} className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getSeverityBadge(finding.severity)}
                                            <Badge variant="outline" className="text-xs">
                                                {findingCategoryLabels[finding.category] || finding.category}
                                            </Badge>
                                        </div>
                                        {finding.confidence && (
                                            <span className="text-[11px] font-mono text-muted-foreground">
                                                Keyakinan: {Math.round(finding.confidence * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-bold text-foreground dark:text-foreground">
                                        {finding.finding}
                                    </h4>
                                    <p className="text-xs text-neutral-600 dark:text-muted-foreground leading-relaxed">
                                        {finding.explanation}
                                    </p>
                                    {finding.evidence && (
                                        <div className="bg-muted border-border/60 p-2.5 rounded-lg border text-xs text-neutral-600 dark:text-muted-foreground italic flex items-start gap-2">
                                            <Quote className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                                            <span>"{finding.evidence}"</span>
                                        </div>
                                    )}
                                </Card>
                            ))
                        ) : (
                            <Card className="py-12 text-center">
                                <CardContent>
                                    <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                                    <h4 className="text-sm font-semibold">Tidak Ada Kelemahan Kritis Terdeteksi</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Analisis AI tidak menemukan anomali metodologis atau sitasi yang berat pada makalah ini.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* TAB 4: CITATIONS */}
                {activeTab === 'citations' && (
                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="size-4 text-foreground" />
                                    Audit Integritas Sitasi & Referensi
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Pemeriksaan AI untuk item bibliografi yang tidak disitasi dan sitasi teks yang hilang dari daftar referensi.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {currentPaper.references && currentPaper.references.length > 0 ? (
                                    <div className="space-y-2">
                                        {currentPaper.references.map((r) => (
                                            <div
                                                key={r.id}
                                                className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                                                    r.missing_from_bibliography
                                                        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-700 dark:text-destructive'
                                                        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-700 dark:text-amber-500 dark:text-amber-400'
                                                }`}
                                            >
                                                <span>{r.raw_citation}</span>
                                                <Badge variant="outline" className="shrink-0">
                                                    {r.missing_from_bibliography ? 'Hilang dari Daftar Pustaka' : 'Tidak Disitasi di Teks'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-xs text-muted-foreground">
                                        Tidak ada anomali bibliografi terdeteksi. Sitasi konsisten dengan teks.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 5: PAPER Q&A CHAT (RESEARCHER EXCLUSIVE) */}
                {activeTab === 'qa' && (
                    <div className="flex flex-col gap-4">
                        {/* Notice if user is Reviewer (not the researcher) */}
                        {!isResearcher && !isPaperOwner ? (
                            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex items-center gap-3">
                                <ShieldAlert className="size-5 text-amber-600 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-xs text-amber-900 dark:text-amber-200">
                                        Fitur Khusus Peneliti (Researcher / Pemilik Naskah)
                                    </h4>
                                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                                        Sebagai Reviewer, Anda dapat memberikan ulasan formal dan skor penilaian pada tab <strong>Laporan Reviewer & Diskusi</strong>. Sesi tanya jawab AI interaktif dikhususkan untuk peneliti yang mengunggah naskah.
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        {/* Token / API Key Configuration Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border border-border/60 text-xs">
                            <div className="flex items-center gap-2">
                                <Key className="size-4 text-foreground" />
                                <span className="font-semibold text-neutral-700 dark:text-foreground">Token API AI:</span>
                                {customApiKey ? (
                                    <Badge className="bg-emerald-600 text-white font-mono flex items-center gap-1">
                                        <Lock className="size-3" />
                                        Token Kustom Aktif ({customApiKey.substring(0, 6)}...{customApiKey.slice(-4)})
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-neutral-600 dark:text-muted-foreground font-mono">
                                        Token Server (.env Terintegrasi)
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setTempApiKey(customApiKey)}
                                            className="h-7 text-xs flex items-center gap-1.5"
                                        >
                                            <Key className="size-3 text-foreground" />
                                            {customApiKey ? 'Ganti Token API' : 'Pasang Token API Sendiri'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[480px]">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <Key className="size-5 text-foreground" />
                                                Pengaturan Token API Gemini
                                            </DialogTitle>
                                            <DialogDescription className="text-xs">
                                                Masukkan Google AI Studio Gemini API Key Anda (misal: <code>AIzaSy...</code>). Token disimpan di browser Anda secara privat dan digunakan langsung untuk menjawab pertanyaan secara instan.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-3 py-3">
                                            <Label htmlFor="apiKeyInput" className="text-xs">
                                                Gemini API Key (Google AI Studio)
                                            </Label>
                                            <Input
                                                id="apiKeyInput"
                                                type="password"
                                                value={tempApiKey}
                                                onChange={(e) => setTempApiKey(e.target.value)}
                                                placeholder="AIzaSy..."
                                                className="font-mono text-xs"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Belum punya token? Dapatkan gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Google AI Studio</a>.
                                            </p>
                                        </div>

                                        <DialogFooter className="flex justify-between sm:justify-between">
                                            {customApiKey ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleClearCustomKey}
                                                    className="text-red-600 hover:text-red-700 text-xs flex items-center gap-1"
                                                >
                                                    <Trash2 className="size-3.5" /> Hapus Token
                                                </Button>
                                            ) : <div />}
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowKeyModal(false)}
                                                >
                                                    Batal
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleSaveCustomKey}
                                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                                >
                                                    Simpan Token
                                                </Button>
                                            </div>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {customApiKey && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearCustomKey}
                                        className="h-7 text-xs text-red-500 hover:text-red-700 px-2"
                                        title="Kembali menggunakan token server"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>

                        <Card className="flex flex-col min-h-[420px]">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Bot className="size-5 text-foreground" />
                                    Asisten Riset AI — Tanya Jawab Makalah
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Ajukan pertanyaan apapun mengenai metodologi, temuan, atau data makalah ini untuk dijawab langsung berbasis bukti.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[500px]">
                                {qaHistory.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground text-xs">
                                        <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
                                        <p>Belum ada pertanyaan yang diajukan.</p>
                                        <p className="mt-1">Coba tanyakan: <em>"Dataset apa yang digunakan?"</em> atau <em>"Apa kesimpulan dan keterbatasan utama penelitian ini?"</em></p>
                                    </div>
                                ) : (
                                    qaHistory.map((item, idx) => (
                                        <div key={idx} className="flex flex-col gap-2">
                                            {/* User question */}
                                            <div className="self-end bg-primary text-primary-foreground font-medium text-xs px-3.5 py-2.5 rounded-2xl max-w-[80%] shadow-xs leading-relaxed">
                                                {item.question}
                                            </div>

                                            {/* AI answer */}
                                            <div className="self-start bg-muted text-xs p-3.5 rounded-2xl max-w-[85%] border border-border/60 space-y-2">
                                                <p className="text-foreground leading-relaxed font-sans">
                                                    {item.answer}
                                                </p>
                                                {item.evidence?.quote && (
                                                    <div className="bg-card border-border/60 p-2 rounded-lg border text-[11px] text-foreground italic">
                                                        "{item.evidence.quote}"
                                                        {item.evidence.page && <span className="font-semibold ml-1 text-foreground">(Halaman {item.evidence.page})</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>

                            <div className="p-4 border-t bg-muted/70 border-border/60">
                                <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
                                    <Input
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder={(!isResearcher && !isPaperOwner) ? "Fitur chatbot eksklusif untuk Peneliti..." : "Ajukan pertanyaan tentang metodologi, data, temuan makalah..."}
                                        disabled={isAsking || (!isResearcher && !isPaperOwner)}
                                        className="text-xs bg-card border-border/60 text-foreground"
                                    />
                                    <Button type="submit" disabled={isAsking || !question.trim() || (!isResearcher && !isPaperOwner)} className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                                        {isAsking ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                    </Button>
                                </form>
                                <div className="mt-2 text-[10px] text-muted-foreground flex items-center justify-between">
                                    <span>Model: <strong>Gemini Flash</strong></span>
                                    <span>Mode: {customApiKey ? '⚡ Token Kustom (Direct User)' : '🌐 Token Server (.env)'}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* TAB 6: PEER REVIEWS & DISCUSSION COMMENTS */}
                {activeTab === 'reviews' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                    <MessageSquare className="size-5 text-foreground" />
                                    Laporan Telaah & Forum Diskusi Naskah
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Ulasan komprehensif, rekomendasi keputusan publikasi, skor akademik, dan kolom komentar antara Reviewer & Peneliti.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isReviewer && (
                                    <Button
                                        size="sm"
                                        onClick={() => setShowReviewModal(true)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs shadow-sm"
                                    >
                                        <PenTool className="size-3.5" /> Beri Review & Nilai
                                    </Button>
                                )}
                            </div>
                        </div>

                        {currentPaper.reviews && currentPaper.reviews.length > 0 ? (
                            <div className="space-y-6">
                                {currentPaper.reviews.map((rev) => (
                                    <div key={rev.id} className="bg-card border border-border/60 rounded-2xl p-5 space-y-4 shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
                                            <div className="flex items-center gap-3">
                                                <Badge variant={rev.recommendation === 'ACCEPT' ? 'default' : 'destructive'} className="font-semibold text-xs">
                                                    {recommendationLabels[rev.recommendation] || rev.recommendation.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-xs font-semibold text-foreground">
                                                    {rev.is_ai_generated ? '🤖 Evaluasi Sintetis AI (Gemini)' : `👤 ${rev.reviewer?.name || 'Reviewer Mitra Bestari'}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {rev.score !== null && rev.score !== undefined && (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                                        <Star className="size-3.5 fill-emerald-500 text-emerald-500" />
                                                        Skor Reviewer: <span className="font-mono">{rev.score}/100</span>
                                                    </div>
                                                )}
                                                <span className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <div className="space-y-1">
                                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ringkasan Eksekutif & Catatan Telaah</h5>
                                            <p className="text-xs text-foreground leading-relaxed bg-muted/40 p-3.5 rounded-xl border border-border/60">
                                                {rev.summary}
                                            </p>
                                        </div>

                                        {/* Methodology Review */}
                                        {rev.methodology_review && (
                                            <div className="p-3.5 bg-muted/40 border border-border/60 rounded-xl text-xs space-y-1">
                                                <h5 className="font-semibold text-foreground flex items-center gap-1.5">
                                                    <Layers className="size-3.5 text-foreground" /> Ulasan Metodologi:
                                                </h5>
                                                <p className="text-muted-foreground leading-relaxed">{rev.methodology_review}</p>
                                            </div>
                                        )}

                                        {/* Novelty Review */}
                                        {rev.novelty_review && (
                                            <div className="p-3.5 bg-muted/40 border border-border/60 rounded-xl text-xs space-y-1">
                                                <h5 className="font-semibold text-foreground flex items-center gap-1.5">
                                                    <Sparkles className="size-3.5 text-amber-400" /> Ulasan Kebaruan & Kontribusi:
                                                </h5>
                                                <p className="text-muted-foreground leading-relaxed">{rev.novelty_review}</p>
                                            </div>
                                        )}

                                        {/* Discussion / Comments Section */}
                                        <div className="pt-3 border-t border-border/60 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                    <MessageSquare className="size-3.5 text-foreground" />
                                                    Diskusi & Tanggapan ({rev.comments?.length || 0})
                                                </h5>
                                            </div>

                                            {rev.comments && rev.comments.length > 0 && (
                                                <div className="space-y-2.5">
                                                    {rev.comments.map((c) => {
                                                        const canDelete = authUser?.id === c.user_id || isAdmin;
                                                        return (
                                                            <div key={c.id} className="text-xs bg-muted/90 border border-border/60 p-3 rounded-xl flex items-start justify-between gap-3 group">
                                                                <div className="space-y-1 flex-1">
                                                                    <div className="flex items-center gap-2 text-[11px]">
                                                                        <span className="font-bold text-foreground">{c.user?.name || 'Pengguna'}</span>
                                                                        <span className="text-muted-foreground">•</span>
                                                                        <span className="text-muted-foreground text-[10px]">{new Date(c.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                    <p className="text-foreground leading-relaxed">{c.comment}</p>
                                                                </div>

                                                                {canDelete && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteComment(c.id)}
                                                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
                                                                        title="Hapus Komentar"
                                                                    >
                                                                        <Trash2 className="size-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Add Comment Input */}
                                            {activeCommentReviewId === rev.id ? (
                                                <div className="flex flex-col gap-2 pt-2">
                                                    <textarea
                                                        rows={2}
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Tulis tanggapan atau klarifikasi atas ulasan ini..."
                                                        className="w-full rounded-xl border border-border/60 bg-muted p-3 text-xs text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => { setActiveCommentReviewId(null); setCommentText(''); }} className="h-7 text-xs">
                                                            Batal
                                                        </Button>
                                                        <Button size="sm" disabled={isSubmittingComment || !commentText.trim()} onClick={() => handleAddComment(rev.id)} className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                                                            {isSubmittingComment ? <Loader2 className="size-3 animate-spin mr-1" /> : <Send className="size-3 mr-1" />}
                                                            Kirim Tanggapan
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setActiveCommentReviewId(rev.id); setCommentText(''); }}
                                                    className="h-7 text-xs text-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 p-0"
                                                >
                                                    <Plus className="size-3" /> Tambah Tanggapan / Komentar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center bg-card border border-border/60 rounded-2xl">
                                <MessageSquare className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-semibold text-foreground">
                                    Belum ada ulasan yang tersimpan.
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Laporan ulasan AI akan otomatis muncul setelah analisis selesai, dan Reviewer dapat menambahkan telaah sejawat.
                                </p>
                            </div>
                        )}
                    </div>
                )}            </div>
        </AppLayout>
    );
}