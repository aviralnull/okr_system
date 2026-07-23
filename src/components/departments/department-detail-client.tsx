// src/components/departments/department-detail-client.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Building2, Crown, Users2, ChevronLeft,
  Edit, Trash2, UserMinus, Target,
  Calendar, Briefcase, AlertCircle, CheckCircle2,
  X, MoreHorizontal,
} from "lucide-react";
import {
  editDepartment, deleteDepartment, assignDepartmentHead,
} from "@/actions/department.actions";
import { useRouter } from "next/navigation";
import type { DepartmentDetail } from "@/actions/department.actions";

type Manager = { id: string; name: string; role: string; avatar?: string | null };

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar, size = "md" }: {
  name: string; avatar?: string | null; size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-14 h-14 text-lg" : "w-9 h-9 text-xs";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

const ROLE_COLOR: Record<string, { color: string; bg: string }> = {
  ORG_ADMIN: { color: "#6366f1", bg: "#6366f115" },
  MANAGER:   { color: "#3b82f6", bg: "#3b82f615" },
  HR:        { color: "#8b5cf6", bg: "#8b5cf615" },
  EMPLOYEE:  { color: "#10b981", bg: "#10b98115" },
};

// ── Edit Modal ────────────────────────────────────────────────
function EditModal({
  dept, managers, onClose,
}: {
  dept:     NonNullable<DepartmentDetail>;
  managers: Manager[];
  onClose:  () => void;
}) {
  const [name,   setName]   = useState(dept.name);
  const [headId, setHeadId] = useState(dept.headId ?? "");
  const [error,  setError]  = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    setError("");
    const fd = new FormData();
    fd.set("name",   name.trim());
    fd.set("headId", headId);
    startTransition(async () => {
      const res = await editDepartment(dept.id, fd);
      if (res.success) onClose();
      else setError(res.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Edit Department</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Department head</label>
            <select value={headId} onChange={e => setHeadId(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <option value="">No head assigned</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name} — {m.role.replace("_", " ")}</option>)}
            </select>
          </div>
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 text-sm py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={pending} className="flex-1 text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {pending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export function DepartmentDetailClient({
  dept, managers,
}: {
  dept:     NonNullable<DepartmentDetail>;
  managers: Manager[];
}) {
  const router = useRouter();
  const [showEdit,  setShowEdit]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [pending, startTransition] = useTransition();

  const head = managers.find(m => m.id === dept.headId)
    ?? dept.users.find(u => u.id === dept.headId);

  function showToastMsg(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleDelete() {
    if (!confirm(`Delete "${dept.name}"? This cannot be undone.`)) return;
    setMenuOpen(false);
    startTransition(async () => {
      const res = await deleteDepartment(dept.id);
      if (res.success) router.push("/departments");
      else showToastMsg(res.error, "error");
    });
  }

  function handleRemoveHead() {
    startTransition(async () => {
      const res = await assignDepartmentHead(dept.id, null);
      if (res.success) showToastMsg("Head removed", "success");
      else showToastMsg(res.error, "error");
    });
  }

  const activeMembers   = dept.users.filter(u => u.isActive);
  const inactiveMembers = dept.users.filter(u => !u.isActive);

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Back */}
        <a href="/departments" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={13} /> Back to departments
        </a>

        {/* Header */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 size={22} className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{dept.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {dept.users.length} {dept.users.length === 1 ? "member" : "members"} &middot;
                  Created {new Date(dept.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Actions */}
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
                    <div className="absolute right-0 top-9 z-20 w-36 bg-card border border-border rounded-xl shadow-lg py-1">
                      <button onClick={handleDelete} disabled={pending}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                        <Trash2 size={13} /> Delete dept
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Total members", value: dept.users.length, icon: Users2, color: "#6366f1" },
              { label: "Active",        value: activeMembers.length,   icon: CheckCircle2, color: "#10b981" },
              { label: "Inactive",      value: inactiveMembers.length, icon: AlertCircle,  color: "#94a3b8" },
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

        {/* Department Head */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Crown size={15} className="text-amber-500" /> Department Head
            </div>
            {head && (
              <button onClick={handleRemoveHead} disabled={pending}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1">
                <UserMinus size={12} /> Remove
              </button>
            )}
          </div>

          {head ? (
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
              <Avatar name={head.name} avatar={head.avatar} size="lg" />
              <div>
                <p className="text-sm font-semibold text-foreground">{head.name}</p>
                {"email" in head && <p className="text-xs text-muted-foreground">{(head as any).email}</p>}
                {"role" in head && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: ROLE_COLOR[(head as any).role]?.bg ?? "#6366f115", color: ROLE_COLOR[(head as any).role]?.color ?? "#6366f1" }}>
                    {(head as any).role?.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-border rounded-xl">
              <Crown size={24} className="text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No head assigned</p>
              <button onClick={() => setShowEdit(true)}
                className="mt-2 text-xs text-primary hover:underline">
                Assign a head →
              </button>
            </div>
          )}
        </div>

        {/* Members list */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users2 size={15} className="text-primary" /> Members
            </div>
            <a href="/employees"
              className="text-xs text-primary hover:underline">
              Manage in Employees →
            </a>
          </div>

          {dept.users.length === 0 ? (
            <div className="text-center py-12">
              <Users2 size={28} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No members yet</p>
              <p className="text-xs text-muted-foreground mt-1">Assign employees to this department from the Employees page</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {dept.users.map(member => {
                const rc = ROLE_COLOR[member.role] ?? ROLE_COLOR.EMPLOYEE;
                return (
                  <div key={member.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    <Avatar name={member.name} avatar={member.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                        {member.id === dept.headId && (
                          <Crown size={11} className="text-amber-500 flex-shrink-0" />
                        )}
                        {!member.isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Inactive</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                        {member.designation && ` · ${member.designation}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full hidden sm:block"
                        style={{ background: rc.bg, color: rc.color }}>
                        {member.role.replace("_", " ")}
                      </span>

                      <div className="text-right hidden md:block">
                        <p className="text-xs font-medium text-foreground">{member._count.objectives} OKRs</p>
                        <p className="text-[10px] text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <EditModal dept={dept} managers={managers} onClose={() => setShowEdit(false)} />
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        )}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}