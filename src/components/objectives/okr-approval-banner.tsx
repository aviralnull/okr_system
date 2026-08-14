"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { approveOKR, rejectOKR, submitForApproval } from "@/actions/okr-approval.actions";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// ── For EMPLOYEE — submit for approval ───────────────────────
export function SubmitApprovalButton({ objectiveId, plan }: {
  objectiveId: string; plan: string;
}) {
  const [pending, start] = useTransition();
  const [done,    setDone] = useState(false);
  const [error,   setError] = useState("");

  if (!["BUSINESS", "ENTERPRISE"].includes(plan)) return null;
  if (done) return (
    <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg">
      <Clock size={13} /> Pending manager approval
    </div>
  );

  return (
    <div className="space-y-1">
      <button onClick={() => start(async () => {
        const res = await submitForApproval(objectiveId);
        if (res.success) setDone(true);
        else setError(res.error);
      })}
        disabled={pending}
        className="text-xs px-3 py-2 rounded-lg bg-amber-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5">
        <Clock size={13} />
        {pending ? "Submitting..." : "Submit for approval"}
      </button>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ── For MANAGER — approve or reject ──────────────────────────
export function ApprovalActions({ objectiveId, ownerName, plan }: {
  objectiveId: string; ownerName: string; plan: string;
}) {
  const [pending,   start]    = useTransition();
  const [rejected,  setRej]   = useState(false);
  const [reason,    setReason] = useState("");
  const [showReject,setShow]   = useState(false);
  const [done,      setDone]   = useState(false);
  const [error,     setError]  = useState("");

  if (!["BUSINESS", "ENTERPRISE"].includes(plan)) return null;
  if (done) return (
    <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-lg">
      <CheckCircle2 size={13} /> OKR approved
    </div>
  );

  return (
    <div className="rounded-xl border border-amber-200/50 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <Clock size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {ownerName} submitted this OKR for your approval
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review the objective and key results before approving
          </p>
        </div>
      </div>

      {!showReject ? (
        <div className="flex gap-2">
          <button onClick={() => start(async () => {
            const res = await approveOKR(objectiveId);
            if (res.success) setDone(true);
            else setError(res.error);
          })}
            disabled={pending}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            <CheckCircle2 size={13} />
            {pending ? "Approving..." : "Approve"}
          </button>
          <button onClick={() => setShow(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <XCircle size={13} /> Request revision
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
            placeholder="What needs to be changed?"
            className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 resize-none text-xs" />
          <div className="flex gap-2">
            <button onClick={() => start(async () => {
              if (!reason.trim()) return setError("Enter a reason");
              const res = await rejectOKR(objectiveId, reason);
              if (res.success) { setRej(true); setShow(false); }
              else setError(res.error);
            })}
              disabled={pending || !reason.trim()}
              className="text-xs px-3 py-2 rounded-lg bg-red-500 text-white font-medium hover:opacity-90 disabled:opacity-50">
              {pending ? "Sending..." : "Send back for revision"}
            </button>
            <button onClick={() => setShow(false)}
              className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

// ── Pending approval badge ────────────────────────────────────
export function PendingApprovalBadge() {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1.5">
      <Clock size={11} /> Pending approval
    </span>
  );
}
