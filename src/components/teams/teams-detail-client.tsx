"use client";

import { useState, useTransition } from "react";
import {
  Users2, Crown, Target, ChevronLeft, Edit,
  Trash2, AlertCircle, CheckCircle2, X,
  MoreHorizontal, Calendar, Building2,
} from "lucide-react";
import { editTeam, deleteTeam } from "@/actions/team.actions";
import { DeptTeamModal }        from "@/components/shared/dept-team-model";
import { useRouter }            from "next/navigation";
import type { TeamDetail, TeamFormData } from "@/actions/team.actions";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar, size = "md" }: {
  name: string; avatar?: string | null; size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-xs";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  ON_TRACK: "#10b981", AT_RISK: "#f59e0b",
  BEHIND: "#ef4444", COMPLETED: "#6366f1", NOT_STARTED: "#94a3b8",
};
const STATUS_LABEL: Record<string, string> = {
  ON_TRACK: "On Track", AT_RISK: "At Risk",
  BEHIND: "Behind", COMPLETED: "Completed", NOT_STARTED: "Not Started",
};
const ROLE_COLOR: Record<string, { color: string; bg: string }> = {
  ORG_ADMIN: { color: "#6366f1", bg: "#6366f115" },
  MANAGER:   { color: "#3b82f6", bg: "#3b82f615" },
  HR:        { color: "#8b5cf6", bg: "#8b5cf615" },
  EMPLOYEE:  { color: "#10b981", bg: "#10b98115" },
};

export function TeamDetailClient({
  team, formData,
}: {
  team:     NonNullable<TeamDetail>;
  formData: TeamFormData;
}) {
  const router = useRouter();
  const [showEdit, setShowEdit]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [pending, startTransition] = useTransition();

  const lead = formData.allEmployees.find(e => e.id === team.leadId);
  const activeMembers = team.users.filter(u => u.isActive);

  function showToastMsg(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleDelete() {
    if (!confirm(`Delete "${team.name}"? Members will be unassigned.`)) return;
    setMenuOpen(false);
    startTransition(async () => {
      const res = await deleteTeam(team.id);
      if (res.success) router.push("/teams");
      else showToastMsg(res.error, "error");
    });
  }

  const editExisting = {
    name:        team.name,
    description: team.description,
    leadId:      team.leadId,
    memberIds:   team.users.map(u => u.id),
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Back */}
        <a href="/teams" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={13} /> Back to teams
        </a>

        {/* Header */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <Users2 size={22} className="text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground">{team.name}</h1>
                {team.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{team.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Created {new Date(team.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                <Edit size={13} /> Edit
              </button>
              <div className="relative">
                <button onClick={() => setMenuOpen(v => !v)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors text-muted-foreground">
                  <MoreHorizontal size={15} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-9 z-20 w-32 bg-card border border-border rounded-xl shadow-lg py-1">
                      <button onClick={handleDelete} disabled={pending}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Members",    value: team.users.length,      icon: Users2,  color: "#6366f1" },
              { label: "Active",     value: activeMembers.length,   icon: CheckCircle2, color: "#10b981" },
              { label: "OKRs",       value: team.objectives.length, icon: Target,  color: "#f59e0b" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-lg bg-muted/40 p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Lead */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Crown size={14} className="text-violet-500" /> Team Lead
          </p>
          {lead ? (
            <div className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-200/40 dark:border-violet-800/20">
              <Avatar name={lead.name} avatar={lead.avatar} size="lg" />
              <div>
                <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                {"email" in lead && <p className="text-xs text-muted-foreground">{(lead as any).email}</p>}
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background: ROLE_COLOR[lead.role]?.bg ?? "#6366f115", color: ROLE_COLOR[lead.role]?.color ?? "#6366f1" }}>
                  {lead.role.replace("_", " ")}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-border rounded-xl">
              <Crown size={24} className="text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No lead assigned</p>
              <button onClick={() => setShowEdit(true)} className="mt-2 text-xs text-primary hover:underline">
                Assign a lead →
              </button>
            </div>
          )}
        </div>

        {/* Members */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users2 size={14} className="text-primary" /> Members ({team.users.length})
            </p>
            <a href="/employees" className="text-xs text-primary hover:underline">
              Manage in Employees →
            </a>
          </div>
          {team.users.length === 0 ? (
            <div className="text-center py-12">
              <Users2 size={28} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No members yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {team.users.map(member => {
                const rc = ROLE_COLOR[member.role] ?? ROLE_COLOR.EMPLOYEE;
                return (
                  <div key={member.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    <Avatar name={member.name} avatar={member.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                        {member.id === team.leadId && <Crown size={11} className="text-violet-500 flex-shrink-0" />}
                        {!member.isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Inactive</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                        {member.designation && ` · ${member.designation}`}
                        {member.department && ` · ${member.department.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full hidden sm:block"
                        style={{ background: rc.bg, color: rc.color }}>
                        {member.role.replace("_", " ")}
                      </span>
                      <div className="text-right hidden md:block">
                        <p className="text-xs font-medium">{member._count.objectives} OKRs</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(member.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team OKRs */}
        {team.objectives.length > 0 && (
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target size={14} className="text-primary" /> Team Objectives
              </p>
              <a href="/objectives" className="text-xs text-primary hover:underline">View all →</a>
            </div>
            <div className="divide-y divide-border">
              {team.objectives.map(obj => (
                <a key={obj.id} href={`/objectives/${obj.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{obj.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Avatar name={obj.owner.name} avatar={obj.owner.avatar} size="sm" />
                      <p className="text-xs text-muted-foreground">{obj.owner.name} · {obj.quarter}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-16 hidden sm:block">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${obj.progress}%`, background: STATUS_COLOR[obj.status] }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{Math.round(obj.progress)}%</p>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
                      {STATUS_LABEL[obj.status]}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {showEdit && (
        <DeptTeamModal
          mode="team"
          existing={editExisting}
          leads={formData.leads}
          employees={formData.allEmployees}
          onSubmit={async (fd) => editTeam(team.id, fd)}
          onClose={() => setShowEdit(false)}
        />
      )}

      {toast && (
        <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        )}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}

