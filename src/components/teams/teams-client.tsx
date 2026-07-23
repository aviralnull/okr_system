"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Users2, Plus, Edit, Trash2, ChevronRight,
  Search, X, Crown, MoreHorizontal, CheckCircle2,
  AlertCircle, Target,
} from "lucide-react";
import { createTeam, editTeam, deleteTeam } from "@/actions/team.actions";
import { DeptTeamModal }                    from "@/components/shared/dept-team-model";
import type { TeamListItem, TeamFormData }  from "@/actions/team.actions";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
  if (avatar) return <img src={avatar} alt={name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[9px] font-semibold flex items-center justify-center flex-shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    )}>
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

export function TeamsClient({ teams, formData }: {
  teams:    TeamListItem[];
  formData: TeamFormData;
}) {
  const [search,     setSearch]     = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamListItem | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [menuOpen,   setMenuOpen]   = useState<string | null>(null);
  const [pending,    startTransition] = useTransition();

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = useMemo(() =>
    teams.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase())
    ),
    [teams, search]
  );

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Members will be unassigned.`)) return;
    setMenuOpen(null);
    startTransition(async () => {
      const res = await deleteTeam(id);
      showToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
    });
  }

  function getEditData(team: TeamListItem) {
    return {
      name:        team.name,
      description: team.description,
      leadId:      team.leadId,
      memberIds:   team.users.map(u => u.id),
    };
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search teams..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full" />
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-muted-foreground" /></button>}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
          <Plus size={14} /> New Team
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span><span className="font-semibold text-foreground">{teams.length}</span> teams</span>
        <span><span className="font-semibold text-foreground">{teams.reduce((a, t) => a + t._count.users, 0)}</span> members</span>
        <span><span className="font-semibold text-foreground">{teams.reduce((a, t) => a + t._count.objectives, 0)}</span> OKRs</span>
        {search && <span className="text-primary">{filtered.length} matching</span>}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Users2 size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {teams.length === 0 ? "No teams yet" : "No matches"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {teams.length === 0 ? "Create your first team to group employees" : "Try a different search"}
          </p>
          {teams.length === 0 && (
            <button onClick={() => setShowCreate(true)}
              className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Create Team
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(team => {
            const lead = formData.allEmployees.find(e => e.id === team.leadId);
            return (
              <div key={team.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Users2 size={16} className="text-violet-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{team.name}</h3>
                      {team.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{team.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a href={`/teams/${team.id}`}
                      className="text-xs px-2 py-1 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1 text-muted-foreground">
                      View <ChevronRight size={10} />
                    </a>
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === team.id ? null : team.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                        <MoreHorizontal size={14} />
                      </button>
                      {menuOpen === team.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 top-8 z-20 w-32 bg-card border border-border rounded-xl shadow-lg py-1">
                            <button onClick={() => { setEditTarget(team); setMenuOpen(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                              <Edit size={12} /> Edit
                            </button>
                            <div className="border-t border-border my-1" />
                            <button onClick={() => handleDelete(team.id, team.name)} disabled={pending}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users2 size={11} /> {team._count.users} members
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target size={11} /> {team._count.objectives} OKRs
                  </div>
                </div>

                {/* Lead */}
                {lead ? (
                  <div className="flex items-center gap-2 mb-3 px-2.5 py-2 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200/40 dark:border-violet-800/20">
                    <Crown size={11} className="text-violet-500 flex-shrink-0" />
                    <Avatar name={lead.name} avatar={lead.avatar} />
                    <p className="text-xs font-medium text-foreground truncate">{lead.name}</p>
                    <span className="text-[10px] text-muted-foreground ml-auto">Lead</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-lg border border-dashed border-border">
                    <Crown size={11} className="text-muted-foreground/40 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">No lead assigned</p>
                  </div>
                )}

                {/* Members preview */}
                {team.users.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                      {team.users.slice(0, 4).map(u => <Avatar key={u.id} name={u.name} avatar={u.avatar} />)}
                    </div>
                    {team._count.users > 4 && (
                      <span className="text-xs text-muted-foreground ml-1">+{team._count.users - 4}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <DeptTeamModal
          mode="team"
          leads={formData.leads}
          employees={formData.allEmployees}
          onSubmit={async (fd) => createTeam(fd)}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <DeptTeamModal
          mode="team"
          existing={getEditData(editTarget)}
          leads={formData.leads}
          employees={formData.allEmployees}
          onSubmit={async (fd) => editTeam(editTarget.id, fd)}
          onClose={() => setEditTarget(null)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  );
}
