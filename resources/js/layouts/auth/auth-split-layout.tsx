import { Link } from '@inertiajs/react';
import { ArrowLeft, FileText, GitCompare, ShieldCheck, Sparkles } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex flex-col lg:grid lg:grid-cols-12 selection:bg-white selection:text-black relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* LEFT COLUMN: BRAND & VALUE SHOWCASE (DESKTOP) */}
            <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 xl:p-16 border-r border-[#27272a]/70 relative z-10 bg-gradient-to-b from-[#121214]/60 to-[#09090b]/80 backdrop-blur-md">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <Link href={home()} className="hover:opacity-90 transition-opacity">
                        <AppLogo />
                    </Link>

                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-xs font-medium text-neutral-300 hover:text-white hover:bg-[#27272a] transition-colors"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </div>

                {/* Center Content: Headline & Feature Cards */}
                <div className="space-y-8 my-auto max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                        <Sparkles className="size-3.5" />
                        <span>Research Intelligence Engine v2.0</span>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Evaluasi Naskah Ilmiah &amp; Komparasi Makalah Berbasis AI
                        </h1>
                        <p className="text-sm xl:text-base text-neutral-400 leading-relaxed">
                            Ekstraksi struktur naskah secara otomatis, review kualitatif mitra bestari, dan sintesis komparatif instan dengan akurasi tinggi.
                        </p>
                    </div>

                    {/* Feature Cards List */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#18181b]/70 border border-[#27272a] hover:border-neutral-700 transition">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                                <FileText className="size-4" />
                            </div>
                            <div>
                                <h2 className="font-bold text-xs text-white">Ekstraksi &amp; Parsing PDF Otomatis</h2>
                                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                                    Membedah metodologi, abstrak, temuan kunci, dan sitasi bibtex dari berkas PDF secara terstruktur.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#18181b]/70 border border-[#27272a] hover:border-neutral-700 transition">
                            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                                <GitCompare className="size-4" />
                            </div>
                            <div>
                                <h2 className="font-bold text-xs text-white">Matriks Komparasi Multi-Makalah</h2>
                                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                                    Bandingkan 2 sampai 4 makalah secara side-by-side dengan kalkulasi cosine similarity &amp; sintesis kesamaan.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#18181b]/70 border border-[#27272a] hover:border-neutral-700 transition">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div>
                                <h2 className="font-bold text-xs text-white">Tinjauan Mitra Bestari &amp; Audit Trail</h2>
                                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                                    Sistem evaluasi sejawat dengan skor terstandar dan pencatatan riwayat audit yang tidak dapat diubah (immutable).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Quote / Status */}
                <div className="flex items-center justify-between pt-6 border-t border-[#27272a]/60 text-xs text-neutral-500">
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-[11px] text-neutral-400">Gemini 2.5 Flash Engine: Aktif</span>
                    </div>
                    <span>© 2026 Disputatio Platform</span>
                </div>
            </div>

            {/* RIGHT COLUMN: AUTHENTICATION FORM CARD */}
            <div className="flex-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative z-10">
                {/* Mobile Header */}
                <div className="w-full max-w-md mb-6 lg:hidden flex items-center justify-between">
                    <Link href={home()}>
                        <AppLogo />
                    </Link>
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Beranda</span>
                    </Link>
                </div>

                {/* Main Auth Form Container Card */}
                <div className="w-full max-w-md bg-[#121214]/80 backdrop-blur-xl border border-[#27272a] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-1.5">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Children / Form */}
                    {children}
                </div>
            </div>
        </div>
    );
}
