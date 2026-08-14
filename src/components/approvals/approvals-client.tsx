
"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2, XCircle, Target, Calendar,
  ChevronDown, ChevronUp, AlertCircle, Clock,
} from "lucide-react";
import { approveOKR, rejectOKR } from "@/actions/okr-approval.actions";

function cn(...c: (string|false|undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar }: { name: string; avatar?: string|null }) {
  if (avatar) return <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  return <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">{name.slice(0,2).toUpperCase()}</div>;
}

function Toast({ msg, type }: { msg: string; type: "success"|"error" }) {
  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
      {type === "success" ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
      {msg}
    </div>
  );
}

type PendingOKR = {
  id: string; title: string; description?: string|null;
  quarter: string; priority: string; dueDate: Date;
  owner: { name: string; avatar?: string|null; designation?: string|null };
  keyResults: { id: string; title: string; targetValue: number; unit?: string|null }[];
};

function ApprovalCard({ obj, onToast, onRemove }: {
  obj:      PendingOKR;
  onToast:  (msg: string, type: "success"|"error") => void;
  onRemove: (id: string) => void;
}) {
  const [expanded,    setExpanded]   = useState(false);
  const [showReject,  setShowReject] = useState(false);
  const [reason,      setReason]     = useState("");
  const [pending, startTransition]   = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const res = await approveOKR(obj.id);
      if (res.success) { onToast("OKR approved ✅", "success"); onRemove(obj.id); }
      else onToast(res.error, "error");
    });
  }

  function handleReject() {
    if (!reason.trim()) return;
    startTransition(async () => {
      const res = await rejectOKR(obj.id, reason);
      if (res.success) { onToast("OKR returned for revision", "success"); onRemove(obj.id); }
      else onToast(res.error, "error");
    });
  }

  const PRIORITY_COLOR: Record<string,string> = {
    CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#6366f1", LOW: "#94a3b8",
  };

  return (
    <div className="rounded-xl border border-amber-200/50 dark:border-amber-800/30 bg-card overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1">
                <Clock size={10}/> Pending approval
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: `${PRIORITY_COLOR[obj.priority]}18`, color: PRIORITY_COLOR[obj.priority] }}>
                {obj.priority}
              </span>
              <span className="text-xs text-muted-foreground">{obj.quarter}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{obj.title}</p>
            {obj.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{obj.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <Avatar name={obj.owner.name} avatar={obj.owner.avatar} />
            <span>{obj.owner.name}</span>
            {obj.owner.designation && <span className="text-muted-foreground/60">· {obj.owner.designation}</span>}
          </div>
          <span className="flex items-center gap-1"><Calendar size={11}/>
            Due {new Date(obj.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1"><Target size={11}/>{obj.keyResults.length} Key Results</span>
        </div>
      </div>

      {/* KR expand */}
      {obj.keyResults.length > 0 && (
        <>
          <button onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-border text-xs text-muted-foreground hover:bg-muted/30 transition-colors">
            {expanded ? <><ChevronUp size={13}/>Hide key results</> : <><ChevronDown size={13}/>View {obj.keyResults.length} key results</>}
          </button>
          {expanded && (
            <div className="border-t border-border p-4 bg-muted/20 space-y-2">
              {obj.keyResults.map((kr, i) => (
                <div key={kr.id} className="flex items-start gap-2.5 p-2.5 bg-card rounded-lg border border-border">
                  <span className="text-[10px] font-bold w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{kr.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Target: {kr.targetValue}{kr.unit ? ` ${kr.unit}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="border-t border-border p-4 space-y-3">
        {showReject ? (
          <div className="space-y-2">
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder="Tell the employee what needs to be revised..."
              className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-red-400/20 resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowReject(false)}
                className="flex-1 text-xs py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={handleReject} disabled={pending || !reason.trim()}
                className="flex-1 text-xs py-2 rounded-lg bg-red-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {pending ? "Returning..." : "Return for revision"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setShowReject(true)} disabled={pending}
              className="flex-1 text-sm py-2.5 rounded-lg border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-1.5 font-medium">
              <XCircle size={14}/> Reject
            </button>
            <button onClick={handleApprove} disabled={pending}
              className="flex-1 text-sm py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14}/> {pending ? "Approving..." : "Approve"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApprovalsClient({ pending: initialPending }: { pending: PendingOKR[] }) {
  const [pending, setPending] = useState(initialPending);
  const [toast, setToast]     = useState<{msg:string;type:"success"|"error"}|null>(null);

  function showToast(msg: string, type: "success"|"error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function removeOKR(id: string) {
    setPending(prev => prev.filter(o => o.id !== id));
  }

  return (
    <>
      <div className="space-y-4 max-w-2xl">
        {pending.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-3"/>
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No OKRs pending your approval</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0"/>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <span className="font-semibold">{pending.length} OKR{pending.length > 1 ? "s" : ""}</span> waiting for your review
              </p>
            </div>
            {pending.map(obj => (
              <ApprovalCard key={obj.id} obj={obj} onToast={showToast} onRemove={removeOKR}/>
            ))}
          </>
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </>
  );
}
