import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { useState, useEffect } from 'react';
import {
    Sparkles,
    FileText,
    Bot,
    Scale,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    BarChart3,
    BookOpen,
    Zap,
    ChevronDown,
    KeyRound,
    Check,
    X,
    CircleDot
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props;
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [previewMode, setPreviewMode] = useState<'scoring' | 'qa' | 'matrix'>('scoring');
    const [activeSection, setActiveSection] = useState<string | null>(null);
    
    // Interactive Q&A simulator state with smooth streaming typewriter effect
    const [simulatedQaIndex, setSimulatedQaIndex] = useState(0);
    const [displayedAnswer, setDisplayedAnswer] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showEvidence, setShowEvidence] = useState(false);

    const simulatedQas = [
        {
            tag: 'Metodologi & Data',
            q: 'Apa metodologi dan dataset utama yang digunakan dalam naskah ini?',
            a: 'Penelitian mengadopsi pendekatan kuantitatif morfometrik dengan dataset 120 sampel terverifikasi, memetakan 18 variabel fenotipik dan diuji menggunakan analisis multivariat ANOVA (p < 0.01).',
            quote: 'Sampel dikumpulkan secara stratifikasi acak dari 4 sentra konservasi dengan akurasi klasifikasi 96.4%.',
            page: 4
        },
        {
            tag: 'Kebaruan & Kontribusi',
            q: 'Apa kebaruan (novelty) dan kontribusi riset ini terhadap literatur yang ada?',
            a: 'Naskah ini memperkenalkan kerangka klasifikasi hibrida pertama yang menggabungkan ekstraksi ciri morfologis dengan verifikasi sitasi filogenetik modern secara komprehensif.',
            quote: 'Pendekatan ini memangkas ambiguitas taksonomi subspesies hingga 34.2% dibandingkan taksonomi klasik.',
            page: 7
        },
        {
            tag: 'Keterbatasan & Celah',
            q: 'Apa keterbatasan penelitian dan catatan kritis yang perlu diperbaiki?',
            a: 'Ukuran sampel untuk kelompok kontrol geografis terpencil masih terbatas (n=12), dan validasi longitudinal memerlukan pengamatan lebih dari 24 bulan pada habitat liar.',
            quote: 'Eksperimen kontrol terbatas pada lingkungan terkondisi laboratorium.',
            page: 11
        }
    ];

    // Smooth streaming typing effect
    useEffect(() => {
        const fullText = simulatedQas[simulatedQaIndex].a;
        setDisplayedAnswer('');
        setShowEvidence(false);
        setIsTyping(true);

        let currentIndex = 0;
        const step = 4; // stream 4 chars at a time
        const interval = setInterval(() => {
            currentIndex += step;
            if (currentIndex >= fullText.length) {
                setDisplayedAnswer(fullText);
                setIsTyping(false);
                setShowEvidence(true);
                clearInterval(interval);
            } else {
                setDisplayedAnswer(fullText.slice(0, currentIndex));
            }
        }, 16);

        return () => clearInterval(interval);
    }, [simulatedQaIndex, previewMode]);

    // Active scroll section observer to keep navbar highlighted dynamically
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['fitur', 'pratinjau', 'alur', 'komparasi', 'faq'];
            const scrollPosition = window.scrollY + 130;

            if (window.scrollY < 150) {
                setActiveSection(null);
                return;
            }

            for (const sectionId of sections) {
                const el = document.getElementById(sectionId);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            const navHeight = 84;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const scrollToTop = (e: React.MouseEvent) => {
        e.preventDefault();
        setActiveSection(null);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const navItems = [
        { id: 'fitur', label: 'Fitur' },
        { id: 'pratinjau', label: 'Pratinjau' },
        { id: 'alur', label: 'Alur Kerja' },
        { id: 'komparasi', label: 'Keunggulan' },
        { id: 'faq', label: 'FAQ' },
    ];

    const faqs = [
        {
            q: 'Bagaimana Disputatio menganalisis naskah makalah ilmiah?',
            a: 'Disputatio mengekstrak struktur teks PDF secara hierarkis (abstrak, metodologi, temuan, pustaka) lalu memprosesnya melalui model AI Gemini untuk menghasilkan evaluasi 5 dimensi ilmiah secara objektif dan instan.'
        },
        {
            q: 'Apakah bisa menggunakan API Key Google Gemini mandiri?',
            a: 'Ya. Anda dapat menyematkan Google Gemini API Key pribadi langsung di tab Tanya Jawab Makalah untuk kuota tak terbatas, pemrosesan lebih cepat, dan kontrol privasi mandiri tanpa batasan antrean server.'
        },
        {
            q: 'Dimensi ilmiah apa saja yang dievaluasi?',
            a: 'Disputatio mengukur 5 pilar standar: Kejelasan & Struktur (Clarity), Metodologi Penelitian (Methodology), Kebaruan & Orisinalitas (Novelty), Kesahihan Bukti (Soundness), dan Ketelitian Ilmiah (Rigor).'
        },
        {
            q: 'Apakah naskah makalah saya aman dan terlindungi?',
            a: 'Dokumen PDF disimpan pada direktori penyimpanan terenkripsi yang terlindungi. Data Anda hanya dapat diakses oleh Anda sendiri dan reviewer yang berwenang, tanpa dibagikan ke pihak ketiga.'
        },
        {
            q: 'Bagaimana cara kerja fitur komparasi makalah?',
            a: 'Pilih dua makalah di perpustakaan Anda, dan sistem akan langsung menyusun matriks komparasi berdampingan (side-by-side) yang membedah kebaruan temuan, kekuatan metodologi, serta celah riset masing-masing.'
        }
    ];

    return (
        <>
            <Head title="Disputatio — Platform Analisis & Review Makalah Ilmiah Berbasis AI" />

            {/* Custom ColorMind Theme (#262229 Canvas, #313F41 Cards, #CFB082 Gold Accents, #E7DEBB Cream Text) */}
            <div className="min-h-screen bg-[#262229] text-[#E7DEBB] selection:bg-[#CFB082] selection:text-[#262229] font-sans antialiased overflow-x-hidden relative">
                
                {/* Luminous Petrol Teal & Warm Gold Ambient Aura Glows */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                    <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1100px] h-[750px] rounded-full bg-gradient-to-b from-[#313F41]/60 via-[#CFB082]/15 to-transparent blur-[140px] animate-pulse-glow" />
                    <div className="absolute top-[35%] -left-[15%] w-[650px] h-[650px] rounded-full bg-[#313F41]/40 blur-[160px]" />
                    <div className="absolute top-[55%] -right-[15%] w-[650px] h-[650px] rounded-full bg-[#CFB082]/15 blur-[160px]" />
                    <div className="absolute bottom-[5%] left-1/3 w-[500px] h-[500px] rounded-full bg-[#7F765C]/20 blur-[150px]" />
                    {/* Subtle Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#7F765C12_1px,transparent_1px),linear-gradient(to_bottom,#7F765C12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
                </div>

                {/* Firmly Fixed Top Navigation (Never Disappears / Jumps) */}
                <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#262229]/92 border-b border-[#7F765C]/40 shadow-xl shadow-[#262229]/50 transition-all duration-300">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        {/* Logo */}
                        <a
                            href="#"
                            onClick={scrollToTop}
                            className="flex items-center gap-3 group cursor-pointer"
                        >
                            <div className="relative flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#CFB082] via-[#7F765C] to-[#313F41] text-[#262229] shadow-lg shadow-[#313F41]/30 group-hover:scale-105 group-hover:shadow-[#CFB082]/40 transition-all duration-300">
                                <CircleDot className="size-5 stroke-[2.5]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-base tracking-tight text-[#E7DEBB] flex items-center gap-2">
                                    Disputatio
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#313F41] text-[#CFB082] border border-[#7F765C]/50">
                                        AI
                                    </span>
                                </span>
                            </div>
                        </a>

                        {/* Interactive Nav Links with Fixed Tracking */}
                        <nav className="hidden md:flex items-center gap-2 p-1.5 rounded-full bg-[#313F41]/40 border border-[#7F765C]/30">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        onClick={(e) => scrollToSection(e, item.id)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                            isActive
                                                ? 'bg-[#313F41] text-[#CFB082] border border-[#7F765C]/60 shadow-md shadow-[#262229]/60 font-bold scale-[1.03]'
                                                : 'text-[#E7DEBB]/80 hover:text-[#CFB082] hover:bg-[#313F41]/30'
                                        }`}
                                    >
                                        {item.label}
                                    </a>
                                );
                            })}
                        </nav>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="relative group overflow-hidden inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#CFB082] to-[#E7DEBB] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#262229] hover:from-[#E7DEBB] hover:to-[#CFB082] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-[#CFB082]/20"
                                >
                                    <span>Dashboard</span>
                                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#E7DEBB]/80 hover:text-[#CFB082] transition-colors duration-200"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="relative group overflow-hidden inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#CFB082] to-[#E7DEBB] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#262229] hover:from-[#E7DEBB] hover:to-[#CFB082] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-[#CFB082]/20"
                                    >
                                        <span>Daftar</span>
                                        <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area offset for fixed navbar */}
                <main className="pt-20">
                    {/* Hero Section */}
                    <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-24">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                            
                            {/* Headline */}
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#E7DEBB] leading-[1.12] mb-6">
                                Evaluasi Makalah Ilmiah & <br className="hidden sm:inline" />
                                <span className="bg-gradient-to-r from-[#E7DEBB] via-[#CFB082] to-[#7F765C] bg-clip-text text-transparent">
                                    Komparasi Naskah Berbasis AI
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#E7DEBB]/80 font-normal leading-relaxed mb-10">
                                Disputatio membantu peneliti dan akademisi membedah struktur naskah PDF, mengukur 5 dimensi kualitas secara objektif, serta berdiskusi interaktif dengan asisten riset AI berbasis kutipan bukti.
                            </p>

                            {/* Toggle Pill Segment */}
                            <div className="inline-flex items-center p-1.5 rounded-full bg-[#313F41]/90 border border-[#7F765C]/50 backdrop-blur-md mb-12 shadow-2xl shadow-[#262229]/60">
                                <button
                                    onClick={() => setPreviewMode('scoring')}
                                    className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                                        previewMode === 'scoring'
                                            ? 'bg-gradient-to-r from-[#CFB082] to-[#E7DEBB] text-[#262229] font-bold shadow-lg shadow-[#CFB082]/25 scale-105'
                                            : 'text-[#E7DEBB]/70 hover:text-[#E7DEBB]'
                                    }`}
                                >
                                    Skor & 5 Dimensi
                                </button>
                                <button
                                    onClick={() => setPreviewMode('qa')}
                                    className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                                        previewMode === 'qa'
                                            ? 'bg-gradient-to-r from-[#CFB082] to-[#E7DEBB] text-[#262229] font-bold shadow-lg shadow-[#CFB082]/25 scale-105'
                                            : 'text-[#E7DEBB]/70 hover:text-[#E7DEBB]'
                                    }`}
                                >
                                    Asisten Riset AI
                                </button>
                                <button
                                    onClick={() => setPreviewMode('matrix')}
                                    className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                                        previewMode === 'matrix'
                                            ? 'bg-gradient-to-r from-[#CFB082] to-[#E7DEBB] text-[#262229] font-bold shadow-lg shadow-[#CFB082]/25 scale-105'
                                            : 'text-[#E7DEBB]/70 hover:text-[#E7DEBB]'
                                    }`}
                                >
                                    Matriks Komparasi
                                </button>
                            </div>
                        </div>

                        {/* 3 Luminous #313F41 Petrol Teal Cards */}
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* Card 1 */}
                                <div
                                    onClick={() => setPreviewMode('scoring')}
                                    className={`group relative p-8 rounded-3xl bg-[#313F41]/95 border transition-all duration-300 cursor-pointer overflow-hidden ${
                                        previewMode === 'scoring'
                                            ? 'border-[#CFB082] shadow-2xl shadow-[#313F41]/80 ring-1 ring-[#CFB082]/50 -translate-y-1 bg-gradient-to-b from-[#38484a] to-[#313F41]'
                                            : 'border-[#7F765C]/40 hover:border-[#CFB082]/60 hover:-translate-y-0.5'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-10 h-10 rounded-2xl bg-[#262229] border border-[#7F765C]/50 flex items-center justify-center text-[#CFB082] group-hover:scale-110 group-hover:bg-[#CFB082] group-hover:text-[#262229] transition-all duration-300 shadow-md">
                                            <BarChart3 className="size-5" />
                                        </div>
                                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#CFB082]">
                                            Pilar I
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#E7DEBB] mb-2 group-hover:text-white transition-colors">Penilaian 5 Dimensi</h3>
                                    <p className="text-xs text-[#E7DEBB]/75 leading-relaxed mb-6">
                                        Evaluasi objektif terukur pada aspek Clarity, Methodology, Novelty, Soundness, dan Rigor secara ilmiah.
                                    </p>
                                    <div className="pt-4 border-t border-[#7F765C]/40 flex items-baseline justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-[#E7DEBB] tracking-tight">92<span className="text-xs text-[#CFB082] font-normal">/100</span></div>
                                            <div className="text-[10px] uppercase tracking-wider text-[#CFB082] font-mono mt-0.5 font-semibold">Rekomendasi Publikasi</div>
                                        </div>
                                        <span className="text-xs text-[#CFB082] font-medium flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-200">
                                            Pratinjau <ArrowRight className="size-3.5" />
                                        </span>
                                    </div>
                                </div>

                                {/* Card 2 - Center Featured */}
                                <div
                                    onClick={() => setPreviewMode('qa')}
                                    className={`group relative p-8 rounded-3xl bg-[#313F41]/95 border transition-all duration-300 cursor-pointer overflow-hidden ${
                                        previewMode === 'qa'
                                            ? 'border-[#CFB082] shadow-2xl shadow-[#313F41]/80 ring-1 ring-[#CFB082]/50 -translate-y-1 bg-gradient-to-b from-[#38484a] to-[#313F41]'
                                            : 'border-[#7F765C]/40 hover:border-[#CFB082]/60 hover:-translate-y-0.5'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#CFB082] to-[#E7DEBB] text-[#262229] flex items-center justify-center shadow-lg shadow-[#CFB082]/20 group-hover:scale-110 transition-transform duration-300 font-bold">
                                            <Bot className="size-5" />
                                        </div>
                                        <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#262229] text-[#CFB082] border border-[#CFB082]/40">
                                            Unggulan
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#E7DEBB] mb-2 group-hover:text-white transition-colors">Asisten Riset AI (Q&A)</h3>
                                    <p className="text-xs text-[#E7DEBB]/75 leading-relaxed mb-6">
                                        Berdialog langsung dengan isi naskah makalah. Tanyakan metodologi, celah riset, dan verifikasi bukti kutipan instan.
                                    </p>
                                    <div className="pt-4 border-t border-[#7F765C]/40 flex items-baseline justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-[#CFB082] tracking-tight">Gemini 2026</div>
                                            <div className="text-[10px] uppercase tracking-wider text-[#E7DEBB]/70 font-mono mt-0.5">Dukungan API Token Pribadi</div>
                                        </div>
                                        <span className="text-xs text-[#CFB082] font-medium flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-200">
                                            Tanya Jawab <ArrowRight className="size-3.5" />
                                        </span>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div
                                    onClick={() => setPreviewMode('matrix')}
                                    className={`group relative p-8 rounded-3xl bg-[#313F41]/95 border transition-all duration-300 cursor-pointer overflow-hidden ${
                                        previewMode === 'matrix'
                                            ? 'border-[#CFB082] shadow-2xl shadow-[#313F41]/80 ring-1 ring-[#CFB082]/50 -translate-y-1 bg-gradient-to-b from-[#38484a] to-[#313F41]'
                                            : 'border-[#7F765C]/40 hover:border-[#CFB082]/60 hover:-translate-y-0.5'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-10 h-10 rounded-2xl bg-[#262229] border border-[#7F765C]/50 flex items-center justify-center text-[#CFB082] group-hover:scale-110 group-hover:bg-[#CFB082] group-hover:text-[#262229] transition-all duration-300 shadow-md">
                                            <Scale className="size-5" />
                                        </div>
                                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#CFB082]">
                                            Pilar III
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#E7DEBB] mb-2 group-hover:text-white transition-colors">Matriks Komparasi</h3>
                                    <p className="text-xs text-[#E7DEBB]/75 leading-relaxed mb-6">
                                        Bandingkan dua makalah secara side-by-side untuk menganalisis kontribusi, perbedaan metodologi, dan temuan.
                                    </p>
                                    <div className="pt-4 border-t border-[#7F765C]/40 flex items-baseline justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-[#E7DEBB] tracking-tight">Side-by-Side</div>
                                            <div className="text-[10px] uppercase tracking-wider text-[#CFB082] font-mono mt-0.5">Analisis Komparatif Instan</div>
                                        </div>
                                        <span className="text-xs text-[#CFB082] font-medium flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-200">
                                            Bandingkan <ArrowRight className="size-3.5" />
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Interactive Dynamic Live Screen Mockup */}
                    <section id="pratinjau" className="scroll-mt-24 relative z-10 py-16 bg-[#211d23] border-y border-[#7F765C]/30">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-2xl mx-auto mb-12">
                                <span className="text-[11px] font-mono uppercase tracking-widest text-[#CFB082] px-3.5 py-1 rounded-full bg-[#313F41] border border-[#7F765C]/50">
                                    Antarmuka Terstruktur
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#E7DEBB] mt-4 mb-3">
                                    Dirancang untuk Ketajaman Ulasan Akademis
                                </h2>
                                <p className="text-xs sm:text-sm text-[#E7DEBB]/70">
                                    Pilihan mode tampilan di bawah ini langsung mensimulasikan hasil analisis naskah secara dinamis.
                                </p>
                            </div>

                            {/* Minimalist Mac Window Container */}
                            <div className="relative rounded-3xl bg-[#313F41] border border-[#7F765C]/50 shadow-2xl shadow-[#262229]/80 overflow-hidden">

                                {/* Window Header Bar */}
                                <div className="bg-[#262229] px-6 py-4 border-b border-[#7F765C]/40 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#CFB082]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                        <span className="ml-4 text-[11px] font-mono text-[#E7DEBB]/70 hidden sm:inline">
                                            disputatio / naskah-analisis / {previewMode === 'matrix' ? 'Komparasi_Dua_Naskah.pdf' : 'Felis_Catus_Review.pdf'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#313F41] text-[#CFB082] border border-[#7F765C]/50 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Status: {previewMode === 'matrix' ? 'Matriks Komparasi Aktif' : 'Selesai Dianalisis'}
                                        </span>
                                    </div>
                                </div>

                                {/* Dynamic Content Area based on previewMode */}
                                <div className="p-6 sm:p-8 transition-all duration-300 min-h-[480px]">
                                    
                                    {/* MODE 1: SCORING & 5 DIMENSI */}
                                    {previewMode === 'scoring' && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            {/* Title & Overall Score */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#7F765C]/30">
                                                <div>
                                                    <div className="text-xs font-mono uppercase tracking-wider text-[#CFB082] mb-1 flex items-center gap-2">
                                                        <span>Makalah Ilmiah Spesimen #005</span>
                                                        <span>•</span>
                                                        <span className="text-[#E7DEBB]/70">Taksonomi & Biologi</span>
                                                    </div>
                                                    <h3 className="text-lg sm:text-xl font-bold text-[#E7DEBB]">
                                                        Dokumentasi Profil Biologi dan Taksonomi Felis Catus
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-4 bg-[#262229] px-4 py-3 rounded-2xl border border-[#7F765C]/40 shrink-0 shadow-lg">
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#E7DEBB]/60">Skor Kualitas AI</div>
                                                        <div className="text-xs font-semibold text-emerald-400">Sangat Layak Publikasi</div>
                                                    </div>
                                                    <div className="text-xl font-bold text-[#262229] font-mono bg-gradient-to-br from-[#CFB082] to-[#E7DEBB] px-3.5 py-1 rounded-xl shadow-md shadow-[#CFB082]/20">
                                                        92/100
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 4 Dimension Bars */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { label: 'Kejelasan & Struktur (Clarity)', score: 94, barClass: 'bg-gradient-to-r from-[#CFB082] to-[#E7DEBB]' },
                                                    { label: 'Metodologi Penelitian (Methodology)', score: 88, barClass: 'bg-gradient-to-r from-[#7F765C] to-[#CFB082]' },
                                                    { label: 'Kebaruan & Orisinalitas (Novelty)', score: 90, barClass: 'bg-gradient-to-r from-[#CFB082] to-[#E7DEBB]' },
                                                    { label: 'Kesahihan Bukti (Soundness)', score: 95, barClass: 'bg-gradient-to-r from-[#7F765C] to-[#CFB082]' },
                                                ].map((dim, i) => (
                                                    <div key={i} className="p-4 rounded-2xl bg-[#262229]/70 border border-[#7F765C]/40 space-y-2 hover:border-[#CFB082]/50 transition-all">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-[#E7DEBB] font-medium">{dim.label}</span>
                                                            <span className="text-[#CFB082] font-mono font-bold">{dim.score}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-[#313F41] rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all duration-1000 ${dim.barClass}`} style={{ width: `${dim.score}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Key Finding Preview Badge */}
                                            <div className="p-4 rounded-2xl bg-[#262229] border border-[#7F765C]/50 flex items-start gap-3">
                                                <div className="p-2 rounded-xl bg-[#313F41] text-[#CFB082] shrink-0 mt-0.5 border border-[#7F765C]/40">
                                                    <Sparkles className="size-4" />
                                                </div>
                                                <div className="text-xs space-y-1">
                                                    <div className="font-semibold text-[#CFB082]">Temuan Unggulan (AI Analysis):</div>
                                                    <p className="text-[#E7DEBB]/80 leading-relaxed">
                                                        Matriks morfometrik yang diajukan menunjukkan konsistensi klasifikasi 96.4% terhadap pohon filogenetik standar Sanger.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* MODE 2: ASISTEN RISET AI (SILKY STREAMING DIALOGUE) */}
                                    {previewMode === 'qa' && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <div className="flex items-center justify-between pb-3 border-b border-[#7F765C]/30">
                                                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#CFB082]">
                                                    <Bot className="size-4 text-[#CFB082]" />
                                                    <span>Asisten Riset AI — Tanya Jawab Interaktif</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-[#E7DEBB]/70">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span>Gemini 2.5 Flash Connected</span>
                                                </div>
                                            </div>

                                            {/* Clickable prompt pills */}
                                            <div className="space-y-1.5">
                                                <div className="text-[11px] text-[#E7DEBB]/70 font-medium flex items-center gap-1.5">
                                                    <Sparkles className="size-3 text-[#CFB082]" />
                                                    <span>Pilih Pertanyaan Simulasi:</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    {simulatedQas.map((qa, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setSimulatedQaIndex(i)}
                                                            className={`p-2.5 rounded-2xl text-left text-xs transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                                                                simulatedQaIndex === i
                                                                    ? 'bg-[#CFB082] text-[#262229] border-[#CFB082] shadow-lg shadow-[#CFB082]/25 scale-[1.02] font-semibold'
                                                                    : 'bg-[#262229] text-[#E7DEBB]/80 hover:text-white hover:bg-[#2c2730] border-[#7F765C]/40'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className={`text-[10px] font-mono uppercase tracking-wider ${simulatedQaIndex === i ? 'text-[#262229] font-bold' : 'text-[#CFB082]'}`}>
                                                                    #{i + 1} {qa.tag}
                                                                </span>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${simulatedQaIndex === i ? 'bg-[#262229]' : 'bg-transparent'}`} />
                                                            </div>
                                                            <span className="line-clamp-1 font-medium text-[11px]">
                                                                {qa.q}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Sleek Chat Box */}
                                            <div className="p-5 rounded-2xl bg-[#262229] border border-[#7F765C]/40 space-y-4 shadow-inner">
                                                {/* User Bubble */}
                                                <div className="flex justify-end">
                                                    <div className="bg-gradient-to-r from-[#CFB082] to-[#E7DEBB] text-[#262229] font-bold text-xs px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] shadow-md shadow-[#CFB082]/20">
                                                        {simulatedQas[simulatedQaIndex].q}
                                                    </div>
                                                </div>

                                                {/* AI Response Bubble */}
                                                <div className="bg-[#313F41] border border-[#7F765C]/40 p-4 rounded-2xl space-y-3 text-xs">
                                                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#CFB082]">
                                                        <Bot className="size-3.5 text-[#CFB082]" />
                                                        <span className="text-[#E7DEBB] font-semibold">Disputatio AI:</span>
                                                    </div>

                                                    <div className="text-[#E7DEBB] leading-relaxed font-sans min-h-[44px]">
                                                        {displayedAnswer}
                                                        {isTyping && (
                                                            <span className="inline-block w-1.5 h-3.5 bg-[#CFB082] ml-1 animate-pulse align-middle" />
                                                        )}
                                                    </div>

                                                    {/* Evidence Quote */}
                                                    <div
                                                        className={`transition-all duration-500 transform ${
                                                            showEvidence
                                                                ? 'opacity-100 translate-y-0'
                                                                : 'opacity-0 translate-y-2 pointer-events-none'
                                                        }`}
                                                    >
                                                        <div className="p-3 bg-[#262229] border border-[#7F765C]/50 rounded-xl text-[11px] text-[#E7DEBB] italic flex items-start gap-2.5 shadow-sm">
                                                            <BookOpen className="size-3.5 text-[#CFB082] shrink-0 mt-0.5" />
                                                            <div>
                                                                "{simulatedQas[simulatedQaIndex].quote}"
                                                                <span className="font-semibold ml-1.5 text-[#CFB082] not-italic font-mono">
                                                                    (Halaman {simulatedQas[simulatedQaIndex].page})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* MODE 3: MATRIKS KOMPARASI SIDE-BY-SIDE */}
                                    {previewMode === 'matrix' && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <div className="flex items-center justify-between pb-3 border-b border-[#7F765C]/30">
                                                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#CFB082]">
                                                    <Scale className="size-4 text-[#CFB082]" />
                                                    <span>Matriks Komparasi Makalah Berdampingan (Side-by-Side)</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-[#E7DEBB]/70">2 Naskah Terpilih</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Paper A */}
                                                <div className="p-4 rounded-2xl bg-[#262229] border border-[#7F765C]/40 space-y-3">
                                                    <div className="text-[10px] font-mono text-[#CFB082] uppercase">Makalah A (Spesimen #005)</div>
                                                    <h4 className="text-xs font-bold text-[#E7DEBB]">Profil Biologi & Taksonomi Felis Catus</h4>
                                                    <div className="space-y-2 text-xs text-[#E7DEBB]/80">
                                                        <div className="p-2.5 rounded-xl bg-[#313F41] border border-[#7F765C]/30">
                                                            <span className="font-semibold text-[#CFB082] block mb-0.5">Metodologi:</span>
                                                            Kuantitatif morfometrik dengan 120 sampel terverifikasi.
                                                        </div>
                                                        <div className="p-2.5 rounded-xl bg-[#313F41] border border-[#7F765C]/30">
                                                            <span className="font-semibold text-[#CFB082] block mb-0.5">Skor Kualitas:</span>
                                                            <span className="font-mono font-bold text-emerald-400">92/100</span> (Sangat Layak)
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Paper B */}
                                                <div className="p-4 rounded-2xl bg-[#262229] border border-[#7F765C]/40 space-y-3">
                                                    <div className="text-[10px] font-mono text-[#CFB082] uppercase">Makalah B (Komparator #008)</div>
                                                    <h4 className="text-xs font-bold text-[#E7DEBB]">Analisis Filogenetik Felidae Asia Tenggara</h4>
                                                    <div className="space-y-2 text-xs text-[#E7DEBB]/80">
                                                        <div className="p-2.5 rounded-xl bg-[#313F41] border border-[#7F765C]/30">
                                                            <span className="font-semibold text-[#CFB082] block mb-0.5">Metodologi:</span>
                                                            Kualitatif sekuensing DNA mitokondria 45 sampel.
                                                        </div>
                                                        <div className="p-2.5 rounded-xl bg-[#313F41] border border-[#7F765C]/30">
                                                            <span className="font-semibold text-[#CFB082] block mb-0.5">Skor Kualitas:</span>
                                                            <span className="font-mono font-bold text-emerald-400">84/100</span> (Layak Publikasi)
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Synthesis Row */}
                                            <div className="p-3.5 rounded-2xl bg-[#262229] border border-[#7F765C]/50 text-xs text-[#E7DEBB] flex items-center gap-2.5">
                                                <CheckCircle2 className="size-4 text-[#CFB082] shrink-0" />
                                                <span><strong>Sintesis AI:</strong> Makalah A lebih unggul pada kesahihan data kuantitatif, sedangkan Makalah B memiliki kebaruan sekuensing molekuler.</span>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Grid */}
                    <section id="fitur" className="scroll-mt-24 relative z-10 py-20 md:py-28">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-2xl mx-auto mb-16">
                                <span className="text-[11px] font-mono uppercase tracking-widest text-[#CFB082] px-3.5 py-1 rounded-full bg-[#313F41] border border-[#7F765C]/50">
                                    Kapabilitas Sistem
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-bold text-[#E7DEBB] mt-4 mb-3">
                                    Fitur Inti Penelaahan Ilmiah
                                </h2>
                                <p className="text-sm text-[#E7DEBB]/70">
                                    Seluruh modul dirancang untuk mempercepat proses review dan penulisan riset Anda secara presisi.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    {
                                        icon: FileText,
                                        title: 'Ekstraksi Struktur Naskah',
                                        desc: 'Memilah otomatis bagian abstrak, latar belakang, metodologi, temuan eksperimen, hingga referensi dari berkas PDF.'
                                    },
                                    {
                                        icon: BarChart3,
                                        title: 'Rubrik 5 Dimensi Ilmiah',
                                        desc: 'Scoring transparan berbasis kriteria baku Clarity, Methodology, Novelty, Soundness, dan Rigor.'
                                    },
                                    {
                                        icon: Bot,
                                        title: 'Asisten AI Kontekstual',
                                        desc: 'Chatbot riset yang memahami teks lengkap naskah Anda, menjawab pertanyaan metodologi dan data secara akurat.'
                                    },
                                    {
                                        icon: Scale,
                                        title: 'Matriks Komparasi 2 Makalah',
                                        desc: 'Perbandingan side-by-side untuk mengevaluasi pendekatan, temuan, dan celah riset antar dua naskah secara instan.'
                                    },
                                    {
                                        icon: KeyRound,
                                        title: 'Integrasi Token API Mandiri',
                                        desc: 'Gunakan Google Gemini API Key pribadi untuk kecepatan respon maksimal tanpa batasan kuota antrean.'
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: 'Laporan Peer Review & Audit Log',
                                        desc: 'Rekomendasi keputusan publikasi (Accept / Revision) lengkap dengan ringkasan eksekutif dan riwayat log aktivitas.'
                                    },
                                ].map((f, i) => (
                                    <div
                                        key={i}
                                        className="p-8 rounded-3xl bg-[#313F41]/90 border border-[#7F765C]/40 hover:border-[#CFB082]/60 hover:bg-[#38484a] hover:-translate-y-1 transition-all duration-300 group cursor-default shadow-lg shadow-[#262229]/40 hover:shadow-2xl hover:shadow-[#313F41]/60"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-[#262229] border border-[#7F765C]/50 text-[#CFB082] flex items-center justify-center mb-6 group-hover:bg-[#CFB082] group-hover:text-[#262229] group-hover:scale-110 transition-all duration-300 shadow-md">
                                            <f.icon className="size-5" />
                                        </div>
                                        <h3 className="text-base font-bold text-[#E7DEBB] mb-2 group-hover:text-white transition-colors">{f.title}</h3>
                                        <p className="text-xs text-[#E7DEBB]/75 leading-relaxed">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Workflow Section (01, 02, 03) */}
                    <section id="alur" className="scroll-mt-24 relative z-10 py-20 bg-[#211d23] border-y border-[#7F765C]/30">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-2xl mx-auto mb-16">
                                <span className="text-[11px] font-mono uppercase tracking-widest text-[#CFB082] px-3.5 py-1 rounded-full bg-[#313F41] border border-[#7F765C]/50">
                                    Alur Kerja
                                </span>
                                <h2 className="text-3xl font-bold text-[#E7DEBB] mt-4 mb-3">
                                    Tiga Langkah Cepat & Akurat
                                </h2>
                                <p className="text-sm text-[#E7DEBB]/70">
                                    Proses evaluasi naskah yang ringkas dan bebas hambatan.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    {
                                        num: '01',
                                        title: 'Unggah Berkas PDF',
                                        desc: 'Unggah naskah riset dalam format PDF. Sistem langsung mengekstrak struktur teks dan data tabel.'
                                    },
                                    {
                                        num: '02',
                                        title: 'Analisis Otomatis AI',
                                        desc: 'AI Gemini memproses 5 dimensi kualitas, memetakan kekuatan serta kelemahan makalah dalam hitungan detik.'
                                    },
                                    {
                                        num: '03',
                                        title: 'Eksplorasi & Diskusi',
                                        desc: 'Pelajari laporan ulasan, bandingkan dengan naskah lain, dan ajukan pertanyaan spesifik ke asisten riset.'
                                    }
                                ].map((step, idx) => (
                                    <div key={idx} className="p-8 rounded-3xl bg-[#313F41] border border-[#7F765C]/40 hover:border-[#CFB082]/60 transition-all duration-300 text-left relative group hover:-translate-y-1 shadow-lg">
                                        <div className="text-3xl font-mono font-bold text-[#CFB082] mb-4">
                                            {step.num}
                                        </div>
                                        <h3 className="text-base font-bold text-[#E7DEBB] mb-2">{step.title}</h3>
                                        <p className="text-xs text-[#E7DEBB]/75 leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Comparison Section */}
                    <section id="komparasi" className="scroll-mt-24 relative z-10 py-20 md:py-28">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-2xl mx-auto mb-16">
                                <span className="text-[11px] font-mono uppercase tracking-widest text-[#CFB082] px-3.5 py-1 rounded-full bg-[#313F41] border border-[#7F765C]/50">
                                    Keunggulan Disputatio
                                </span>
                                <h2 className="text-3xl font-bold text-[#E7DEBB] mt-4 mb-3">
                                    Mengapa Memilih Disputatio?
                                </h2>
                                <p className="text-sm text-[#E7DEBB]/70">
                                    Perbandingan efisiensi metode penelaahan konvensional versus platform Disputatio.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Manual */}
                                <div className="p-8 rounded-3xl bg-[#262229] border border-[#7F765C]/30 space-y-4">
                                    <div className="text-xs font-mono uppercase tracking-wider text-[#E7DEBB]/70 pb-3 border-b border-[#7F765C]/30">
                                        Metode Konvensional
                                    </div>
                                    <ul className="space-y-3 text-xs text-[#E7DEBB]/70">
                                        <li className="flex items-start gap-2.5">
                                            <X className="size-4 text-rose-400 shrink-0 mt-0.5" />
                                            <span>Proses memakan waktu 3 - 7 hari kerja.</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <X className="size-4 text-rose-400 shrink-0 mt-0.5" />
                                            <span>Penilaian rentan bias dan inkonsistensi rubrik.</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <X className="size-4 text-rose-400 shrink-0 mt-0.5" />
                                            <span>Sulit membandingkan struktur metodologi secara cepat.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Disputatio */}
                                <div className="p-8 rounded-3xl bg-[#313F41] border border-[#CFB082]/60 shadow-2xl shadow-[#262229]/80 space-y-4 hover:border-[#CFB082] transition-all">
                                    <div className="text-xs font-mono uppercase tracking-wider text-[#CFB082] pb-3 border-b border-[#7F765C]/40 flex items-center justify-between">
                                        <span>Dengan Disputatio AI</span>
                                        <CheckCircle2 className="size-4 text-emerald-400" />
                                    </div>
                                    <ul className="space-y-3 text-xs text-[#E7DEBB]">
                                        <li className="flex items-start gap-2.5">
                                            <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>Hasil ulasan mendalam selesai dalam <strong>10 - 20 detik</strong>.</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>Skor 5 dimensi ilmiah objektif dengan justifikasi data transparan.</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>Matriks komparasi berdampingan dan asisten AI interaktif.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section id="faq" className="scroll-mt-24 relative z-10 py-20 bg-[#211d23] border-y border-[#7F765C]/30">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-xl mx-auto mb-14">
                                <span className="text-[11px] font-mono uppercase tracking-widest text-[#CFB082] px-3.5 py-1 rounded-full bg-[#313F41] border border-[#7F765C]/50">
                                    Tanya & Jawab
                                </span>
                                <h2 className="text-3xl font-bold text-[#E7DEBB] mt-4 mb-3">
                                    Pertanyaan yang Sering Diajukan
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl bg-[#313F41] border border-[#7F765C]/40 overflow-hidden transition-all duration-200 hover:border-[#CFB082]/60"
                                    >
                                        <button
                                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                            className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#E7DEBB] hover:text-white cursor-pointer"
                                        >
                                            <span>{faq.q}</span>
                                            <ChevronDown
                                                className={`size-4 text-[#CFB082] shrink-0 transition-transform duration-300 ${
                                                    openFaq === index ? 'rotate-180 text-white' : ''
                                                }`}
                                            />
                                        </button>
                                        {openFaq === index && (
                                            <div className="px-6 pb-5 text-xs text-[#E7DEBB]/80 leading-relaxed border-t border-[#7F765C]/30 pt-3 animate-in fade-in duration-200">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Banner */}
                    <section className="relative z-10 py-20">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#313F41] to-[#262229] border border-[#CFB082]/40 p-10 md:p-14 text-center space-y-6 shadow-2xl shadow-[#262229]/80">
                                <div className="inline-flex p-3.5 rounded-2xl bg-[#262229] border border-[#7F765C]/50 text-[#CFB082] shadow-lg shadow-[#313F41]/30">
                                    <CircleDot className="size-6 stroke-[2.5]" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E7DEBB] tracking-tight">
                                    Mulai Telaah Makalah Anda Sekarang
                                </h2>
                                <p className="text-xs sm:text-sm text-[#E7DEBB]/80 max-w-lg mx-auto leading-relaxed">
                                    Daftarkan akun Anda dan nikmati kemudahan analisis makalah ilmiah bertenaga kecerdasan buatan dengan presisi tinggi.
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="relative group overflow-hidden inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#CFB082] to-[#E7DEBB] px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#262229] hover:from-[#E7DEBB] hover:to-[#CFB082] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#CFB082]/25"
                                    >
                                        <span>{auth.user ? 'Buka Dashboard' : 'Mulai Sekarang'}</span>
                                        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="relative z-10 border-t border-[#7F765C]/30 bg-[#211d23] py-10 text-xs text-[#E7DEBB]/70">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#CFB082] to-[#7F765C] text-[#262229] font-bold shadow-sm">
                                <CircleDot className="size-4 stroke-[2.5]" />
                            </div>
                            <span className="font-bold text-[#E7DEBB] text-sm">Disputatio</span>
                            <span className="text-[11px] text-[#CFB082]">| AI Academic Reviewer</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#E7DEBB]/80">
                            {navItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={(e) => scrollToSection(e, item.id)}
                                    className="px-2 py-1 hover:text-[#CFB082] transition-colors"
                                >
                                    {item.label}
                                </a>
                            ))}
                            <Link href={login()} className="px-2 py-1 hover:text-[#CFB082] transition-colors">Masuk</Link>
                        </div>

                        <p className="text-[11px] text-[#E7DEBB]/60">
                            &copy; {new Date().getFullYear()} Disputatio. All rights reserved.
                        </p>
                    </div>
                </footer>

            </div>
        </>
    );
}