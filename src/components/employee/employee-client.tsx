// components/employees/employees-client.tsx
"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, UserPlus, Filter, MoreHorizontal,
  Mail, Shield, Building2, Users2, UserCheck,
  UserX, Trash2, Edit, ChevronDown, X,
  Briefcase, Calendar, Target,
} from "lucide-react";
import {
  inviteEmployee,
  editEmployee,
  toggleEmployeeStatus,
  deleteEmployee,
} from "@/actions/Employee.actions";
import type { Employee }     from "@/actions/Employee.actions";
import type { getEmployeeFormData } from "@/actions/Employee.actions";

type FormData = Awaited<ReturnType<typeof getEmployeeFormData>>;

// ── Role config ───────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ORG_ADMIN: { label: "Org Admin", color: "#6366f1", bg: "#6366f115" },
  MANAGER:   { label: "Manager",   color: "#3b82f6", bg: "#3b82f615" },
  HR:        { label: "HR",        color: "#8b5cf6", bg: "#8b5cf615" },
  EMPLOYEE:  { label: "Employee",  color: "#10b981", bg: "#10b98115" },
};

// ── Helpers ───────────────────────────────────────────────────
function Avatar({ name, avatar, size = "md" }: { name: string; avatar?: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const c = ROLE_CONFIG[role] ?? ROLE_CONFIG.EMPLOYEE;
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
      isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-400"}`} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

// ── Invite Modal ──────────────────────────────────────────────
function InviteModal({ formData, onClose }: { formData: FormData; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError]          = useState("");
  const [success, setSuccess]      = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(""); setSuccess("");
    startTransition(async () => {
      const res = await inviteEmployee(fd);
      if (res.success) {
        setSuccess(res.message ?? "Invite sent!");
        setTimeout(onClose, 1500);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Invite Employee</h2>
            <p className="text-xs text-muted-foreground mt-0.5">They'll receive an email to set their password</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email *</label>
            <input name="email" type="email" required placeholder="employee@company.com"
              className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Role *</label>
            <select name="role" required
              className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Department</label>
              <select name="departmentId"
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">None</option>
                {formData.departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Team</label>
              <select name="teamId"
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">None</option>
                {formData.teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error   && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg">{success}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
              {pending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────
function EditModal({ employee, formData, onClose }: {
  employee: Employee; formData: FormData; onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError]          = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("userId", employee.id);
    setError("");
    startTransition(async () => {
      const res = await editEmployee(fd);
      if (res.success) onClose();
      else setError(res.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Avatar name={employee.name} avatar={employee.avatar} />
            <div>
              <h2 className="text-base font-semibold text-foreground">Edit Employee</h2>
              <p className="text-xs text-muted-foreground">{employee.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={employee.id} />

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name *</label>
            <input name="name" defaultValue={employee.name} required
              className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Role *</label>
              <select name="role" defaultValue={employee.role}
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Designation</label>
              <input name="designation" defaultValue={employee.designation ?? ""}
                placeholder="e.g. Senior Dev"
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Department</label>
              <select name="departmentId" defaultValue={employee.department?.id ?? ""}
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">None</option>
                {formData.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Team</label>
              <select name="teamId" defaultValue={employee.team?.id ?? ""}
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">None</option>
                {formData.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Manager</label>
            <select name="managerId" defaultValue={employee.manager?.id ?? ""}
              className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">None</option>
              {formData.managers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.role.replace("_"," ")})</option>)}
            </select>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
              {pending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Row actions dropdown ──────────────────────────────────────
function RowActions({ employee, onEdit }: { employee: Employee; onEdit: () => void }) {
  const [open, setOpen]            = useState(false);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleEmployeeStatus(employee.id);
      setOpen(false);
    });
  }

  function handleDelete() {
    if (!confirm(`Remove ${employee.name}? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteEmployee(employee.id);
      setOpen(false);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-card border border-border rounded-xl shadow-lg py-1 overflow-hidden">
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              <Edit size={13} /> Edit
            </button>
            <button
              onClick={handleToggle}
              disabled={pending}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              {employee.isActive
                ? <><UserX size={13} /> Deactivate</>
                : <><UserCheck size={13} /> Activate</>
              }
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={handleDelete}
              disabled={pending}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors text-left"
            >
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── MAIN CLIENT COMPONENT ─────────────────────────────────────
export function EmployeesClient({
  employees,
  formData,
}: {
  employees: Employee[];
  formData:  FormData;
}) {
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("ALL");
  const [deptFilter,  setDeptFilter]  = useState("ALL");
  const [statusFilter,setStatusFilter]= useState("ALL");
  const [showInvite,  setShowInvite]  = useState(false);
  const [editTarget,  setEditTarget]  = useState<Employee | null>(null);

  // ── Filter + search ───────────────────────────────────────
  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.designation ?? "").toLowerCase().includes(q);
      const matchRole   = roleFilter   === "ALL" || e.role              === roleFilter;
      const matchDept   = deptFilter   === "ALL" || e.department?.id    === deptFilter;
      const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? e.isActive : !e.isActive);
      return matchSearch && matchRole && matchDept && matchStatus;
    });
  }, [employees, search, roleFilter, deptFilter, statusFilter]);

  const hasFilters = search || roleFilter !== "ALL" || deptFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <>
      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">

        {/* Search */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, designation..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-border bg-card outline-none cursor-pointer">
            <option value="ALL">All Roles</option>
            <option value="ORG_ADMIN">Org Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="HR">HR</option>
            <option value="EMPLOYEE">Employee</option>
          </select>

          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-border bg-card outline-none cursor-pointer">
            <option value="ALL">All Departments</option>
            {formData.departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-border bg-card outline-none cursor-pointer">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setRoleFilter("ALL"); setDeptFilter("ALL"); setStatusFilter("ALL"); }}
              className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Invite button */}
        <button
          onClick={() => setShowInvite(true)}
          className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
        >
          <UserPlus size={14} /> Invite Employee
        </button>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span><span className="font-semibold text-foreground">{employees.length}</span> total</span>
        <span><span className="font-semibold text-emerald-600">{employees.filter(e => e.isActive).length}</span> active</span>
        <span><span className="font-semibold text-red-500">{employees.filter(e => !e.isActive).length}</span> inactive</span>
        {hasFilters && <span className="text-primary">{filtered.length} matching filters</span>}
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-border bg-muted/40">
          {["Employee", "Role", "Department", "Team", "Manager", "Status", ""].map((h, i) => (
            <p key={i} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users2 size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No employees found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {hasFilters ? "Try adjusting your filters" : "Invite your first employee to get started"}
            </p>
            {!hasFilters && (
              <button
                onClick={() => setShowInvite(true)}
                className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Invite Employee
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((emp) => (
              <div
                key={emp.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3.5 items-center hover:bg-muted/30 transition-colors"
              >
                {/* Employee info */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={emp.name} avatar={emp.avatar} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                    {emp.designation && (
                      <p className="text-[11px] text-muted-foreground/70 truncate">{emp.designation}</p>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div><RoleBadge role={emp.role} /></div>

                {/* Department */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {emp.department ? (
                    <>
                      <Building2 size={12} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-foreground truncate">{emp.department.name}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Team */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {emp.team ? (
                    <>
                      <Users2 size={12} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-foreground truncate">{emp.team.name}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Manager */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {emp.manager ? (
                    <>
                      <Avatar name={emp.manager.name} size="sm" />
                      <span className="text-xs text-foreground truncate">{emp.manager.name}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Status */}
                <div><StatusBadge isActive={emp.isActive} /></div>

                {/* Actions */}
                <div>
                  <RowActions
                    employee={emp}
                    onEdit={() => setEditTarget(emp)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Joined date + OKR count footer info ───────────── */}
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {employees.length} employees.
        Click the menu icon on any row to edit, deactivate, or remove.
      </p>

      {/* ── Modals ────────────────────────────────────────── */}
      {showInvite && (
        <InviteModal formData={formData} onClose={() => setShowInvite(false)} />
      )}
      {editTarget && (
        <EditModal
          employee={editTarget}
          formData={formData}
          onClose={() => setEditTarget(null)}
        />
      )}
    </>
  );
}