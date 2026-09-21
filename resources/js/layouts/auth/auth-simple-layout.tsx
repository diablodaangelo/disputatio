import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-[#262229] text-[#E7DEBB] flex flex-col items-center justify-center p-6 selection:bg-[#CFB082] selection:text-[#262229] relative overflow-hidden">
            {/* Ambient #313F41 and #CFB082 Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#313F41]/30 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#CFB082]/10 rounded-full blur-[140px] pointer-events-none" />
            
            <div className="w-full max-w-[400px] space-y-6 relative z-10">
                {/* Header with Logo */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <Link
                        href={home()}
                        className="inline-block hover:opacity-80 transition-opacity"
                    >
                        <AppLogo />
                    </Link>

                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight text-[#E7DEBB]">{title}</h1>
                        {description && (
                            <p className="text-xs text-[#E7DEBB]/70">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Clean #313F41 Card Body */}
                <div className="rounded-3xl border border-[#7F765C]/40 bg-[#313F41]/95 backdrop-blur-xl p-6 sm:p-7 shadow-2xl shadow-[#262229]/60">
                    {children}
                </div>
            </div>
        </div>
    );
}
