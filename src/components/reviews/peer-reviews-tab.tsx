// src/components/reviews/peer-reviews-tab.tsx
"use client";

import { useState, useTransition } from "react";
import { Users2, Star, Send, CheckCircle2, AlertCircle, Lock, Sparkles } from "lucide-react";
import { submitPeerReview, requestPeerReview } from "@/actions/peer-reviews.actions";
import { LockedBanner } from "@/components/shared/primium-gate";
import { canUseFeature } from "@/lib/plan-config";
import type { Plan }     from "@/lib/plan-config";

function cn(...c: (string|false|undefined)[]) { return c.filter(Boolean).join(" "); }

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}>
          <Star size={20} className={cn("transition-colors",
            (hover || value) >= s ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
          )}/>
        </button>
      ))}
      <span className="text-sm font-bold ml-1">{value}/5</span>
    </div>
  );
}

type Peer = { id: string; name: string; avatar?: string|null; designation?: string|null };
type PeerReview = {
  id: string; rating: number; reviewPeriod: string; strengths?: string|null;
  feedback?: string|null; aiSummary?: string|null; createdAt: Date;
  reviewer: { name: string; avatar?: string|null };
};

function Avatar({ name, avatar, size = "md" }: { name: string; avatar?: string|null; size?: "sm"|"md" }) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`}/>;
  return <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>{name.slice(0,2).toUpperCase()}</div>;
}

export function PeerReviewsTab({
  plan, peers, myPeerReviews,
}: {
  plan:          Plan;
  peers:         Peer[];
  myPeerReviews: PeerReview[];
}) {
  const [tab,          setTab]     = useState<"received"|"give">("received");
  const [selectedPeer, setPeer]    = useState("");
  const [rating,       setRating]  = useState(3);
  const [period,       setPeriod]  = useState(`Q${Math.floor(new Date().getMonth()/3)+1} ${new Date().getFullYear()}`);
  const [strengths,    setStr]     = useState("");
  const [feedback,     setFb]      = useState("");
  const [error,        setError]   = useState("");
  const [toast, setToast]          = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [pending, start]           = useTransition();

  const canUse = canUseFeature(plan, "peer360Reviews");

  function showToast(msg: string, type: "success"|"error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleSubmit() {
    if (!selectedPeer) return setError("Select a peer to review");
    setError("");
    const fd = new FormData();
    fd.set("revieweeId",   selectedPeer);
    fd.set("rating",       String(rating));
    fd.set("reviewPeriod", period);
    fd.set("strengths",    strengths);
    fd.set("feedback",     feedback);
    start(async () => {
      const res = await submitPeerReview(fd);
      if (res.success) {
        showToast(res.message!, "success");
        setPeer(""); setRating(3); setStr(""); setFb("");
      } else {
        setError(res.error);
      }
    });
  }

  if (!canUse) {
    return (
      <LockedBanner
        requiredPlan="ENTERPRISE"
        label="360° Peer Reviews"
        description="Let employees review each other for comprehensive 360° feedback. Available on Enterprise plan."
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {[
          { id: "received", label: `Reviews received (${myPeerReviews.length})` },
          { id: "give",     label: "Give a peer review" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all",
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Received reviews */}
      {tab === "received" && (
        <div className="space-y-3">
          {myPeerReviews.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Users2 size={32} className="text-muted-foreground mx-auto mb-3"/>
              <p className="text-sm font-medium text-foreground">No peer reviews yet</p>
              <p className="text-xs text-muted-foreground mt-1">Ask colleagues to review you this quarter</p>
            </div>
          ) : myPeerReviews.map(r => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={r.reviewer.name} avatar={r.reviewer.avatar}/>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{r.reviewer.name}</p>
                  <p className="text-xs text-muted-foreground">{r.reviewPeriod}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}/>
                  ))}
                </div>
              </div>
              {r.aiSummary && (
                <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg mb-3">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wide flex items-center gap-1 mb-1">
                    <Sparkles size={10}/> Summary
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">{r.aiSummary}</p>
                </div>
              )}
              {r.strengths && <p className="text-xs text-muted-foreground"><strong className="text-emerald-600">Strengths:</strong> {r.strengths}</p>}
              {r.feedback  && <p className="text-xs text-muted-foreground mt-1"><strong>Feedback:</strong> {r.feedback}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Give review form */}
      {tab === "give" && (
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Select colleague *</label>
            <select value={selectedPeer} onChange={e => setPeer(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <option value="">Choose a colleague...</option>
              {peers.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.designation ? ` — ${p.designation}` : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Review period *</label>
            <input value={period} onChange={e => setPeriod(e.target.value)} placeholder="Q2 2026"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Rating *</label>
            <div className="p-3 bg-muted/40 rounded-lg">
              <StarRating value={rating} onChange={setRating}/>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Strengths</label>
            <textarea value={strengths} onChange={e => setStr(e.target.value)} rows={2}
              placeholder="What does this person do really well?"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"/>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Feedback</label>
            <textarea value={feedback} onChange={e => setFb(e.target.value)} rows={3}
              placeholder="Any suggestions for growth?"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"/>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
              <AlertCircle size={13} className="flex-shrink-0"/> {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={pending}
            className="w-full text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            <Send size={14}/>
            {pending ? "Submitting..." : "Submit peer review"}
          </button>
        </div>
      )}

      {toast && (
        <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
          {toast.type === "success" ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}