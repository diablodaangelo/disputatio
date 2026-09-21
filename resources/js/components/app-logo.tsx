import { CircleDot } from 'lucide-react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#CFB082] to-[#313F41] text-[#262229] shadow-md shadow-[#313F41]/30">
                <CircleDot className="size-4 stroke-[2.5]" />
            </div>
            <div className="grid flex-1 text-left leading-tight">
                <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                    Disputatio
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.2 rounded-full bg-[#313F41] text-[#CFB082] border border-[#7F765C]/40">
                        AI
                    </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                    Analisis Riset Ilmiah
                </span>
            </div>
        </div>
    );
}
