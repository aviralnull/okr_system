"use client";

import { useState, useTransition, useMemo } from "react";
import {
  X, Search, Crown, Users2, AlertCircle, Check,
} from "lucide-react";

export interface Employee {
  id:          string;
  name:        string;
  email:       string;
  role:        string;
  avatar?:     string | null;
  designation?: string | null;
  department?: { id: string; name: string } | null;
  team?:       { id: string; name: string } | null;
}

export interface Lead {
  id:     string;
  name:   string;
  role:   string;
  avatar?: string | null;
  departmentId?: string | null;
}

interface Props {
  mode:           "department" | "team";
  // Existing data for edit mode
  existing?: {
    name:        string;
    description?: string | null;
    headId?:     string | null;
    leadId?:     string | null;
    memberIds:   string[];
    departmentId?: string;
  } | null;
  leads:      Lead[];
  employees:  Employee[];
  departments: { id: string; name: string }[];   //new added
  onSubmit:   (fd: FormData) => Promise<{ success: boolean; error?: string }>;
  onClose:    () => void;
}

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar, size = "sm" }: { name: string; avatar?: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function DeptTeamModal({ mode, existing, leads, employees , departments, onSubmit, onClose }: Props) {
  const isEdit       = !!existing;
  const isDept       = mode === "department";
  const label        = isDept ? "Department" : "Team";

  const [name,        setName]        = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [leadId,      setLeadId]      = useState(existing?.headId ?? existing?.leadId ?? "");
  const [memberIds,   setMemberIds]   = useState<Set<string>>(new Set(existing?.memberIds ?? []));
  const [memberSearch, setMemberSearch] = useState("");
  const [error,       setError]       = useState("");
  const [step,        setStep]        = useState<1 | 2>(1);
  const [pending, startTransition]    = useTransition();
  const [departmentId, setDepartmentId] = useState(
  existing?.departmentId ?? ""
);

  const filteredEmployees = useMemo(() =>
    employees.filter(e =>
      !memberSearch ||
      e.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(memberSearch.toLowerCase())
    ),
    [employees, memberSearch]
  );
const filteredLeads = leads.filter(
  (lead) => lead.departmentId === departmentId
);
  function toggleMember(id: string) {
    setMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (memberIds.size === employees.length) {
      setMemberIds(new Set());
    } else {
      setMemberIds(new Set(employees.map(e => e.id)));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(`${label} name is required`);
    setError("");



    if (!isDept && !departmentId) {
  return setError("Please select a department");
}

    const fd = new FormData();
    fd.set("name",        name.trim());
    fd.set("description", description.trim());
    if (isDept) fd.set("headId", leadId);
    else        fd.set("leadId", leadId);
    fd.set("memberIds", JSON.stringify(Array.from(memberIds)));
    if (!isDept) {
    fd.set("departmentId", departmentId);
    }
    startTransition(async () => {
      const res = await onSubmit(fd);
      if (res.success) onClose();
      else setError(res.error ?? "Something went wrong");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEdit ? `Edit ${label}` : `New ${label}`}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2].map(s => (
                <button key={s} onClick={() => { if (s === 2 && !name.trim()) return; setStep(s as 1 | 2); }}
                  className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors",
                    step === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                  )}>
                  {s === 1 ? "Details" : `Members (${memberIds.size})`}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

          {/* ── STEP 1: Details ── */}
          {step === 1 && (
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  {label} name *
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={isDept ? "e.g. Engineering, Sales, Marketing" : "e.g. Frontend Team, Sales Pod A"}
                  autoFocus
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {!isDept && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Description <span className="text-muted-foreground/60">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What does this team work on?"
                    rows={2}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              )}








              {!isDept && (
  <div>
    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
      Department *
    </label>

    <select
      value={departmentId}
      onChange={(e) => {setDepartmentId(e.target.value); setLeadId(""); }}
      className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background"
    >
      <option value="">Select Department</option>

      {departments.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </select>
  </div>
)}









              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  <Crown size={11} className="inline text-amber-500 mr-1" />
                  {isDept ? "Department head" : "Team lead"}{" "}
                  <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <select
                  value={leadId}
                  onChange={e => setLeadId(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">No {isDept ? "head" : "lead"} assigned</option>
                  {filteredLeads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.role.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
                  <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Members ── */}
          {step === 2 && (
            <div className="flex flex-col flex-1 overflow-hidden p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1">
                  <Search size={13} className="text-muted-foreground flex-shrink-0" />
                  <input
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    placeholder="Search employees..."
                    className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
                  />
                </div>
                <button type="button" onClick={toggleAll}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
                  {memberIds.size === employees.length ? "Deselect all" : "Select all"}
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-2">
                {memberIds.size} selected · {filteredEmployees.length} showing
              </p>

              <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                {filteredEmployees.map(emp => {
                  const selected = memberIds.has(emp.id);
                  const existing = isDept ? emp.department : emp.team;
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => toggleMember(emp.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left",
                        selected
                          ? "border-primary/40 bg-primary/5"
                          : "border-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors",
                        selected ? "bg-primary border-primary" : "border-border"
                      )}>
                        {selected && <Check size={11} className="text-white" />}
                      </div>
                      <Avatar name={emp.name} avatar={emp.avatar} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{emp.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {emp.designation || emp.role.replace("_", " ")}
                          {existing && (
                            <span className="ml-1 text-amber-500">· {existing.name}</span>
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No employees found</p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 p-5 border-t border-border flex-shrink-0">
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)}
                className="text-sm px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
                ← Back
              </button>
            ) : (
              <button type="button" onClick={onClose}
                className="text-sm px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
            )}

            {step === 1 && (
              <button type="button" onClick={() => { if (!name.trim()) return setError("Name is required"); setStep(2); }}
                className="flex-1 text-sm py-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors font-medium">
                Next: Add Members →
              </button>
            )}

            <button type="submit" disabled={pending}
              className="flex-1 text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {pending
                ? (isEdit ? "Saving..." : "Creating...")
                : (isEdit ? `Save ${label}` : `Create ${label} (${memberIds.size} members)`)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
