import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { User, Shield, Settings } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const navItems = [
    {
        title: 'Profil Pengguna',
        href: edit(),
        icon: User,
    },
    {
        title: 'Keamanan Akun',
        href: editSecurity(),
        icon: Shield,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Settings className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Akun</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola profil, keamanan kata sandi, dan preferensi antarmuka sistem.
                        </p>
                    </div>
                </div>
            </div>

            {/* Horizontal Nav Tabs */}
            <div className="flex border-b border-border/80 pb-px overflow-x-auto gap-2">
                {navItems.map((item, index) => {
                    const isActive = isCurrentOrParentUrl(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={`${toUrl(item.href)}-${index}`}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="pt-2">
                <div className="bg-card text-card-foreground rounded-2xl border border-border/70 shadow-xs p-6 sm:p-8 space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
