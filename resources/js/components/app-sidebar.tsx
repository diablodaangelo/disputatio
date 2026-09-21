import { Link, usePage } from '@inertiajs/react';
import { 
    Activity, 
    FileText, 
    GitCompare, 
    LayoutGrid, 
    ShieldCheck, 
    Users 
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { isCurrentUrl } = useCurrentUrl();
    const page = usePage();
    const auth = (page.props as any)?.auth;
    const userRoles: string[] = auth?.user?.roles?.map((r: any) => r.name) || [];
    const isAdmin = userRoles.includes('admin');
    const isReviewer = userRoles.includes('reviewer');

    const workspaceNav: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: isAdmin ? 'Manajemen Makalah' : (isReviewer ? 'Tinjauan Makalah (Reviewer)' : 'Makalah Riset Saya'),
            href: '/papers',
            icon: FileText,
        },
        {
            title: 'Komparasi Makalah',
            href: '/compare',
            icon: GitCompare,
        },
    ];

    const adminNav: NavItem[] = [
        {
            title: 'Monitor Job AI',
            href: '/admin/ai-jobs',
            icon: Activity,
        },
        {
            title: 'Log Audit',
            href: '/admin/audit-logs',
            icon: ShieldCheck,
        },
        {
            title: 'Manajemen Pengguna',
            href: '/admin/users',
            icon: Users,
        },
    ];

    return (
        <Sidebar 
            collapsible="none" 
            variant="sidebar" 
            className="sticky top-0 h-svh shrink-0 border-r border-sidebar-border/50 flex flex-col justify-between"
        >
            <SidebarHeader className="border-b border-sidebar-border/50 pb-3 shrink-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="flex-1 overflow-y-auto space-y-4 pt-2">
                {/* Workspace Group */}
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Ruang Kerja
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {workspaceNav.map((item) => {
                            const active = isCurrentUrl(item.href);
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={active ? 'bg-[#313F41] text-[#CFB082] border border-[#7F765C]/50 font-semibold shadow-xs' : 'text-[#E7DEBB]/80 hover:text-[#E7DEBB] hover:bg-[#313F41]/60 transition-colors'}
                                    >
                                        <Link href={item.href} prefetch>
                                             {item.icon && <item.icon className={`size-4 ${active ? 'text-[#CFB082]' : 'text-[#7F765C]'}`} />}
                                             <span className="font-medium">{item.title}</span>
                                         </Link>
                                     </SidebarMenuButton>
                                 </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>

                {/* Admin Group - only shown to admin users */}
                {isAdmin && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center justify-between">
                            <span>Konsol Admin</span>
                            <span className="bg-[#313F41] text-[#CFB082] border border-[#7F765C]/40 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                                ROOT
                            </span>
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {adminNav.map((item) => {
                                const active = isCurrentUrl(item.href);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={{ children: item.title }}
                                            className={active ? 'bg-[#313F41] text-[#CFB082] border border-[#7F765C]/50 font-semibold shadow-xs' : 'text-[#E7DEBB]/80 hover:text-[#E7DEBB] hover:bg-[#313F41]/60 transition-colors'}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon className={`size-4 ${active ? 'text-[#CFB082]' : 'text-[#7F765C]'}`} />}
                                                <span className="font-medium">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 pt-2 shrink-0 mt-auto">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
