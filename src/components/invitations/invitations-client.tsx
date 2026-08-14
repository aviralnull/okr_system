// src/components/invitations/invitations-client.tsx
"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Mail, Plus, RefreshCw, X, Trash2,
  CheckCircle2, AlertCircle, Clock, Ban,
  Search, Filter, UserPlus, Send,
} from "lucide-react";
import {
  sendInvitation, resendInvitation,
  cancelInvitation, deleteInvitation,
} from "@/actions/invitation.actions";
import type { InvitationItem } from "@/actions/invitation.actions";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// Status config
const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "#f59e0b",
    bg:    "#f59e0b15",
    icon:  Clock,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "#10b981",
    bg:    "#10b98115",
    icon:  CheckCircle2,
  },
  EXPIRED: {
    label: "Expired",
    color: "#94a3b8",
    bg:    "#94a3b815",
    icon:  AlertCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#ef4444",
    bg:    "#ef444415",
    icon:  Ban,
  },
};

const ROLE_COLOR: Record<string, { color: string; bg: string }> = {
  ORG_ADMIN: { color: "#6366f1", bg: "#6366f115" },
  MANAGER:   { color: "#f59e0b", bg: "#f59e0b15" },
  HR:        { color: "#10b981", bg: "#10b98115" },
  EMPLOYEE:  { color: "#94a3b8", bg: "#94a3b815" },
};

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4",
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    )}>
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  );
}

// ── Invite form modal ─────────────────────────────────────────
function InviteModal({ onClose, onToast }: {
  onClose:  () => void;
  onToast:  (msg: string, type: "success" | "error") => void;
}) {
  const [email, setEmail]   = useState("");
  const [role,  setRole]    = useState("EMPLOYEE");
  const [error, setError]   = useState("");
  const [pending, start]    = useTransition();

  function handleSubmit() {
    if (!email.trim()) return setError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Invalid email address");
    setError("");

    const fd = new FormData();
    fd.set("email", email.trim().toLowerCase());
    fd.set("role", role);

    start(async () => {
      const res = await sendInvitation(fd);
      if (res.success) {
        onToast(res.message ?? "Invitation sent!", "success");
        onClose();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Invite member</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              They'll receive an email with a signup link
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Email address *
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="colleague@company.com" autoFocus
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Role *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "EMPLOYEE", label: "Employee",  desc: "Track OKRs" },
                { id: "MANAGER",  label: "Manager",   desc: "Lead teams" },
                { id: "HR",       label: "HR",        desc: "Manage org" },
              ].map(r => (
                <button key={r.id} type="button" onClick={() => setRole(r.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    role === r.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}>
                  <p className={cn("text-xs font-semibold", role === r.id ? "text-primary" : "text-foreground")}>
                    {r.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
              <AlertCircle size={13} className="flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 text-sm py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={pending}
              className="flex-1 text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {pending ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={13} />
                  Send invite
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Invitation row ────────────────────────────────────────────
function InvitationRow({
  invite, onToast,
}: {
  invite:  InvitationItem;
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const [pending, start] = useTransition();
  const config  = STATUS_CONFIG[invite.status];
  const Icon    = config.icon;
  const rColor  = ROLE_COLOR[invite.role] ?? ROLE_COLOR.EMPLOYEE;
  const expired = new Date(invite.expiresAt) < new Date() && invite.status === "PENDING";
  const effectiveStatus = expired ? "EXPIRED" : invite.status;
  const effConfig = STATUS_CONFIG[effectiveStatus];
  const EffIcon   = effConfig.icon;

  async function handleResend() {
    start(async () => {
      const res = await resendInvitation(invite.id);
      onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
    });
  }

  async function handleCancel() {
    start(async () => {
      const res = await cancelInvitation(invite.id);
      onToast(res.success ? "Invitation cancelled" : res.error, res.success ? "success" : "error");
    });
  }

  async function handleDelete() {
    if (!confirm("Delete this invitation record?")) return;
    start(async () => {
      const res = await deleteInvitation(invite.id);
      onToast(res.success ? "Deleted" : res.error, res.success ? "success" : "error");
    });
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl border transition-all",
      effectiveStatus === "ACCEPTED" ? "border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-950/10"
      : effectiveStatus === "PENDING" ? "border-border bg-card"
      : "border-border bg-muted/20 opacity-70"
    )}>
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: rColor.bg, color: rColor.color }}>
        {invite.email.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{invite.email}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: rColor.bg, color: rColor.color }}>
            {invite.role.replace("_", " ")}
          </span>
          <span className="text-xs text-muted-foreground">
            Invited {new Date(invite.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
          {effectiveStatus === "PENDING" && (
            <span className="text-xs text-muted-foreground">
              · Expires {new Date(invite.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full flex-shrink-0"
        style={{ background: effConfig.bg, color: effConfig.color }}>
        <EffIcon size={11} />
        {effConfig.label}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {(effectiveStatus === "PENDING" || effectiveStatus === "EXPIRED") && (
          <button onClick={handleResend} disabled={pending}
            title="Resend invite"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50">
            <RefreshCw size={13} className={pending ? "animate-spin" : ""} />
          </button>
        )}
        {effectiveStatus === "PENDING" && (
          <button onClick={handleCancel} disabled={pending}
            title="Cancel invite"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors text-muted-foreground hover:text-amber-500 disabled:opacity-50">
            <X size={13} />
          </button>
        )}
        {(effectiveStatus === "CANCELLED" || effectiveStatus === "ACCEPTED") && (
          <button onClick={handleDelete} disabled={pending}
            title="Delete record"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-50">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export function InvitationsClient({ invitations: initial }: {
  invitations: InvitationItem[];
}) {
  const [invitations, setInvitations] = useState(initial);
  const [showModal,   setShowModal]   = useState(false);
  const [search,      setSearch]      = useState("");
  const [statusFilter, setStatus]     = useState("ALL");
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Stats
  const stats = useMemo(() => ({
    total:     invitations.length,
    pending:   invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) >= new Date()).length,
    accepted:  invitations.filter(i => i.status === "ACCEPTED").length,
    expired:   invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) < new Date()).length,
    cancelled: invitations.filter(i => i.status === "CANCELLED").length,
  }), [invitations]);

  // Filtered list
  const filtered = useMemo(() => {
    return invitations.filter(inv => {
      const q = search.toLowerCase();
      const matchSearch = !q || inv.email.toLowerCase().includes(q);
      const effectiveStatus = new Date(inv.expiresAt) < new Date() && inv.status === "PENDING"
        ? "EXPIRED" : inv.status;
      const matchStatus = statusFilter === "ALL" || effectiveStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invitations, search, statusFilter]);

  const STATUS_TABS = [
    { id: "ALL",       label: "All",       count: stats.total },
    { id: "PENDING",   label: "Pending",   count: stats.pending },
    { id: "ACCEPTED",  label: "Accepted",  count: stats.accepted },
    { id: "EXPIRED",   label: "Expired",   count: stats.expired },
    { id: "CANCELLED", label: "Cancelled", count: stats.cancelled },
  ];

  return (
    <>
      <div className="space-y-5 max-w-3xl">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total sent",  value: stats.total,     color: "#6366f1" },
            { label: "Pending",     value: stats.pending,   color: "#f59e0b" },
            { label: "Accepted",    value: stats.accepted,  color: "#10b981" },
            { label: "Expired",     value: stats.expired,   color: "#94a3b8" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full" />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={13} className="text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Invite button */}
          <button onClick={() => setShowModal(true)}
            className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
            <UserPlus size={14} /> Invite member
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-0 border-b border-border overflow-x-auto">
          {STATUS_TABS.map(t => (
            <button key={t.id} onClick={() => setStatus(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap",
                statusFilter === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              {t.label}
              {t.count > 0 && (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  statusFilter === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Mail size={36} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              {invitations.length === 0 ? "No invitations sent yet" : "No invitations match your filters"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {invitations.length === 0
                ? "Invite team members to get started"
                : "Try adjusting your search or filter"}
            </p>
            {invitations.length === 0 && (
              <button onClick={() => setShowModal(true)}
                className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Send first invite
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(inv => (
              <InvitationRow key={inv.id} invite={inv} onToast={showToast} />
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {invitations.length} invitations
        </p>
      </div>

      {/* Invite modal */}
      {showModal && (
        <InviteModal
          onClose={() => setShowModal(false)}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}