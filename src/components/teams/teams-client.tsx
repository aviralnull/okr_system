
// "use client";

// import { useState, useTransition, useMemo } from "react";
// import {
//   Users2, Plus, Edit, Trash2, ChevronRight,
//   Search, X, Crown, MoreHorizontal, CheckCircle2,
//   AlertCircle, Target, Building2,
// } from "lucide-react";
// import { createTeam, editTeam, deleteTeam } from "@/actions/team.actions";
// import { DeptTeamModal }                    from "@/components/shared/dept-team-model";
// import type { TeamListItem, TeamFormData }  from "@/actions/team.actions";

// function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
//   if (avatar) return <img src={avatar} alt={name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />;
//   return (
//     <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[9px] font-semibold flex items-center justify-center flex-shrink-0">
//       {name.slice(0, 2).toUpperCase()}
//     </div>
//   );
// }

// function Toast({ message, type }: { message: string; type: "success" | "error" }) {
//   return (
//     <div className={cn(
//       "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
//       type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
//     )}>
//       {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
//       {message}
//     </div>
//   );
// }

// // ── Multi-team selector (exported — used in employees edit modal) ──
// export function MultiTeamSelector({
//   teams, selectedIds, onChange,
// }: {
//   teams:       { id: string; name: string; department?: { name: string } | null }[];
//   selectedIds: string[];
//   onChange:    (ids: string[]) => void;
// }) {
//   function toggle(id: string) {
//     onChange(selectedIds.includes(id)
//       ? selectedIds.filter(i => i !== id)
//       : [...selectedIds, id]
//     );
//   }
//   return (
//     <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
//       {teams.length === 0 && (
//         <p className="text-xs text-muted-foreground text-center py-4">No teams available</p>
//       )}
//       {teams.map(t => (
//         <label key={t.id}
//           className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
//           <input
//             type="checkbox"
//             checked={selectedIds.includes(t.id)}
//             onChange={() => toggle(t.id)}
//             className="w-4 h-4 rounded accent-primary flex-shrink-0"
//           />
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium text-foreground">{t.name}</p>
//             {t.department && (
//               <p className="text-[10px] text-muted-foreground">{t.department.name}</p>
//             )}
//           </div>
//           {selectedIds[0] === t.id && (
//             <span className="text-[10px] text-primary font-medium flex-shrink-0">Primary</span>
//           )}
//         </label>
//       ))}
//     </div>
//   );
// }

// // ── Multi-dept selector (exported — used in employees edit modal) ──
// export function MultiDeptSelector({
//   departments, selectedIds, onChange,
// }: {
//   departments: { id: string; name: string }[];
//   selectedIds: string[];
//   onChange:    (ids: string[]) => void;
// }) {
//   function toggle(id: string) {
//     onChange(selectedIds.includes(id)
//       ? selectedIds.filter(i => i !== id)
//       : [...selectedIds, id]
//     );
//   }
//   return (
//     <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
//       {departments.length === 0 && (
//         <p className="text-xs text-muted-foreground text-center py-4">No departments available</p>
//       )}
//       {departments.map(d => (
//         <label key={d.id}
//           className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
//           <input
//             type="checkbox"
//             checked={selectedIds.includes(d.id)}
//             onChange={() => toggle(d.id)}
//             className="w-4 h-4 rounded accent-primary flex-shrink-0"
//           />
//           <p className="text-sm font-medium text-foreground flex-1">{d.name}</p>
//           {selectedIds[0] === d.id && (
//             <span className="text-[10px] text-primary font-medium flex-shrink-0">Primary</span>
//           )}
//         </label>
//       ))}
//     </div>
//   );
// }

// // ── Main TeamsClient ──────────────────────────────────────────
// export function TeamsClient({
//   teams,
//   formData,
//   departments = [],   // ← NEW: for dept filter
//   isOrgAdmin  = true, // ← NEW: manager sees restricted view
// }: {
//   teams:        TeamListItem[];
//   formData:     TeamFormData;
//   departments?: { id: string; name: string }[];
//   isOrgAdmin?:  boolean;
// }) {
//   const [search,     setSearch]     = useState("");
//   const [deptFilter, setDeptFilter] = useState("ALL"); // ← NEW
//   const [showCreate, setShowCreate] = useState(false);
//   const [editTarget, setEditTarget] = useState<TeamListItem | null>(null);
//   const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);
//   const [menuOpen,   setMenuOpen]   = useState<string | null>(null);
//   const [pending, startTransition]  = useTransition();

//   function showToast(msg: string, type: "success" | "error") {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   }

//   const filtered = useMemo(() =>
//     teams.filter(t => {
//       const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
//         (t.description ?? "").toLowerCase().includes(search.toLowerCase());
//       // ← NEW: dept filter
//       const matchDept = deptFilter === "ALL" || (t as any).departmentId === deptFilter;
//       return matchSearch && matchDept;
//     }),
//     [teams, search, deptFilter]
//   );

//   function handleDelete(id: string, name: string) {
//     if (!confirm(`Delete "${name}"? Members will be unassigned.`)) return;
//     setMenuOpen(null);
//     startTransition(async () => {
//       const res = await deleteTeam(id);
//       showToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
//     });
//   }

//   function getEditData(team: TeamListItem) {
//     return {
//       name:        team.name,
//       description: team.description,
//       leadId:      team.leadId,
//       memberIds:   team.users.map(u => u.id),
//     };
//   }

//   return (
//     <>
//       {/* Toolbar */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center">
//         <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
//           <Search size={14} className="text-muted-foreground flex-shrink-0" />
//           <input value={search} onChange={e => setSearch(e.target.value)}
//             placeholder="Search teams..."
//             className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full" />
//           {search && <button onClick={() => setSearch("")}><X size={13} className="text-muted-foreground" /></button>}
//         </div>
//         {isOrgAdmin && (
//           <button onClick={() => setShowCreate(true)}
//             className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
//             <Plus size={14} /> New Team
//           </button>
//         )}
//       </div>

//       {/* ← NEW: Department filter pills — org admin only */}
//       {isOrgAdmin && departments.length > 0 && (
//         <div className="flex items-center gap-2 flex-wrap">
//           <span className="text-xs text-muted-foreground flex items-center gap-1">
//             <Building2 size={11} /> Filter by dept:
//           </span>
//           <div className="flex gap-1.5 flex-wrap">
//             <button
//               onClick={() => setDeptFilter("ALL")}
//               className={cn(
//                 "text-xs px-3 py-1.5 rounded-full border transition-colors",
//                 deptFilter === "ALL"
//                   ? "bg-primary text-primary-foreground border-primary"
//                   : "bg-card border-border text-muted-foreground hover:bg-muted"
//               )}>
//               All departments
//             </button>
//             {departments.map(d => (
//               <button key={d.id}
//                 onClick={() => setDeptFilter(d.id)}
//                 className={cn(
//                   "text-xs px-3 py-1.5 rounded-full border transition-colors",
//                   deptFilter === d.id
//                     ? "bg-primary text-primary-foreground border-primary"
//                     : "bg-card border-border text-muted-foreground hover:bg-muted"
//                 )}>
//                 {d.name}
//               </button>
//             ))}
//           </div>
//           {deptFilter !== "ALL" && (
//             <button onClick={() => setDeptFilter("ALL")}
//               className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
//               <X size={11} /> Clear
//             </button>
//           )}
//         </div>
//       )}

//       {/* Stats */}
//       <div className="flex items-center gap-4 text-xs text-muted-foreground">
//         <span><span className="font-semibold text-foreground">{filtered.length}</span> teams</span>
//         <span><span className="font-semibold text-foreground">{filtered.reduce((a, t) => a + t._count.users, 0)}</span> members</span>
//         <span><span className="font-semibold text-foreground">{filtered.reduce((a, t) => a + t._count.objectives, 0)}</span> OKRs</span>
//         {(search || deptFilter !== "ALL") && filtered.length !== teams.length && (
//           <span className="text-primary">{filtered.length} of {teams.length} shown</span>
//         )}
//       </div>

//       {/* Grid */}
//       {filtered.length === 0 ? (
//         <div className="text-center py-16 bg-card border border-border rounded-xl">
//           <Users2 size={36} className="text-muted-foreground mx-auto mb-3" />
//           <p className="text-sm font-medium text-foreground">
//             {teams.length === 0 ? "No teams yet" : "No teams match your filters"}
//           </p>
//           <p className="text-xs text-muted-foreground mt-1">
//             {teams.length === 0
//               ? "Create your first team to group employees"
//               : "Try a different search or department filter"}
//           </p>
//           {teams.length === 0 && isOrgAdmin && (
//             <button onClick={() => setShowCreate(true)}
//               className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
//               Create Team
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map(team => {
//             const lead = formData.allEmployees.find(e => e.id === team.leadId);
//             const teamDept = departments.find(d => d.id === (team as any).departmentId);
//             return (
//               <div key={team.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
//                 <div className="flex items-start justify-between gap-2 mb-3">
//                   <div className="flex items-start gap-3 flex-1 min-w-0">
//                     <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
//                       <Users2 size={16} className="text-violet-500" />
//                     </div>
//                     <div className="min-w-0">
//                       <h3 className="text-sm font-semibold text-foreground truncate">{team.name}</h3>
//                       {/* ← NEW: show dept badge */}
//                       {teamDept && (
//                         <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
//                           <Building2 size={9} /> {teamDept.name}
//                         </span>
//                       )}
//                       {team.description && (
//                         <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{team.description}</p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-1 flex-shrink-0">
//                     <a href={`/teams/${team.id}`}
//                       className="text-xs px-2 py-1 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1 text-muted-foreground">
//                       View <ChevronRight size={10} />
//                     </a>
//                     {isOrgAdmin && (
//                       <div className="relative">
//                         <button onClick={() => setMenuOpen(menuOpen === team.id ? null : team.id)}
//                           className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
//                           <MoreHorizontal size={14} />
//                         </button>
//                         {menuOpen === team.id && (
//                           <>
//                             <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
//                             <div className="absolute right-0 top-8 z-20 w-32 bg-card border border-border rounded-xl shadow-lg py-1">
//                               <button onClick={() => { setEditTarget(team); setMenuOpen(null); }}
//                                 className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
//                                 <Edit size={12} /> Edit
//                               </button>
//                               <div className="border-t border-border my-1" />
//                               <button onClick={() => handleDelete(team.id, team.name)} disabled={pending}
//                                 className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
//                                 <Trash2 size={12} /> Delete
//                               </button>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                     <Users2 size={11} /> {team._count.users} members
//                   </div>
//                   <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                     <Target size={11} /> {team._count.objectives} OKRs
//                   </div>
//                 </div>

//                 {lead ? (
//                   <div className="flex items-center gap-2 mb-3 px-2.5 py-2 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200/40 dark:border-violet-800/20">
//                     <Crown size={11} className="text-violet-500 flex-shrink-0" />
//                     <Avatar name={lead.name} avatar={lead.avatar} />
//                     <p className="text-xs font-medium text-foreground truncate">{lead.name}</p>
//                     <span className="text-[10px] text-muted-foreground ml-auto">Lead</span>
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-lg border border-dashed border-border">
//                     <Crown size={11} className="text-muted-foreground/40 flex-shrink-0" />
//                     <p className="text-xs text-muted-foreground">No lead assigned</p>
//                   </div>
//                 )}

//                 {team.users.length > 0 && (
//                   <div className="flex items-center gap-1.5">
//                     <div className="flex -space-x-2">
//                       {team.users.slice(0, 4).map(u => (
//                         <Avatar key={u.id} name={u.name} avatar={u.avatar} />
//                       ))}
//                     </div>
//                     {team._count.users > 4 && (
//                       <span className="text-xs text-muted-foreground ml-1">+{team._count.users - 4}</span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {showCreate && (
//         <DeptTeamModal
//           mode="team"
//           leads={formData.leads}
//           employees={formData.allEmployees}
//           onSubmit={async (fd) => createTeam(fd)}
//           onClose={() => setShowCreate(false)}
//         />
//       )}
//       {editTarget && (
//         <DeptTeamModal
//           mode="team"
//           existing={getEditData(editTarget)}
//           leads={formData.leads}
//           employees={formData.allEmployees}
//           onSubmit={async (fd) => editTeam(editTarget.id, fd)}
//           onClose={() => setEditTarget(null)}
//         />
//       )}

//       {toast && <Toast message={toast.msg} type={toast.type} />}
//     </>
//   );
// }





// src/components/teams/teams-client.tsx
"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Users2, Plus, Edit, Trash2, ChevronRight,
  Search, X, Crown, MoreHorizontal, CheckCircle2,
  AlertCircle, Target, Building2,
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
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    )}>
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

// ── Multi-team selector (exported — used in employees edit modal) ──
// export function TeamSelector({
//   teams,
//   selectedId,
//   onChange,
// }: {
//   teams: { id: string; name: string; department?: { name: string } | null }[];
//   selectedId: string;
//   onChange: (id: string) => void;
// }) {
//   return (
//     <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
//       {teams.length === 0 && (
//         <p className="text-xs text-muted-foreground text-center py-4">No teams available</p>
//       )}
//       {teams.map(t => (
//         <label key={t.id}
//           className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
//           <input
//             type="checkbox"
//             checked={selectedIds.includes(t.id)}
//             onChange={() => toggle(t.id)}
//             className="w-4 h-4 rounded accent-primary flex-shrink-0"
//           />
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium text-foreground">{t.name}</p>
//             {t.department && (
//               <p className="text-[10px] text-muted-foreground">{t.department.name}</p>
//             )}
//           </div>
//           {selectedIds[0] === t.id && (
//             <span className="text-[10px] text-primary font-medium flex-shrink-0">Primary</span>
//           )}
//         </label>
//       ))}
//     </div>
//   );
// }


export function TeamSelector({
  teams,
  selectedId,
  onChange,
}: {
  teams: {
    id: string;
    name: string;
    department?: {
      name: string;
    } | null;
  }[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {teams.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No teams available
        </div>
      ) : (
        teams.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`w-full flex items-center justify-between rounded-xl border p-3 transition-all text-left ${
              selectedId === t.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
            }`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{t.name}</div>

              {t.department && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t.department.name}
                </div>
              )}
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedId === t.id
                  ? "border-primary"
                  : "border-muted-foreground/40"
              }`}
            >
              {selectedId === t.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
          </button>
        ))
      )}
    </div>
  );
}
// ── Multi-dept selector (exported — used in employees edit modal) ──
// export function MultiDeptSelector({
//   departments, selectedIds, onChange,
// }: {
//   departments: { id: string; name: string }[];
//   selectedIds: string[];
//   onChange:    (ids: string[]) => void;
// }) {
//   function toggle(id: string) {
//     onChange(selectedIds.includes(id)
//       ? selectedIds.filter(i => i !== id)
//       : [...selectedIds, id]
//     );
//   }
//   return (
//     <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
//       {departments.length === 0 && (
//         <p className="text-xs text-muted-foreground text-center py-4">No departments available</p>
//       )}
//       {departments.map(d => (
//         <label key={d.id}
//           className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
//           <input
//             type="checkbox"
//             checked={selectedIds.includes(d.id)}
//             onChange={() => toggle(d.id)}
//             className="w-4 h-4 rounded accent-primary flex-shrink-0"
//           />
//           <p className="text-sm font-medium text-foreground flex-1">{d.name}</p>
//           {selectedIds[0] === d.id && (
//             <span className="text-[10px] text-primary font-medium flex-shrink-0">Primary</span>
//           )}
//         </label>
//       ))}
//     </div>
//   );
// }

export function DeptSelector({
  departments,
  selectedId,
  onChange,
}: {
  departments: {
    id: string;
    name: string;
  }[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {departments.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No departments available
        </div>
      ) : (
        departments.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onChange(d.id)}
            className={`w-full flex items-center justify-between rounded-xl border p-3 transition-all text-left ${
              selectedId === d.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
            }`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{d.name}</div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedId === d.id
                  ? "border-primary"
                  : "border-muted-foreground/40"
              }`}
            >
              {selectedId === d.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
          </button>
        ))
      )}
    </div>
  );
}

// ── Main TeamsClient ──────────────────────────────────────────
export function TeamsClient({
  teams,
  formData,
  departments = [],   // ← NEW: for dept filter
  isOrgAdmin  = true, // ← NEW: manager sees restricted view
}: {
  teams:        TeamListItem[];
  formData:     TeamFormData;
  departments?: { id: string; name: string }[];
  isOrgAdmin?:  boolean;
}) {
  const [search,     setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL"); // ← NEW
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamListItem | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [menuOpen,   setMenuOpen]   = useState<string | null>(null);
  const [pending, startTransition]  = useTransition();

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = useMemo(() =>
    teams.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.description ?? "").toLowerCase().includes(search.toLowerCase());
      // ← NEW: dept filter
    const matchDept =
  deptFilter === "ALL" ||
  t.departmentId === deptFilter;
      return matchSearch && matchDept;
    }),
    [teams, search, deptFilter]
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
        {isOrgAdmin && (
          <button onClick={() => setShowCreate(true)}
            className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
            <Plus size={14} /> New Team
          </button>
        )}
      </div>

      {/* ← NEW: Department filter pills — org admin only */}
      {isOrgAdmin && departments.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Building2 size={11} /> Filter by dept:
          </span>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setDeptFilter("ALL")}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors",
                deptFilter === "ALL"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              )}>
              All departments
            </button>
            {departments.map(d => (
              <button key={d.id}
                onClick={() => setDeptFilter(d.id)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-colors",
                  deptFilter === d.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:bg-muted"
                )}>
                {d.name}
              </button>
            ))}
          </div>
          {deptFilter !== "ALL" && (
            <button onClick={() => setDeptFilter("ALL")}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span><span className="font-semibold text-foreground">{filtered.length}</span> teams</span>
        <span><span className="font-semibold text-foreground">{filtered.reduce((a, t) => a + t._count.users, 0)}</span> members</span>
        <span><span className="font-semibold text-foreground">{filtered.reduce((a, t) => a + t._count.objectives, 0)}</span> OKRs</span>
        {(search || deptFilter !== "ALL") && filtered.length !== teams.length && (
          <span className="text-primary">{filtered.length} of {teams.length} shown</span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Users2 size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {teams.length === 0 ? "No teams yet" : "No teams match your filters"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {teams.length === 0
              ? "Create your first team to group employees"
              : "Try a different search or department filter"}
          </p>
          {teams.length === 0 && isOrgAdmin && (
            <button onClick={() => setShowCreate(true)}
              className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Create Team
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(team => {
            // const lead = formData.allEmployees.find(e => e.id === team.leadId);
            const lead = team.users.find(
  (u) => u.id === team.leadId
);
            const teamDept = departments.find(d => d.id === (team as any).departmentId);
            return (
              <div key={team.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Users2 size={16} className="text-violet-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{team.name}</h3>
                      {/* ← NEW: show dept badge */}
                      {teamDept && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 size={9} /> {teamDept.name}
                        </span>
                      )}
                      {team.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{team.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a href={`/teams/${team.id}`}
                      className="text-xs px-2 py-1 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1 text-muted-foreground">
                      View <ChevronRight size={10} />
                    </a>
                    {isOrgAdmin && (
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
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users2 size={11} /> {team._count.users} members
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target size={11} /> {team._count.objectives} OKRs
                  </div>
                </div>

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

                {team.users.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                      {team.users.slice(0, 4).map(u => (
                        <Avatar key={u.id} name={u.name} avatar={u.avatar} />
                      ))}
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

      {showCreate && (
        <DeptTeamModal
          mode="team"
          leads={formData.leads}
          employees={formData.allEmployees}
           departments={departments}
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
           departments={departments}
          onSubmit={async (fd) => editTeam(editTarget.id, fd)}
          onClose={() => setEditTarget(null)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  );
}