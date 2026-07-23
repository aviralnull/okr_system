// components/layout/sidebar.tsx
"use client";

import Link      from "next/link";
import Image     from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Users2, Building2, MailPlus,
  Target, ClipboardList, BarChart3, Settings2,
  ChevronRight, LogOut, Bell, ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavForRole, SECTION_LABELS } from "@/lib/routes";
import { logout } from "@/actions/auth.actions";
import type { SafeUser } from "@/lib/auth";

// Icon map — keeps JSX clean
const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Users2, Building2, MailPlus,
  Target, ClipboardList, BarChart3, Settings2,
};

interface Props {
  user:       SafeUser;
  orgName:    string;
  orgLogo?:   string | null;
  unreadCount?: number;
}

export function Sidebar({ user, orgName, orgLogo, unreadCount = 0 }: Props) {
  const pathname = usePathname();
  const navItems = getNavForRole(user.role);

  // Group by section
  const grouped = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    const s = item.section ?? "main";
    if (!acc[s]) acc[s] = [];
    acc[s].push(item);
    return acc;
  }, {});

  return (
    <aside className="flex h-screen w-55 flex-col bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] fixed left-0 top-0 z-40">

      {/* ── Logo / Org name ──────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[hsl(var(--sidebar-border))] flex-shrink-0">
        {orgLogo ? (
          <Image src={orgLogo} alt={orgName} width={28} height={28} className="rounded-md object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-md bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {orgName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[hsl(var(--sidebar-foreground))] truncate">{orgName}</p>
          <p className="text-[10px] text-[hsl(var(--sidebar-foreground))/50] truncate">OKR Desk</p>
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {Object.entries(SECTION_LABELS).map(([sectionKey, sectionLabel]) => {
          const items = grouped[sectionKey];
          if (!items?.length) return null;

          return (
            <div key={sectionKey}>
              <p className="px-2 mb-1 text-[15px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))/35]">
                {sectionLabel}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon    = ICONS[item.icon] ?? LayoutDashboard;
                  const active  = item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[15px] font-medium transition-all group",
                        active
                          ? "bg-[hsl(var(--sidebar-accent))]/15 text-[hsl(var(--sidebar-accent))] shadow-sm"
                          : "text-[hsl(var(--sidebar-foreground))/70] hover:bg-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-foreground))]"
                      )}
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {active && <ChevronRight size={12} className="opacity-60" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── User footer ─────────────────────────────────── */}
      <div className="border-t border-[hsl(var(--sidebar-border))] p-2 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[hsl(var(--sidebar-muted))] transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[hsl(var(--sidebar-accent))]/20 flex items-center justify-center text-[hsl(var(--sidebar-accent))] text-xs font-semibold flex-shrink-0">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[hsl(var(--sidebar-foreground))] truncate">{user.name}</p>
            <p className="text-[10px] text-[hsl(var(--sidebar-foreground))/45] truncate">{user.role.replace("_", " ")}</p>
          </div>
          <ChevronsUpDown size={13} className="text-[hsl(var(--sidebar-foreground))/40] flex-shrink-0" />
        </div>

        <form action={logout} className="mt-1">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}