// // components/employees/employees-client.tsx
// "use client";

// import { useState, useTransition, useMemo } from "react";
// import {
//   Search, UserPlus, Filter, MoreHorizontal,
//   Mail, Shield, Building2, Users2, UserCheck,
//   UserX, Trash2, Edit, ChevronDown, X,
//   Briefcase, Calendar, Target,
// } from "lucide-react";
// import {
//   inviteEmployee,
//   editEmployee,
//   toggleEmployeeStatus,
//   deleteEmployee,
// } from "@/actions/Employee.actions";
// import type { Employee }     from "@/actions/Employee.actions";
// import type { getEmployeeFormData } from "@/actions/Employee.actions";

// type FormData = Awaited<ReturnType<typeof getEmployeeFormData>>;

// // ── Role config ───────────────────────────────────────────────
// const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
//   ORG_ADMIN: { label: "Org Admin", color: "#6366f1", bg: "#6366f115" },
//   MANAGER:   { label: "Manager",   color: "#3b82f6", bg: "#3b82f615" },
//   HR:        { label: "HR",        color: "#8b5cf6", bg: "#8b5cf615" },
//   EMPLOYEE:  { label: "Employee",  color: "#10b981", bg: "#10b98115" },
// };

// // ── Helpers ───────────────────────────────────────────────────
// function Avatar({ name, avatar, size = "md" }: { name: string; avatar?: string | null; size?: "sm" | "md" }) {
//   const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
//   if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
//   return (
//     <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
//       {name.slice(0, 2).toUpperCase()}
//     </div>
//   );
// }

// function RoleBadge({ role }: { role: string }) {
//   const c = ROLE_CONFIG[role] ?? ROLE_CONFIG.EMPLOYEE;
//   return (
//     <span className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
//       style={{ color: c.color, background: c.bg }}>
//       {c.label}
//     </span>
//   );
// }

// function StatusBadge({ isActive }: { isActive: boolean }) {
//   return (
//     <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
//       isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
//     }`}>
//       <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-400"}`} />
//       {isActive ? "Active" : "Inactive"}
//     </span>
//   );
// }

// // ── Invite Modal ──────────────────────────────────────────────
// function InviteModal({ formData, onClose }: { formData: FormData; onClose: () => void }) {
//   const [pending, startTransition] = useTransition();
//   const [error, setError]          = useState("");
//   const [success, setSuccess]      = useState("");

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     const fd = new FormData(e.currentTarget);
//     setError(""); setSuccess("");
//     startTransition(async () => {
//       const res = await inviteEmployee(fd);
//       if (res.success) {
//         setSuccess(res.message ?? "Invite sent!");
//         setTimeout(onClose, 1500);
//       } else {
//         setError(res.error);
//       }
//     });
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
//         <div className="flex items-center justify-between mb-5">
//           <div>
//             <h2 className="text-base font-semibold text-foreground">Invite Employee</h2>
//             <p className="text-xs text-muted-foreground mt-0.5">They'll receive an email to set their password</p>
//           </div>
//           <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
//             <X size={18} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email *</label>
//             <input name="email" type="email" required placeholder="employee@company.com"
//               className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
//           </div>

//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Role *</label>
//             <select name="role" required
//               className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
//               <option value="EMPLOYEE">Employee</option>
//               <option value="MANAGER">Manager</option>
//               <option value="HR">HR</option>
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs font-medium text-muted-foreground block mb-1.5">Department</label>
//               <select name="departmentId"
//                 className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
//                 <option value="">None</option>
//                 {formData.departments.map((d) => (
//                   <option key={d.id} value={d.id}>{d.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="text-xs font-medium text-muted-foreground block mb-1.5">Team</label>
//               <select name="teamId"
//                 className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
//                 <option value="">None</option>
//                 {formData.teams.map((t) => (
//                   <option key={t.id} value={t.id}>{t.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {error   && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
//           {success && <p className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg">{success}</p>}

//           <div className="flex gap-2 pt-1">
//             <button type="button" onClick={onClose}
//               className="flex-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
//               Cancel
//             </button>
//             <button type="submit" disabled={pending}
//               className="flex-1 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
//               {pending ? "Sending..." : "Send Invite"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // ── Edit Modal ────────────────────────────────────────────────
// function EditModal({ employee, formData, onClose }: {
//   employee: Employee; formData: FormData; onClose: () => void;
// }) {
//   const [pending, startTransition] = useTransition();
//   const [error, setError]          = useState("");

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     const fd = new FormData(e.currentTarget);
//     fd.set("userId", employee.id);
//     setError("");
//     startTransition(async () => {
//       const res = await editEmployee(fd);
//       if (res.success) onClose();
//       else setError(res.error);
//     });
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
//         <div className="flex items-center justify-between mb-5">
//           <div className="flex items-center gap-3">
//             <Avatar name={employee.name} avatar={employee.avatar} />
//             <div>
//               <h2 className="text-base font-semibold text-foreground">Edit Employee</h2>
//               <p className="text-xs text-muted-foreground">{employee.email}</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input type="hidden" name="userId" value={employee.id} />

//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name *</label>
//             <input name="name" defaultValue={employee.name} required
//               className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs font-medium text-muted-foreground block mb-1.5">Role *</label>
//               <select name="role" defaultValue={employee.role}
//                 className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
//                 <option value="EMPLOYEE">Employee</option>
//                 <option value="MANAGER">Manager</option>
//                 <option value="HR">HR</option>
//               </select>
//             </div>
//             <div>
//               <label className="text-xs font-medium text-muted-foreground block mb-1.5">Designation</label>
//               <input name="designation" defaultValue={employee.designation ?? ""}
//                 placeholder="e.g. Senior Dev"
//                 className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs font-medium text-muted-foreground block mb-1.5">Department</label>
//               <select name="departmentId" defaultValue={employee.department?.id ?? ""}
//                 className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
//                 <option value="">None</option>
//                 {formData.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="text-xs font-medium text-muted-foreground block mb-1.5">Team</label>
//               <select name="teamId" defaultValue={employee.team?.id ?? ""}
//                 className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
//                 <option value="">None</option>
//                 {formData.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
//               </select>
//             </div>
//           </div>

//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Manager</label>
//             <select name="managerId" defaultValue={employee.manager?.id ?? ""}
//               className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
//               <option value="">None</option>
//               {formData.managers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.role.replace("_"," ")})</option>)}
//             </select>
//           </div>

//           {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}

//           <div className="flex gap-2 pt-1">
//             <button type="button" onClick={onClose}
//               className="flex-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
//               Cancel
//             </button>
//             <button type="submit" disabled={pending}
//               className="flex-1 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
//               {pending ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // ── Row actions dropdown ──────────────────────────────────────
// function RowActions({ employee, onEdit }: { employee: Employee; onEdit: () => void }) {
//   const [open, setOpen]            = useState(false);
//   const [pending, startTransition] = useTransition();

//   function handleToggle() {
//     startTransition(async () => {
//       await toggleEmployeeStatus(employee.id);
//       setOpen(false);
//     });
//   }

//   function handleDelete() {
//     if (!confirm(`Remove ${employee.name}? This cannot be undone.`)) return;
//     startTransition(async () => {
//       await deleteEmployee(employee.id);
//       setOpen(false);
//     });
//   }

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
//       >
//         <MoreHorizontal size={15} />
//       </button>

//       {open && (
//         <>
//           <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
//           <div className="absolute right-0 top-8 z-20 w-44 bg-card border border-border rounded-xl shadow-lg py-1 overflow-hidden">
//             <button
//               onClick={() => { onEdit(); setOpen(false); }}
//               className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
//             >
//               <Edit size={13} /> Edit
//             </button>
//             <button
//               onClick={handleToggle}
//               disabled={pending}
//               className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
//             >
//               {employee.isActive
//                 ? <><UserX size={13} /> Deactivate</>
//                 : <><UserCheck size={13} /> Activate</>
//               }
//             </button>
//             <div className="border-t border-border my-1" />
//             <button
//               onClick={handleDelete}
//               disabled={pending}
//               className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors text-left"
//             >
//               <Trash2 size={13} /> Remove
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // ── MAIN CLIENT COMPONENT ─────────────────────────────────────
// export function EmployeesClient({
//   employees,
//   formData,
// }: {
//   employees: Employee[];
//   formData:  FormData;
// }) {
//   const [search,      setSearch]      = useState("");
//   const [roleFilter,  setRoleFilter]  = useState("ALL");
//   const [deptFilter,  setDeptFilter]  = useState("ALL");
//   const [statusFilter,setStatusFilter]= useState("ALL");
//   const [showInvite,  setShowInvite]  = useState(false);
//   const [editTarget,  setEditTarget]  = useState<Employee | null>(null);

//   // ── Filter + search ───────────────────────────────────────
//   const filtered = useMemo(() => {
//     return employees.filter((e) => {
//       const q = search.toLowerCase();
//       const matchSearch =
//         !q ||
//         e.name.toLowerCase().includes(q) ||
//         e.email.toLowerCase().includes(q) ||
//         (e.designation ?? "").toLowerCase().includes(q);
//       const matchRole   = roleFilter   === "ALL" || e.role              === roleFilter;
//       const matchDept   = deptFilter   === "ALL" || e.department?.id    === deptFilter;
//       const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? e.isActive : !e.isActive);
//       return matchSearch && matchRole && matchDept && matchStatus;
//     });
//   }, [employees, search, roleFilter, deptFilter, statusFilter]);

//   const hasFilters = search || roleFilter !== "ALL" || deptFilter !== "ALL" || statusFilter !== "ALL";

//   return (
//     <>
//       {/* ── Toolbar ───────────────────────────────────────── */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center">

//         {/* Search */}
//         <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
//           <Search size={14} className="text-muted-foreground flex-shrink-0" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search by name, email, designation..."
//             className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
//           />
//           {search && (
//             <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
//               <X size={13} />
//             </button>
//           )}
//         </div>

//         {/* Filters */}
//         <div className="flex items-center gap-2 flex-wrap">
//           <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
//             className="text-xs px-3 py-2 rounded-lg border border-border bg-card outline-none cursor-pointer">
//             <option value="ALL">All Roles</option>
//             <option value="ORG_ADMIN">Org Admin</option>
//             <option value="MANAGER">Manager</option>
//             <option value="HR">HR</option>
//             <option value="EMPLOYEE">Employee</option>
//           </select>

//           <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
//             className="text-xs px-3 py-2 rounded-lg border border-border bg-card outline-none cursor-pointer">
//             <option value="ALL">All Departments</option>
//             {formData.departments.map((d) => (
//               <option key={d.id} value={d.id}>{d.name}</option>
//             ))}
//           </select>

//           <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
//             className="text-xs px-3 py-2 rounded-lg border border-border bg-card outline-none cursor-pointer">
//             <option value="ALL">All Status</option>
//             <option value="ACTIVE">Active</option>
//             <option value="INACTIVE">Inactive</option>
//           </select>

//           {hasFilters && (
//             <button
//               onClick={() => { setSearch(""); setRoleFilter("ALL"); setDeptFilter("ALL"); setStatusFilter("ALL"); }}
//               className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
//             >
//               <X size={12} /> Clear
//             </button>
//           )}
//         </div>

//         {/* Invite button */}
//         <button
//           onClick={() => setShowInvite(true)}
//           className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
//         >
//           <UserPlus size={14} /> Invite Employee
//         </button>
//       </div>

//       {/* ── Stats row ─────────────────────────────────────── */}
//       <div className="flex items-center gap-4 text-xs text-muted-foreground">
//         <span><span className="font-semibold text-foreground">{employees.length}</span> total</span>
//         <span><span className="font-semibold text-emerald-600">{employees.filter(e => e.isActive).length}</span> active</span>
//         <span><span className="font-semibold text-red-500">{employees.filter(e => !e.isActive).length}</span> inactive</span>
//         {hasFilters && <span className="text-primary">{filtered.length} matching filters</span>}
//       </div>

//       {/* ── Table ─────────────────────────────────────────── */}
//       <div className="rounded-xl border border-border bg-card overflow-hidden">
//         {/* Header */}
//         <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-border bg-muted/40">
//           {["Employee", "Role", "Department", "Team", "Manager", "Status", ""].map((h, i) => (
//             <p key={i} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
//           ))}
//         </div>

//         {/* Rows */}
//         {filtered.length === 0 ? (
//           <div className="text-center py-16">
//             <Users2 size={32} className="text-muted-foreground mx-auto mb-3" />
//             <p className="text-sm font-medium text-foreground">No employees found</p>
//             <p className="text-xs text-muted-foreground mt-1">
//               {hasFilters ? "Try adjusting your filters" : "Invite your first employee to get started"}
//             </p>
//             {!hasFilters && (
//               <button
//                 onClick={() => setShowInvite(true)}
//                 className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
//               >
//                 Invite Employee
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="divide-y divide-border">
//             {filtered.map((emp) => (
//               <div
//                 key={emp.id}
//                 className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3.5 items-center hover:bg-muted/30 transition-colors"
//               >
//                 {/* Employee info */}
//                 <div className="flex items-center gap-3 min-w-0">
//                   <Avatar name={emp.name} avatar={emp.avatar} />
//                   <div className="min-w-0">
//                     <p className="text-sm font-medium text-foreground truncate">{emp.name}</p>
//                     <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
//                     {emp.designation && (
//                       <p className="text-[11px] text-muted-foreground/70 truncate">{emp.designation}</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Role */}
//                 <div><RoleBadge role={emp.role} /></div>

//                 {/* Department */}
//                 <div className="flex items-center gap-1.5 min-w-0">
//                   {emp.department ? (
//                     <>
//                       <Building2 size={12} className="text-muted-foreground flex-shrink-0" />
//                       <span className="text-xs text-foreground truncate">{emp.department.name}</span>
//                     </>
//                   ) : (
//                     <span className="text-xs text-muted-foreground">—</span>
//                   )}
//                 </div>

//                 {/* Team */}
//                 <div className="flex items-center gap-1.5 min-w-0">
//                   {emp.team ? (
//                     <>
//                       <Users2 size={12} className="text-muted-foreground flex-shrink-0" />
//                       <span className="text-xs text-foreground truncate">{emp.team.name}</span>
//                     </>
//                   ) : (
//                     <span className="text-xs text-muted-foreground">—</span>
//                   )}
//                 </div>

//                 {/* Manager */}
//                 <div className="flex items-center gap-1.5 min-w-0">
//                   {emp.manager ? (
//                     <>
//                       <Avatar name={emp.manager.name} size="sm" />
//                       <span className="text-xs text-foreground truncate">{emp.manager.name}</span>
//                     </>
//                   ) : (
//                     <span className="text-xs text-muted-foreground">—</span>
//                   )}
//                 </div>

//                 {/* Status */}
//                 <div><StatusBadge isActive={emp.isActive} /></div>

//                 {/* Actions */}
//                 <div>
//                   <RowActions
//                     employee={emp}
//                     onEdit={() => setEditTarget(emp)}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ── Joined date + OKR count footer info ───────────── */}
//       <p className="text-xs text-muted-foreground">
//         Showing {filtered.length} of {employees.length} employees.
//         Click the menu icon on any row to edit, deactivate, or remove.
//       </p>

//       {/* ── Modals ────────────────────────────────────────── */}
//       {showInvite && (
//         <InviteModal formData={formData} onClose={() => setShowInvite(false)} />
//       )}
//       {editTarget && (
//         <EditModal
//           employee={editTarget}
//           formData={formData}
//           onClose={() => setEditTarget(null)}
//         />
//       )}
//     </>
//   );
// }




// src/components/employees/employees-client.tsx
// Key changes: Added "View Activity" button in dropdown, multi-team/dept selectors in edit modal
"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, X, Plus, MoreHorizontal, Edit, Trash2,
  CheckCircle2, AlertCircle, Activity, UserCheck,
  Building2, Users2, Mail, Shield,
} from "lucide-react";
import { TeamSelector, DeptSelector } from "@/components/teams/teams-client";
import {
  editEmployee, deleteEmployee, toggleEmployeeStatus,
} from "@/actions/Employee.actions";
// Note: multi-team/dept stored via editEmployee — primary team/dept only for now

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
  if (avatar) return <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />;
  return <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">{name.slice(0, 2).toUpperCase()}</div>;
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  );
}

const ROLE_COLOR: Record<string, { color: string; bg: string }> = {
  ORG_ADMIN: { color: "#6366f1", bg: "#6366f115" },
  MANAGER: { color: "#f59e0b", bg: "#f59e0b15" },
  HR: { color: "#10b981", bg: "#10b98115" },
  EMPLOYEE: { color: "#94a3b8", bg: "#94a3b815" },
};

type Employee = {
  id: string; name: string; email: string; role: string;
  avatar?: string | null; designation?: string | null; isActive: boolean;
  employeeId?: string | null;
  department?: { id: string; name: string } | null;
  team?: { id: string; name: string } | null;
  manager?: { name: string } | null;
  // userTeams?:       { team: { id: string; name: string } }[];

  _count: { objectives: number };
};

type FormData = {
  teams: { id: string; name: string; department?: { name: string } | null }[];
  departments: { id: string; name: string }[];
  managers: { id: string; name: string }[];
};

// ── Edit Employee Modal ───────────────────────────────────────
function EditModal({ employee, formData, onClose, onToast }: {
  employee: Employee;
  formData: FormData;
  onClose: () => void;
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const [name, setName] = useState(employee.name);
  const [designation, setDesig] = useState(employee.designation ?? "");
  const [role, setRole] = useState(employee.role);
  const [managerId, setManager] = useState(employee.manager ? formData.managers.find(m => m.name === employee.manager?.name)?.id ?? "" : "");
  const [teamId, setTeamId] = useState<string>(
    employee.team?.id ?? ""
  );

  const [departmentId, setDepartmentId] = useState<string>(
    employee.department?.id ?? ""
  );
  const [tab, setTab] = useState<"basic" | "teams">("basic");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function handleSave() {
    if (!name.trim()) return setError("Name is required");
    setError("");
    start(async () => {
      // editEmployee uses FormData with userId field — matches Employee.actions.ts
      const fd = new FormData();
      fd.set("userId", employee.id);
      fd.set("name", name);
      fd.set("designation", designation);
      fd.set("role", role);
      fd.set("managerId", managerId);
      fd.set("teamId", teamId);
      fd.set("departmentId", departmentId);

      const res = await editEmployee(fd);
      if (!res.success) return setError(res.error);

      onToast("Employee updated successfully", "success");
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">Edit employee</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {[{ id: "basic", label: "Basic info" }, { id: "teams", label: "Teams & Departments" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={cn("flex-1 py-2.5 text-sm font-medium transition-all",
                tab === t.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {tab === "basic" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full name *</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Designation</label>
                <input value={designation} onChange={e => setDesig(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR">HR</option>
                  <option value="ORG_ADMIN">Org Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Reports to (Manager)</label>
                <select value={managerId} onChange={e => setManager(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer">
                  <option value="">No manager</option>
                  {formData.managers.filter(m => m.id !== employee.id).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {tab === "teams" && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                  Teams <span className="text-muted-foreground/60 normal-case"> (select one)</span>
                </label>
                <TeamSelector
                  teams={formData.teams}
                  selectedId={teamId}
                  onChange={setTeamId}
                />
                {teamId && (
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Selected team
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                  Departments <span className="text-muted-foreground/60 normal-case"> (select one)</span>
                </label>
                <DeptSelector
                  departments={formData.departments}
                  selectedId={departmentId}
                  onChange={setDepartmentId}
                />

                {departmentId && (
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Selected department
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg mt-3">
              <AlertCircle size={13} className="flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="flex-1 text-sm py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={pending}
            className="flex-1 text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Employee Row ──────────────────────────────────────────────
function EmployeeRow({
  emp,
  formData,
  onToast,
  isOrgAdmin,
  onStatusChange,
}: {
  emp: Employee;
  formData: FormData;
  onToast: (msg: string, type: "success" | "error") => void;
  isOrgAdmin: boolean;
  onStatusChange: (id: string, isActive: boolean) => void;
}){
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [pending, start] = useTransition();
  const rColor = ROLE_COLOR[emp.role] ?? ROLE_COLOR.EMPLOYEE;

  // All teams (primary + extra)
  // const allTeams = [
  //   ...(emp.userTeams?.map(ut => ut.team.name) ?? []),
  //   ...(emp.team && !emp.userTeams?.find(ut => ut.team.id === emp.team?.id) ? [emp.team.name] : []),
  // ];
  // // All depts
  // const allDepts = [
  //   ...(emp.userDepartments?.map(ud => ud.department.name) ?? []),
  //   ...(emp.department && !emp.userDepartments?.find(ud => ud.department.id === emp.department?.id) ? [emp.department.name] : []),
  // ];
  const allTeams = emp.team?.name ? [emp.team.name] : [];

  const allDepts = emp.department?.name ? [emp.department.name] : [];

  // function handleDeactivate() {
  //   setMenuOpen(false);
  //   if (!confirm(`${emp.isActive ? "Deactivate" : "Activate"} ${emp.name}?`)) return;
  //   start(async () => {
  //     const res = await toggleEmployeeStatus(emp.id);
  //     onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
  //   });
  // }
function handleDeactivate() {
  setMenuOpen(false);

  const action = emp.isActive ? "Deactivate" : "Activate";

  if (!confirm(`${action} ${emp.name}?`)) return;

  start(async () => {
    const res = await toggleEmployeeStatus(emp.id);

    if (!res.success) {
      onToast(res.error, "error");
      return;
    }

    // Use actual status returned from DB
    onStatusChange(emp.id, res.isActive);

    onToast(res.message, "success");
  });
}
  function handleDelete() {
    setMenuOpen(false);
    if (!confirm(`Permanently delete ${emp.name}? This cannot be undone.`)) return;
    start(async () => {
      const res = await deleteEmployee(emp.id);
      onToast(res.success ? "Employee deleted" : res.error, res.success ? "success" : "error");
    });
  }

  return (
    <>
      <div className={cn("flex items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-sm",
        emp.isActive ? "border-border bg-card" : "border-border bg-muted/30 opacity-60")}>
        <Avatar name={emp.name} avatar={emp.avatar} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{emp.name}</p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: rColor.bg, color: rColor.color }}>
              {emp.role.replace("_", " ")}
            </span>
            {!emp.isActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">Inactive</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{emp.email}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[10px] text-muted-foreground">
            {emp.designation && <span>{emp.designation}</span>}
            {allTeams.length > 0 && (
              <span className="flex items-center gap-1">
                <Users2 size={9} /> {allTeams.join(", ")}
              </span>
            )}
            {allDepts.length > 0 && (
              <span className="flex items-center gap-1">
                <Building2 size={9} /> {allDepts.join(", ")}
              </span>
            )}
            {emp.manager && (
              <span className="flex items-center gap-1">
                <Shield size={9} /> {emp.manager.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <CheckCircle2 size={9} /> {emp._count.objectives} OKRs
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* View activity button */}
          <a href={`/employees/${emp.id}/activity`}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
            title="View activity">
            <Activity size={14} />
          </a>

          {isOrgAdmin && (
            <div className="relative">
              <button onClick={() => setMenuOpen(v => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <MoreHorizontal size={15} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-9 z-20 w-44 bg-card border border-border rounded-xl shadow-lg py-1">
                    <button onClick={() => { setShowEdit(true); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                      <Edit size={13} /> Edit
                    </button>
                    <a href={`/employees/${emp.id}/activity`}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                      <Activity size={13} /> View Activity
                    </a>
                    <button onClick={handleDeactivate} disabled={pending}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-amber-500">
                      <UserCheck size={13} /> {emp.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={handleDelete} disabled={pending}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EditModal
          employee={emp}
          formData={formData}
          onClose={() => setShowEdit(false)}
          onToast={onToast}
        />
      )}
    </>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
export function EmployeesClient({
  employees, formData, isOrgAdmin,
}: {
  employees: Employee[];
  formData: FormData;
  isOrgAdmin: boolean;
}) {
  const [employeeList, setEmployeeList] = useState<Employee[]>(employees);
  const [search, setSearch] = useState("");
  const [roleFilter, setRole] = useState("ALL");
  const [deptFilter, setDept] = useState("ALL");
  const [statusFilter, setStatus] = useState("ALL");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // const filtered = useMemo(() => {
  //   return employees.filter(e => {
  //     const q = search.toLowerCase();
  //     const matchSearch = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.designation?.toLowerCase().includes(q);
  //     const matchRole = roleFilter === "ALL" || e.role === roleFilter;
  //     const matchDept =
  //       deptFilter === "ALL" ||
  //       e.department?.id === deptFilter;
  //     const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? e.isActive : !e.isActive);
  //     return matchSearch && matchRole && matchDept && matchStatus;
  //   });
  // }, [employees, search, roleFilter, deptFilter, statusFilter]);
 

  const filtered = useMemo(() => {
  return employeeList.filter((e) => {
    const q = search.toLowerCase();

    const matchSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.designation?.toLowerCase().includes(q);

    const matchRole =
      roleFilter === "ALL" ||
      e.role === roleFilter;

    const matchDept =
      deptFilter === "ALL" ||
      e.department?.id === deptFilter;

    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && e.isActive) ||
      (statusFilter === "INACTIVE" && !e.isActive);

    return (
      matchSearch &&
      matchRole &&
      matchDept &&
      matchStatus
    );
  });
}, [
  employeeList,
  search,
  roleFilter,
  deptFilter,
  statusFilter,
]);
  const hasFilters = search || roleFilter !== "ALL" || deptFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <>
      {/* Stats */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: employees.length, color: "#6366f1" },
          { label: "Active", value: employees.filter(e => e.isActive).length, color: "#10b981" },
          { label: "Managers", value: employees.filter(e => e.role === "MANAGER").length, color: "#f59e0b" },
          { label: "Inactive", value: employees.filter(e => !e.isActive).length, color: "#94a3b8" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div> */}


      {/* Stats */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {[
    {
      label: "Total",
      value: employeeList.length,
      color: "#6366f1",
    },
    {
      label: "Active",
      value: employeeList.filter(e => e.isActive).length,
      color: "#10b981",
    },
    {
      label: "Managers",
      value: employeeList.filter(e => e.role === "MANAGER").length,
      color: "#f59e0b",
    },
    {
      label: "Inactive",
      value: employeeList.filter(e => !e.isActive).length,
      color: "#94a3b8",
    },
  ].map(s => (
    <div
      key={s.label}
      className="rounded-xl border border-border bg-card p-4"
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {s.label}
      </p>

      <p
        className="text-2xl font-bold"
        style={{ color: s.color }}
      >
        {s.value}
      </p>
    </div>
  ))}
</div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, designation..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full" />
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-muted-foreground" /></button>}
        </div>

        <select value={roleFilter} onChange={e => setRole(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
          <option value="ALL">All roles</option>
          <option value="EMPLOYEE">Employee</option>
          <option value="MANAGER">Manager</option>
          <option value="HR">HR</option>
          <option value="ORG_ADMIN">Org Admin</option>
        </select>

        <select value={deptFilter} onChange={e => setDept(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
          <option value="ALL">All departments</option>
          {formData.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatus(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
          <option value="ALL">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        {hasFilters && (
          <button onClick={() => { setSearch(""); setRole("ALL"); setDept("ALL"); setStatus("ALL"); }}
            className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Users2 size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {employees.length === 0 ? "No employees yet" : "No employees match your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(emp => (
            <EmployeeRow
  key={emp.id}
  emp={emp}
  formData={formData}
  onToast={showToast}
  isOrgAdmin={isOrgAdmin}
  onStatusChange={(id, isActive) => {
    setEmployeeList((prev) =>
      prev.map((employee) =>
        employee.id === id
          ? { ...employee, isActive }
          : employee
      )
    );
  }}
/>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {employees.length} employees
      </p>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}