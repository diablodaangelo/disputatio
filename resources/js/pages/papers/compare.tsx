import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    AlertCircle, 
    ArrowRightLeft, 
    Award, 
    CheckCircle2, 
    CircleDot,
    FileText,
    GitCompare, 
    Layers, 
    Loader2, 
    Plus,
    Scale, 
    Sparkles,
    TrendingUp
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AvailablePaper {
    id: number;
    title: string;
    publication_year: number | null;
}

interface MatrixRow {
    aspect: string;
    paper_a: string;
    paper_b: string;
}

interface Verdict {
    stronger_methodology: string;
    stronger_evidence: string;
    more_reproducible: string;
    rationale: string;
}

interface Props {
    available_papers: AvailablePaper[];
}

export default function ComparePapers({ available_papers }: Props) {
    const [paperAId, setPaperAId] = useState<string>(available_papers[0]?.id?.toString() || '');
    const [paperBId, setPaperBId] = useState<string>(available_papers[1]?.id?.toString() || '');
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonResult, setComparisonResult] = useState<{
        paper_a: { id: number; title: string };
        paper_b: { id: number; title: string };
        comparison: {
            matrix: MatrixRow[];
            verdict: Verdict;
        };
    } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleCompare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paperAId || !paperBId) {
            setErrorMessage('Silakan pilih dua naskah makalah untuk dibandingkan.');
            return;
        }

        if (paperAId === paperBId) {
            setErrorMessage('Silakan pilih dua naskah makalah yang berbeda.');
            return;
        }

        setIsComparing(true);
        setErrorMessage(null);

        try {
            const reqHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
            if (match) {
                reqHeaders['X-XSRF-TOKEN'] = decodeURIComponent(match[1]);
            }

            const res = await fetch('/compare', {
                method: 'POST',
                credentials: 'same-origin',
                headers: reqHeaders,
                body: JSON.stringify({
                    paper_a_id: parseInt(paperAId, 10),
                    paper_b_id: parseInt(paperBId, 10),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && data.success && data.comparison) {
                setComparisonResult(data);
            } else {
                setErrorMessage(data.error || data.message || `Gagal membandingkan makalah (HTTP ${res.status}).`);
            }
        } catch (err: any) {
            setErrorMessage('Terjadi kesalahan jaringan atau waktu tunggu habis saat memproses komparasi.');
        } finally {
            setIsComparing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Komparasi Makalah', href: '/compare' }]}>
            <Head title="Komparasi Makalah Ilmiah - Disputatio" />

            <div className="flex flex-1 flex-col gap-8 p-6 sm:p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="pb-2 border-b border-border/60 animate-enter">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border/80 text-muted-foreground text-xs font-medium mb-2.5">
                        <CircleDot className="size-3 text-primary animate-pulse" />
                        <span>Matriks Analisis Komparatif</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        Komparasi Makalah Akademik
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pilih dua naskah riset untuk menghasilkan matriks komparasi side-by-side serta evaluasi keunggulan metodologi, bukti empiris, dan reproduksibilitas oleh AI.
                    </p>
                </div>

                {/* Selection Form Card */}
                <Card className="rounded-2xl border border-border/70 shadow-xs animate-enter-delay-1">
                    <CardHeader className="p-6 pb-4 border-b border-border/50">
                        <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <Scale className="size-4 text-primary" />
                            Pilih Dua Makalah untuk Dikomparasi
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Pilih dua naskah riset dari repositori yang sudah teranalisis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {available_papers.length < 2 ? (
                            <div className="py-10 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border/80 bg-muted/20">
                                <Scale className="size-10 mx-auto mb-3 opacity-50" />
                                <h4 className="text-sm font-semibold text-foreground">Dibutuhkan Minimal 2 Naskah Makalah</h4>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    Unggah naskah makalah tambahan di repositori Anda agar fitur komparasi dapat dijalankan.
                                </p>
                                <Button asChild size="sm" className="mt-4 rounded-xl">
                                    <Link href="/papers">
                                        <Plus className="size-4 mr-1.5" />
                                        Unggah Makalah
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleCompare} className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-foreground block mb-2">
                                        Makalah A (Objek Pertama)
                                    </label>
                                    <select
                                        value={paperAId}
                                        onChange={(e) => setPaperAId(e.target.value)}
                                        className="w-full bg-background border border-border/80 rounded-xl p-3 text-xs text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    >
                                        <option value="">Pilih Makalah A...</option>
                                        {available_papers.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.title} {p.publication_year ? `(${p.publication_year})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="hidden lg:flex items-center justify-center pb-3">
                                    <div className="p-2 rounded-xl bg-muted border border-border/70 text-muted-foreground">
                                        <ArrowRightLeft className="size-4" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-foreground block mb-2">
                                        Makalah B (Objek Pembanding)
                                    </label>
                                    <select
                                        value={paperBId}
                                        onChange={(e) => setPaperBId(e.target.value)}
                                        className="w-full bg-background border border-border/80 rounded-xl p-3 text-xs text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    >
                                        <option value="">Pilih Makalah B...</option>
                                        {available_papers.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.title} {p.publication_year ? `(${p.publication_year})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isComparing || !paperAId || !paperBId || paperAId === paperBId}
                                    className="rounded-xl h-11 px-6 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 flex items-center justify-center gap-2 text-xs"
                                >
                                    {isComparing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" /> 
                                            <span>Menganalisis Matriks...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="size-4" /> 
                                            <span>Bandingkan Makalah</span>
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}

                        {errorMessage && (
                            <div className="bg-destructive/10 text-destructive text-xs p-3.5 rounded-xl border border-destructive/20 mt-4 flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Comparison Results */}
                {comparisonResult && (
                    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
                        {/* Comparative Verdict Banner */}
                        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                            <CardHeader className="p-6 pb-4 border-b border-border/50 bg-muted/30">
                                <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                                    <Award className="size-5 text-primary" /> 
                                    Kesimpulan Evaluasi Komparatif AI
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Hasil penelaahan objektif 3 pilar ilmiah utama terhadap kedua naskah riset.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-muted/40 p-4 rounded-xl border border-border/60">
                                        <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                                            Metodologi Lebih Unggul:
                                        </span>
                                        <div className="font-bold text-sm text-foreground capitalize flex items-center gap-1.5">
                                            <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                                            <span className="truncate">
                                                {comparisonResult.comparison.verdict.stronger_methodology === 'paper_a'
                                                    ? comparisonResult.paper_a.title
                                                    : comparisonResult.comparison.verdict.stronger_methodology === 'paper_b'
                                                    ? comparisonResult.paper_b.title
                                                    : 'Setara / Imbang'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-muted/40 p-4 rounded-xl border border-border/60">
                                        <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                                            Bukti Empiris Lebih Kuat:
                                        </span>
                                        <div className="font-bold text-sm text-foreground capitalize flex items-center gap-1.5">
                                            <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                                            <span className="truncate">
                                                {comparisonResult.comparison.verdict.stronger_evidence === 'paper_a'
                                                    ? comparisonResult.paper_a.title
                                                    : comparisonResult.comparison.verdict.stronger_evidence === 'paper_b'
                                                    ? comparisonResult.paper_b.title
                                                    : 'Setara / Imbang'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-muted/40 p-4 rounded-xl border border-border/60">
                                        <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                                            Tingkat Reproduksibilitas:
                                        </span>
                                        <div className="font-bold text-sm text-foreground capitalize flex items-center gap-1.5">
                                            <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                                            <span className="truncate">
                                                {comparisonResult.comparison.verdict.more_reproducible === 'paper_a'
                                                    ? comparisonResult.paper_a.title
                                                    : comparisonResult.comparison.verdict.more_reproducible === 'paper_b'
                                                    ? comparisonResult.paper_b.title
                                                    : 'Setara / Imbang'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                                    <span className="font-semibold text-foreground block mb-1.5 text-xs">
                                        Rasionalisasi & Pertimbangan Komparatif:
                                    </span>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {comparisonResult.comparison.verdict.rationale}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Aspect Comparison Matrix Table */}
                        <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden">
                            <CardHeader className="p-6 pb-4 border-b border-border/50">
                                <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                                    <Layers className="size-4 text-primary" />
                                    Matriks Komparasi Aspek Riset
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Tinjauan komparatif mendalam aspek metodologi, novelty, bukti, dan keterbatasan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted/60 text-foreground border-b border-border/60">
                                        <tr>
                                            <th className="py-3.5 px-5 w-1/4 font-semibold">Aspek Analisis</th>
                                            <th className="py-3.5 px-5 w-3/8 font-semibold text-primary">
                                                {comparisonResult.paper_a.title}
                                            </th>
                                            <th className="py-3.5 px-5 w-3/8 font-semibold text-foreground">
                                                {comparisonResult.paper_b.title}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {comparisonResult.comparison.matrix.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-4 px-5 font-semibold text-foreground align-top">
                                                    <span className="inline-block px-2 py-0.5 rounded-md bg-muted border border-border/60 text-[11px]">
                                                        {row.aspect}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-muted-foreground align-top leading-relaxed">
                                                    {row.paper_a}
                                                </td>
                                                <td className="py-4 px-5 text-muted-foreground align-top leading-relaxed">
                                                    {row.paper_b}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}