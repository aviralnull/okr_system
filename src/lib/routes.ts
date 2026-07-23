// lib/routes.ts
import { Role } from "@/generated/prisma/enums"

export interface NavItem {
  href:    string;
  label:   string;
  icon:    string;        // lucide icon name
  roles:   Role[];
  badge?:  string;        // optional badge text e.g. "New"
  section?: string;       // section grouping in sidebar
}

export const NAV_ITEMS: NavItem[] = [
  // ── Main ──────────────────────────────────────────────────
  { href: "/dashboard",   label: "Dashboard",   icon: "LayoutDashboard", roles: ["EMPLOYEE","MANAGER","HR","ORG_ADMIN","SUPER_ADMIN"], section: "main" },

  // ── Organization (ORG_ADMIN only) ─────────────────────────
  { href: "/employees",   label: "Employees",   icon: "Users",           roles: ["HR","ORG_ADMIN"], section: "organization" },
  { href: "/teams",       label: "Teams",       icon: "Users2",          roles: ["MANAGER","HR","ORG_ADMIN"], section: "organization" },
  { href: "/departments", label: "Departments", icon: "Building2",       roles: ["HR","ORG_ADMIN"], section: "organization" },
  { href: "/invitations", label: "Invitations", icon: "MailPlus",        roles: ["ORG_ADMIN"], section: "organization" },
    


  {
  href:  "/team",
  label: "Team Overview",
  icon:  "Users2",
  roles: ["MANAGER", "HR", "ORG_ADMIN"],
  section: "work",
},




  // ── Work ──────────────────────────────────────────────────
  { href: "/objectives",  label: "Objectives",  icon: "Target",          roles: ["EMPLOYEE","MANAGER","HR","ORG_ADMIN"], section: "work" },
  { href: "/reviews",     label: "Reviews",     icon: "ClipboardList",   roles: ["EMPLOYEE","MANAGER","HR","ORG_ADMIN"], section: "work" },
  { href: "/analytics",   label: "Analytics",   icon: "BarChart3",       roles: ["MANAGER","HR","ORG_ADMIN"], section: "work" },

  // ── Account ───────────────────────────────────────────────
  { href: "/settings",    label: "Settings",    icon: "Settings2",       roles: ["EMPLOYEE","MANAGER","HR","ORG_ADMIN","SUPER_ADMIN"], section: "account" },
];

export const SECTION_LABELS: Record<string, string> = {
  main:         "Main",
  organization: "Organization",
  work:         "Work",
  account:      "Account",
};

export function getNavForRole(role: Role) {
  return NAV_ITEMS.filter((n) => n.roles.includes(role));
}