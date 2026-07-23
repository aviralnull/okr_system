// "use client";

// import { useState, useTransition, useMemo } from "react";
// import {
//   Building2, Plus, Edit, Trash2, Users2,
//   X, Search, Crown, ChevronRight, MoreHorizontal,
//   AlertCircle, CheckCircle2,
// } from "lucide-react";
// import {
//   createDepartment, editDepartment,
//   deleteDepartment, assignDepartmentHead,
// } from "@/actions/department.actions";
// import type { DepartmentListItem } from "@/actions/department.actions";

// type Manager = { id: string; name: string; role: string; avatar?: string | null };

// function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// function Avatar({ name, avatar, size = "md" }: {
//   name: string; avatar?: string | null; size?: "sm" | "md";
// }) {
//   const dim = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-xs";
//   if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
//   return (
//     <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
//       {name.slice(0, 2).toUpperCase()}
//     </div>
//   );
// }

// // ── Toast ──────────────────────────────────────────────────────
// function Toast({ message, type }: { message: string; type: "success" | "error" }) {
//   return (
//     <div className={cn(
//       "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2",
//       type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
//     )}>
//       {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
//       {message}
//     </div>
//   );
// }

// // ── Dept Modal (Create / Edit) ────────────────────────────────
// function DeptModal({
//   dept, managers, onClose,
// }: {
//   dept?: DepartmentListItem | null;
//   managers: Manager[];
//   onClose: () => void;
// }) {
//   const isEdit = !!dept;
//   const [name,   setName]   = useState(dept?.name ?? "");
//   const [headId, setHeadId] = useState(dept?.headId ?? "");
//   const [error,  setError]  = useState("");
//   const [pending, startTransition] = useTransition();

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!name.trim()) return setError("Name is required");
//     setError("");

//     const fd = new FormData();
//     fd.set("name",   name.trim());
//     fd.set("headId", headId);

//     startTransition(async () => {
//       const res = isEdit
//         ? await editDepartment(dept!.id, fd)
//         : await createDepartment(fd);

//       if (res.success) onClose();
//       else setError(res.error);
//     });
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md">
//         <div className="flex items-center justify-between p-5 border-b border-border">
//           <div>
//             <h2 className="text-base font-semibold text-foreground">
//               {isEdit ? "Edit Department" : "New Department"}
//             </h2>
//             <p className="text-xs text-muted-foreground mt-0.5">
//               {isEdit ? "Update department details" : "Create a new department in your org"}
//             </p>
//           </div>
//           <button onClick={onClose} className="text-muted-foreground hover:text-foreground w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
//             <X size={16} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-5 space-y-4">
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">
//               Department name *
//             </label>
//             <input
//               value={name}
//               onChange={e => setName(e.target.value)}
//               placeholder="e.g. Engineering, Sales, Marketing"
//               autoFocus
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//             />
//           </div>

//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">
//               Department head <span className="text-muted-foreground/60">(optional)</span>
//             </label>
//             <select
//               value={headId}
//               onChange={e => setHeadId(e.target.value)}
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//             >
//               <option value="">No head assigned</option>
//               {managers.map(m => (
//                 <option key={m.id} value={m.id}>
//                   {m.name} — {m.role.replace("_", " ")}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {error && (
//             <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
//               <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
//             </div>
//           )}

//           <div className="flex gap-2 pt-1">
//             <button type="button" onClick={onClose}
//               className="flex-1 text-sm py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
//               Cancel
//             </button>
//             <button type="submit" disabled={pending}
//               className="flex-1 text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
//               {pending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save changes" : "Create department")}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // ── Dept Card ─────────────────────────────────────────────────
// function DeptCard({
//   dept, managers,
//   onEdit, onToast,
// }: {
//   dept:     DepartmentListItem;
//   managers: Manager[];
//   onEdit:   (d: DepartmentListItem) => void;
//   onToast:  (msg: string, type: "success" | "error") => void;
// }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [pending, startTransition] = useTransition();

//   const head = managers.find(m => m.id === dept.headId);

//   function handleDelete() {
//     if (!confirm(`Delete "${dept.name}"? Members will be unassigned.`)) return;
//     setMenuOpen(false);
//     startTransition(async () => {
//       const res = await deleteDepartment(dept.id);
//       onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
//     });
//   }

//   return (
//     <div className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
//       <div className="flex items-start justify-between gap-3 mb-4">
//         <div className="flex items-start gap-3 flex-1 min-w-0">
//           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
//             <Building2 size={17} className="text-primary" />
//           </div>
//           <div className="flex-1 min-w-0">
//             <h3 className="text-sm font-semibold text-foreground">{dept.name}</h3>
//             <p className="text-xs text-muted-foreground mt-0.5">
//               {dept._count.users} {dept._count.users === 1 ? "member" : "members"}
//             </p>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex items-center gap-1 flex-shrink-0">
//           <a href={`/departments/${dept.id}`}
//             className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1 text-muted-foreground hover:text-foreground">
//             View <ChevronRight size={11} />
//           </a>
//           <div className="relative">
//             <button onClick={() => setMenuOpen(v => !v)}
//               className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
//               <MoreHorizontal size={15} />
//             </button>
//             {menuOpen && (
//               <>
//                 <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
//                 <div className="absolute right-0 top-9 z-20 w-36 bg-card border border-border rounded-xl shadow-lg py-1">
//                   <button onClick={() => { onEdit(dept); setMenuOpen(false); }}
//                     className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
//                     <Edit size={13} /> Edit
//                   </button>
//                   <div className="border-t border-border my-1" />
//                   <button onClick={handleDelete} disabled={pending}
//                     className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
//                     <Trash2 size={13} /> Delete
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Head */}
//       {head ? (
//         <div className="flex items-center gap-2 mb-3 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
//           <Crown size={12} className="text-amber-500 flex-shrink-0" />
//           <Avatar name={head.name} avatar={head.avatar} size="sm" />
//           <div className="flex-1 min-w-0">
//             <p className="text-xs font-medium text-foreground truncate">{head.name}</p>
//             <p className="text-[10px] text-muted-foreground">Department head</p>
//           </div>
//         </div>
//       ) : (
//         <div className="flex items-center gap-2 mb-3 p-2.5 bg-muted/40 rounded-lg border border-dashed border-border">
//           <Crown size={12} className="text-muted-foreground/50 flex-shrink-0" />
//           <p className="text-xs text-muted-foreground">No head assigned</p>
//         </div>
//       )}

//       {/* Members preview */}
//       {dept.users.length > 0 && (
//         <div className="flex items-center gap-1.5">
//           <div className="flex -space-x-2">
//             {dept.users.slice(0, 4).map(u => (
//               <Avatar key={u.id} name={u.name} avatar={u.avatar} size="sm" />
//             ))}
//           </div>
//           {dept._count.users > 4 && (
//             <span className="text-xs text-muted-foreground ml-1">+{dept._count.users - 4} more</span>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── MAIN ──────────────────────────────────────────────────────
// export function DepartmentsClient({
//   departments, managers,
// }: {
//   departments: DepartmentListItem[];
//   managers:    Manager[];
// }) {
//   const [search, setSearch]      = useState("");
//   const [showCreate, setCreate]  = useState(false);
//   const [editTarget, setEdit]    = useState<DepartmentListItem | null>(null);
//   const [toast, setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);

//   function showToast(msg: string, type: "success" | "error") {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   }

//   const filtered = useMemo(() =>
//     departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase())),
//     [departments, search]
//   );

//   return (
//     <>
//       {/* Toolbar */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center">
//         <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
//           <Search size={14} className="text-muted-foreground flex-shrink-0" />
//           <input
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             placeholder="Search departments..."
//             className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
//           />
//           {search && <button onClick={() => setSearch("")}><X size={13} className="text-muted-foreground" /></button>}
//         </div>

//         <button onClick={() => setCreate(true)}
//           className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
//           <Plus size={14} /> New Department
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="flex items-center gap-4 text-xs text-muted-foreground">
//         <span><span className="font-semibold text-foreground">{departments.length}</span> total departments</span>
//         <span><span className="font-semibold text-foreground">{departments.reduce((a, d) => a + d._count.users, 0)}</span> members assigned</span>
//         {search && <span className="text-primary">{filtered.length} matching</span>}
//       </div>

//       {/* Grid */}
//       {filtered.length === 0 ? (
//         <div className="text-center py-16 bg-card border border-border rounded-xl">
//           <Building2 size={36} className="text-muted-foreground mx-auto mb-3" />
//           <p className="text-sm font-medium text-foreground">
//             {departments.length === 0 ? "No departments yet" : "No departments match your search"}
//           </p>
//           <p className="text-xs text-muted-foreground mt-1">
//             {departments.length === 0 ? "Create your first department to organize your team" : "Try a different search term"}
//           </p>
//           {departments.length === 0 && (
//             <button onClick={() => setCreate(true)}
//               className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
//               Create Department
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map(dept => (
//             <DeptCard
//               key={dept.id}
//               dept={dept}
//               managers={managers}
//               onEdit={setEdit}
//               onToast={showToast}
//             />
//           ))}
//         </div>
//       )}

//       {/* Modals */}
//       {showCreate && (
//         <DeptModal managers={managers} onClose={() => setCreate(false)} />
//       )}
//       {editTarget && (
//         <DeptModal dept={editTarget} managers={managers} onClose={() => setEdit(null)} />
//       )}

//       {/* Toast */}
//       {toast && <Toast message={toast.msg} type={toast.type} />}
//     </>
//   );
// }
// src/components/departments/departments-client.tsx


"use client";

import { useState, useTransition, useMemo } from "react";
import { Building2, Plus, Edit, Trash2, ChevronRight, Search, X, Crown, MoreHorizontal, CheckCircle2, AlertCircle } from "lucide-react";
import { createDepartment, editDepartment, deleteDepartment } from "@/actions/department.actions";
import { DeptTeamModal } from "@/components/shared/dept-team-model";
import type { DepartmentListItem, DeptFormData } from "@/actions/department.actions";

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

export function DepartmentsClient({ departments, formData }: {
  departments: DepartmentListItem[];
  formData:    DeptFormData;
}) {
  const [search,     setSearch]     = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<DepartmentListItem | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [menuOpen,   setMenuOpen]   = useState<string | null>(null);
  const [pending,    startTransition] = useTransition();

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = useMemo(() =>
    departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase())),
    [departments, search]
  );

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Members will be unassigned.`)) return;
    setMenuOpen(null);
    startTransition(async () => {
      const res = await deleteDepartment(id);
      showToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
    });
  }

  // Get current member ids for edit
  function getEditData(dept: DepartmentListItem) {
    return {
      name:      dept.name,
      headId:    dept.headId,
      memberIds: dept.users.map(u => u.id),
    };
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full" />
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-muted-foreground" /></button>}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
          <Plus size={14} /> New Department
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span><span className="font-semibold text-foreground">{departments.length}</span> departments</span>
        <span><span className="font-semibold text-foreground">{departments.reduce((a, d) => a + d._count.users, 0)}</span> members assigned</span>
        {search && <span className="text-primary">{filtered.length} matching</span>}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Building2 size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {departments.length === 0 ? "No departments yet" : "No matches"}
          </p>
          {departments.length === 0 && (
            <button onClick={() => setShowCreate(true)}
              className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Create Department
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(dept => {
            const head = formData.allEmployees.find(e => e.id === dept.headId);
            return (
              <div key={dept.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 size={16} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{dept.name}</h3>
                      <p className="text-xs text-muted-foreground">{dept._count.users} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={`/departments/${dept.id}`}
                      className="text-xs px-2 py-1 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1 text-muted-foreground">
                      View <ChevronRight size={10} />
                    </a>
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === dept.id ? null : dept.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                        <MoreHorizontal size={14} />
                      </button>
                      {menuOpen === dept.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 top-8 z-20 w-32 bg-card border border-border rounded-xl shadow-lg py-1">
                            <button onClick={() => { setEditTarget(dept); setMenuOpen(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                              <Edit size={12} /> Edit
                            </button>
                            <div className="border-t border-border my-1" />
                            <button onClick={() => handleDelete(dept.id, dept.name)} disabled={pending}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Head */}
                {head ? (
                  <div className="flex items-center gap-2 mb-3 px-2.5 py-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200/40 dark:border-amber-800/20">
                    <Crown size={11} className="text-amber-500 flex-shrink-0" />
                    <Avatar name={head.name} avatar={head.avatar} />
                    <p className="text-xs font-medium text-foreground truncate">{head.name}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-lg border border-dashed border-border">
                    <Crown size={11} className="text-muted-foreground/40 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">No head assigned</p>
                  </div>
                )}

                {/* Members */}
                {dept.users.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                      {dept.users.slice(0, 4).map(u => <Avatar key={u.id} name={u.name} avatar={u.avatar} />)}
                    </div>
                    {dept._count.users > 4 && (
                      <span className="text-xs text-muted-foreground ml-1">+{dept._count.users - 4}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <DeptTeamModal
          mode="department"
          leads={formData.managers}
          employees={formData.allEmployees}
          onSubmit={async (fd) => createDepartment(fd)}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <DeptTeamModal
          mode="department"
          existing={getEditData(editTarget)}
          leads={formData.managers}
          employees={formData.allEmployees}
          onSubmit={async (fd) => editDepartment(editTarget.id, fd)}
          onClose={() => setEditTarget(null)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  );
}



