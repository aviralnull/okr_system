"use client";
import { useState, useTransition } from "react";
import {
  Target, Calendar, Users2, Activity,
  MessageSquare, ChevronLeft, Edit3,
  AlertTriangle, Clock, Send, MoreHorizontal,
} from "lucide-react";
import {
  logKeyResultProgress,
  addComment,
  updateObjectiveStatus,
} from "@/actions/objectives.actions";
import type { ObjectiveDetail } from "@/actions/objectives.actions";

const STATUS_COLOR: Record<string, string> = {
  ON_TRACK: "#10b981", AT_RISK: "#f59e0b",
  BEHIND: "#ef4444", COMPLETED: "#6366f1", NOT_STARTED: "#94a3b8",
};
const STATUS_LABEL: Record<string, string> = {
  ON_TRACK: "On Track", AT_RISK: "At Risk",
  BEHIND: "Behind", COMPLETED: "Completed", NOT_STARTED: "Not Started",
};
const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#6366f1", LOW: "#94a3b8",
};
const STATUS_LIST = ["NOT_STARTED", "ON_TRACK", "AT_RISK", "BEHIND", "COMPLETED"] as const;

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar, size = "md" }: {
  name: string; avatar?: string | null; size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "w-6 h-6 text-[9px]" : size === "lg" ? "w-12 h-12 text-base" : "w-8 h-8 text-[11px]";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Key Result Card ───────────────────────────────────────────
function KRCard({ kr, canEdit }: {
  kr: NonNullable<ObjectiveDetail>["keyResults"][number];
  canEdit: boolean;
}) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [newValue, setNewValue]     = useState(String(kr.currentValue));
  const [note, setNote]             = useState("");
  const [error, setError]           = useState("");
  const [pending, startTransition]  = useTransition();

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const val = Number(newValue);
    if (isNaN(val) || val < 0) return setError("Enter a valid number");
    setError("");
    const fd = new FormData();
    fd.set("keyResultId", kr.id);
    fd.set("value", String(val));
    fd.set("note", note);
    startTransition(async () => {
      const res = await logKeyResultProgress(fd);
      if (res.success) { setShowUpdate(false); setNote(""); }
      else setError(res.error);
    });
  }

  const progressColor =
    kr.progress >= 100 ? "#10b981"
    : kr.progress >= 60 ? "#6366f1"
    : kr.progress >= 30 ? "#f59e0b"
    : "#ef4444";

  return (
    <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{kr.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {kr.currentValue} / {kr.targetValue} {kr.unit ?? ""}
          </p>
        </div>
        <p className="text-lg font-bold flex-shrink-0" style={{ color: progressColor }}>
          {Math.round(kr.progress)}%
        </p>
      </div>

      <div className="h-2 bg-background rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(kr.progress, 100)}%`, background: progressColor }} />
      </div>

      {kr.progressLogs.length > 0 && (
        <div className="space-y-1.5 mb-3 border-t border-border/50 pt-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Recent updates</p>
          {kr.progressLogs.slice(0, 3).map((log, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span className="text-muted-foreground flex-shrink-0">
                {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
              <span className="font-medium">{log.value} {kr.unit}</span>
              {log.note && <span className="text-muted-foreground truncate">— {log.note}</span>}
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        showUpdate ? (
          <form onSubmit={handleUpdate} className="space-y-2 border-t border-border/50 pt-3">
            <div className="flex gap-2">
              <input type="number" value={newValue} onChange={e => setNewValue(e.target.value)}
                placeholder={`New value (current: ${kr.currentValue})`} min="0" step="any"
                className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              <span className="text-xs text-muted-foreground self-center flex-shrink-0">/ {kr.targetValue} {kr.unit}</span>
            </div>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)"
              className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowUpdate(false)}
                className="flex-1 text-xs py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" disabled={pending}
                className="flex-1 text-xs py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                {pending ? "Saving..." : "Update"}
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowUpdate(true)}
            className="w-full text-xs py-1.5 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5">
            <Edit3 size={11} /> Log progress
          </button>
        )
      )}
    </div>
  );
}

// ── Comment Section ───────────────────────────────────────────
function CommentSection({ comments, objectiveId, currentUserId }: {
  comments: NonNullable<ObjectiveDetail>["comments"];
  objectiveId: string;
  currentUserId: string;
}) {
  const [comment, setComment]      = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError]          = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    const text = comment.trim();
    setComment(""); setError("");
    startTransition(async () => {
      const res = await addComment(objectiveId, text);
      if (!res.success) { setError(res.error); setComment(text); }
    });
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No comments yet</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-3">
              <Avatar name={c.user.name} avatar={c.user.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", c.userId === currentUserId ? "text-primary" : "text-foreground")}>
                    {c.user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-border">
        <input value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        <button type="submit" disabled={pending || !comment.trim()}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0">
          <Send size={14} />
        </button>
      </form>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export function ObjectiveDetailClient({
  objective, currentUserId, canEdit, isManagerPlus,
}: {
  objective:     NonNullable<ObjectiveDetail>;
  currentUserId: string;
  canEdit:       boolean;
  isManagerPlus: boolean;
}) {
  const [tab, setTab]               = useState<"keyresults" | "activity" | "comments">("keyresults");
  const [statusOpen, setStatusOpen] = useState(false);
  const [pending, startTransition]  = useTransition();

  function handleStatusChange(status: typeof STATUS_LIST[number]) {
    setStatusOpen(false);
    startTransition(async () => { await updateObjectiveStatus(objective.id, status); });
  }

  const daysLeft  = Math.ceil((new Date(objective.dueDate).getTime() - Date.now()) / 86400000);
  const isOverdue = daysLeft < 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      <a href="/objectives" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft size={13} /> Back to objectives
      </a>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Target size={18} className="text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <div className="relative">
                    <button
                      onClick={() => isManagerPlus && setStatusOpen(v => !v)}
                      className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5"
                      style={{ background: `${STATUS_COLOR[objective.status]}18`, color: STATUS_COLOR[objective.status] }}>
                      {STATUS_LABEL[objective.status]}
                      {isManagerPlus && <MoreHorizontal size={11} />}
                    </button>
                    {statusOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                        <div className="absolute left-0 top-8 z-20 bg-card border border-border rounded-xl shadow-lg py-1 w-36">
                          {STATUS_LIST.map(s => (
                            <button key={s} onClick={() => handleStatusChange(s)} disabled={pending}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[s] }} />
                              {STATUS_LABEL[s]}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: `${PRIORITY_COLOR[objective.priority]}18`, color: PRIORITY_COLOR[objective.priority] }}>
                    {objective.priority}
                  </span>
                  {objective.team && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users2 size={11} /> {objective.team.name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{objective.quarter}</span>
                </div>

                <h1 className="text-lg font-bold text-foreground mb-1">{objective.title}</h1>
                {objective.description && <p className="text-sm text-muted-foreground">{objective.description}</p>}
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-3xl font-bold" style={{ color: STATUS_COLOR[objective.status] }}>
                  {Math.round(objective.progress)}%
                </p>
                <p className="text-xs text-muted-foreground">complete</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${objective.progress}%`, background: STATUS_COLOR[objective.status] }} />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-4 flex-wrap text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar name={objective.owner.name} avatar={objective.owner.avatar} size="sm" />
                <span className="font-medium text-foreground">{objective.owner.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={11} />
                {new Date(objective.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                {" → "}
                {new Date(objective.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div className={cn("flex items-center gap-1 font-medium",
                isOverdue ? "text-red-500" : daysLeft <= 7 ? "text-amber-500" : ""
              )}>
                <Clock size={11} />
                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {[
          { id: "keyresults", label: "Key Results", count: objective.keyResults.length },
          { id: "activity",   label: "Activity",    count: objective.progressUpdates.length },
          { id: "comments",   label: "Comments",    count: objective.comments.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all outline-none",
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {t.label}
            {t.count > 0 && (
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                tab === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Key Results */}
      {tab === "keyresults" && (
        <div className="space-y-3">
          {objective.keyResults.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Target size={28} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No key results added</p>
            </div>
          ) : (
            objective.keyResults.map(kr => <KRCard key={kr.id} kr={kr} canEdit={canEdit} />)
          )}
        </div>
      )}

      {/* Activity */}
      {tab === "activity" && (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {objective.progressUpdates.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={28} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            objective.progressUpdates.map(update => (
              <div key={update.id} className="flex items-start gap-3 p-4">
                <Avatar name={update.user.name} avatar={update.user.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">{update.user.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(update.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {update.progress}%
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{update.content}</p>
                  {update.blocker && (
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <AlertTriangle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600 dark:text-amber-400">{update.blocker}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Comments */}
      {tab === "comments" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <CommentSection
            comments={objective.comments}
            objectiveId={objective.id}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </div>
  );
}
