// "use client";

// import { useState, useTransition, useMemo } from "react";
// import {
//   Star, Plus, Edit, Trash2, Search, X,
//   CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
//   MoreHorizontal, Sparkles, Building2, Users2,
// } from "lucide-react";
// import { createReview, editReview, deleteReview } from "@/actions/review.actions";
// import type { ReviewListItem, ReviewFormData } from "@/actions/review.actions";

// function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// function Avatar({ name, avatar, size = "md" }: {
//   name: string; avatar?: string | null; size?: "sm" | "md" | "lg";
// }) {
//   const dim = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-xs";
//   if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
//   return (
//     <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
//       {name.slice(0, 2).toUpperCase()}
//     </div>
//   );
// }

// function StarRating({ value, onChange, readonly = false }: {
//   value: number; onChange?: (v: number) => void; readonly?: boolean;
// }) {
//   const [hover, setHover] = useState(0);
//   return (
//     <div className="flex items-center gap-1">
//       {[1, 2, 3, 4, 5].map(s => (
//         <button key={s} type={readonly ? "button" : "button"}
//           disabled={readonly}
//           onClick={() => !readonly && onChange?.(s)}
//           onMouseEnter={() => !readonly && setHover(s)}
//           onMouseLeave={() => !readonly && setHover(0)}
//           className={cn("transition-colors", readonly ? "cursor-default" : "cursor-pointer")}>
//           <Star size={18}
//             className={cn(
//               "transition-colors",
//               (hover || value) >= s ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
//             )}
//           />
//         </button>
//       ))}
//       <span className="text-sm font-bold ml-1">{value}/5</span>
//     </div>
//   );
// }

// function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
//   return (
//     <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
//       type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
//     )}>
//       {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
//       {msg}
//     </div>
//   );
// }


// function ReviewModal({
//   review, formData, onClose,
// }: {
//   review?:  ReviewListItem | null;
//   formData: ReviewFormData;
//   onClose:  () => void;
// }) {
//   const isEdit = !!review;
//   const [employeeId,   setEmployee]  = useState(review?.employeeId ?? "");
//   const [rating,       setRating]    = useState(review?.rating ?? 3);
//   const [reviewPeriod, setPeriod]    = useState(review?.reviewPeriod ?? getCurrentPeriod());
//   const [strengths,    setStrengths] = useState(review?.strengths ?? "");
//   const [weakness,     setWeakness]  = useState(review?.weakness ?? "");
//   const [feedback,     setFeedback]  = useState(review?.feedback ?? "");
//   const [error,        setError]     = useState("");
//   const [pending, startTransition]   = useTransition();

//   function getCurrentPeriod() {
//     const q = Math.floor(new Date().getMonth() / 3) + 1;
//     return `Q${q} ${new Date().getFullYear()}`;
//   }

//   // ✅ Single submit handler — no duplication
//   function handleSubmit() {
//     if (!employeeId)   return setError("Select an employee");
//     if (!reviewPeriod) return setError("Enter review period");
//     setError("");

//     const fd = new FormData();
//     fd.set("employeeId",   employeeId);
//     fd.set("rating",       String(rating));
//     fd.set("reviewPeriod", reviewPeriod);
//     fd.set("strengths",    strengths);
//     fd.set("weakness",     weakness);
//     fd.set("feedback",     feedback);

//     startTransition(async () => {
//       const res = isEdit
//         ? await editReview(review!.id, fd)
//         : await createReview(fd);
//       if (res.success) onClose();
//       else setError(res.error);
//     });
//   }

//   const selectedEmployee = formData.employees.find(e => e.id === employeeId);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

//         {/* Header */}
//         <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
//           <div>
//             <h2 className="text-base font-semibold text-foreground">
//               {isEdit ? "Edit Review" : "New Performance Review"}
//             </h2>
//             <p className="text-xs text-muted-foreground mt-0.5">
//               {isEdit ? "Update review details" : "Submit a performance review for a team member"}
//             </p>
//           </div>
//           <button onClick={onClose}
//             className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
//             <X size={16} />
//           </button>
//         </div>

//         {/* Scrollable body */}
//         <div className="overflow-y-auto flex-1 p-5 space-y-4">

//           {/* Employee */}
//           {!isEdit && (
//             <div>
//               <label className="text-xs font-medium text-muted-foreground block mb-1.5">Employee *</label>
//               <select value={employeeId} onChange={e => setEmployee(e.target.value)}
//                 className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
//                 <option value="">Select employee...</option>
//                 {formData.employees.map(e => (
//                   <option key={e.id} value={e.id}>
//                     {e.name} — {e.role.replace("_", " ")}{e.department ? ` · ${e.department.name}` : ""}
//                   </option>
//                 ))}
//               </select>
//               {selectedEmployee && (
//                 <div className="flex items-center gap-2 mt-2 p-2.5 bg-muted/40 rounded-lg">
//                   <Avatar name={selectedEmployee.name} avatar={selectedEmployee.avatar} size="sm" />
//                   <div>
//                     <p className="text-xs font-medium">{selectedEmployee.name}</p>
//                     <p className="text-[10px] text-muted-foreground">
//                       {selectedEmployee.designation || selectedEmployee.role.replace("_", " ")}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Review period */}
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Review Period *</label>
//             <input value={reviewPeriod} onChange={e => setPeriod(e.target.value)}
//               placeholder="e.g. Q2 2026, H1 2026, Annual 2025"
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
//           </div>

//           {/* Rating */}
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Rating *</label>
//             <div className="p-3 bg-muted/40 rounded-lg">
//               <StarRating value={rating} onChange={setRating} />
//               <p className="text-xs text-muted-foreground mt-2">
//                 {rating === 5 ? "🌟 Exceptional" : rating === 4 ? "⭐ Strong" : rating === 3 ? "👍 Satisfactory" : rating === 2 ? "📈 Needs improvement" : "⚠️ Underperforming"}
//               </p>
//             </div>
//           </div>

//           {/* Strengths */}
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">
//               💪 Strengths <span className="text-muted-foreground/60">(optional)</span>
//             </label>
//             <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={2}
//               placeholder="What did this employee do well?"
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
//           </div>

//           {/* Areas to improve */}
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">
//               📈 Areas to improve <span className="text-muted-foreground/60">(optional)</span>
//             </label>
//             <textarea value={weakness} onChange={e => setWeakness(e.target.value)} rows={2}
//               placeholder="What could be improved?"
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
//           </div>

//           {/* Feedback */}
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">
//               💬 Manager feedback <span className="text-muted-foreground/60">(optional)</span>
//             </label>
//             <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
//               placeholder="Any additional comments or goals for next period?"
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
//           </div>

//           {/* AI note */}
//           <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/15 rounded-lg">
//             <Sparkles size={13} className="text-primary flex-shrink-0 mt-0.5" />
//             <p className="text-xs text-muted-foreground">
//               An AI summary will be automatically generated and shown to the employee.
//             </p>
//           </div>

//           {error && (
//             <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
//               <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
//             </div>
//           )}
//         </div>

//         {/* Footer — ✅ single button, single handler */}
//         <div className="flex gap-2 p-5 border-t border-border flex-shrink-0">
//           <button type="button" onClick={onClose}
//             className="flex-1 text-sm py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={pending}
//             className="flex-1 text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
//             {pending
//               ? (isEdit ? "Saving..." : "Submitting...")
//               : (isEdit ? "Save changes" : "Submit review")}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// // ── Review Card ───────────────────────────────────────────────
// function ReviewCard({
//   review, isManagerPlus, currentUserId, formData,
//   onToast,
// }: {
//   review:        ReviewListItem;
//   isManagerPlus: boolean;
//   currentUserId: string;
//   formData?:     ReviewFormData;
//   onToast:       (msg: string, type: "success" | "error") => void;
// }) {
//   const [expanded,   setExpanded]  = useState(false);
//   const [editTarget, setEditTarget] = useState(false);
//   const [menuOpen,   setMenuOpen]  = useState(false);
//   const [pending, startTransition] = useTransition();

//   const canEdit = isManagerPlus && review.reviewerId === currentUserId;

//   function handleDelete() {
//     if (!confirm("Delete this review?")) return;
//     setMenuOpen(false);
//     startTransition(async () => {
//       const res = await deleteReview(review.id);
//       onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
//     });
//   }

//   return (
//     <>
//       <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-sm transition-shadow">
//         {/* Header */}
//         <div className="flex items-start gap-3 p-5">
//           <Avatar name={review.employee.name} avatar={review.employee.avatar} />
//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between gap-3">
//               <div>
//                 <p className="text-sm font-semibold text-foreground">{review.employee.name}</p>
//                 <p className="text-xs text-muted-foreground">
//                   {review.employee.designation || review.employee.department?.name || "—"}
//                 </p>
//               </div>
//               <div className="flex items-center gap-2 flex-shrink-0">
//                 <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
//                   {review.reviewPeriod}
//                 </span>
//                 {isManagerPlus && (
//                   <div className="relative">
//                     <button onClick={() => setMenuOpen(v => !v)}
//                       className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
//                       <MoreHorizontal size={14} />
//                     </button>
//                     {menuOpen && (
//                       <>
//                         <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
//                         <div className="absolute right-0 top-8 z-20 w-32 bg-card border border-border rounded-xl shadow-lg py-1">
//                           {canEdit && (
//                             <button onClick={() => { setEditTarget(true); setMenuOpen(false); }}
//                               className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
//                               <Edit size={12} /> Edit
//                             </button>
//                           )}
//                           <button onClick={handleDelete} disabled={pending}
//                             className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
//                             <Trash2 size={12} /> Delete
//                           </button>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Rating row */}
//             <div className="flex items-center gap-3 mt-2">
//               <StarRating value={review.rating} readonly />
//               <span className="text-xs text-muted-foreground">
//                 by {review.reviewer.name} · {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* AI Summary */}
//         {review.aiSummary && (
//           <div className="mx-5 mb-4 p-3 bg-primary/5 border border-primary/15 rounded-lg">
//             <p className="text-[10px] font-semibold text-primary uppercase tracking-wide flex items-center gap-1 mb-1.5">
//               <Sparkles size={10} /> AI Summary
//             </p>
//             <p className="text-xs text-foreground leading-relaxed">{review.aiSummary}</p>
//           </div>
//         )}

//         {/* Expandable details */}
//         {(review.strengths || review.weakness || review.feedback) && (
//           <>
//             <button onClick={() => setExpanded(v => !v)}
//               className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
//               {expanded ? <><ChevronUp size={13} /> Hide details</> : <><ChevronDown size={13} /> Show details</>}
//             </button>

//             {expanded && (
//               <div className="border-t border-border p-5 space-y-3 bg-muted/20">
//                 {review.strengths && (
//                   <div>
//                     <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">💪 Strengths</p>
//                     <p className="text-xs text-foreground leading-relaxed">{review.strengths}</p>
//                   </div>
//                 )}
//                 {review.weakness && (
//                   <div>
//                     <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1.5">📈 Areas to improve</p>
//                     <p className="text-xs text-foreground leading-relaxed">{review.weakness}</p>
//                   </div>
//                 )}
//                 {review.feedback && (
//                   <div>
//                     <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">💬 Manager feedback</p>
//                     <p className="text-xs text-foreground leading-relaxed">{review.feedback}</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {editTarget && formData && (
//         <ReviewModal review={review} formData={formData} onClose={() => setEditTarget(false)} />
//       )}
//     </>
//   );
// }

// // ── MAIN ──────────────────────────────────────────────────────
// export function ReviewsClient({
//   reviews, formData, stats, isManagerPlus, currentUserId,
// }: {
//   reviews:       ReviewListItem[];
//   formData?:     ReviewFormData;
//   stats?:        { total: number; avgRating: number; byPeriod: { period: string; count: number; avgRating: number }[] };
//   isManagerPlus: boolean;
//   currentUserId: string;
// }) {
//   const [showCreate, setShowCreate] = useState(false);
//   const [search, setSearch]         = useState("");
//   const [periodFilter, setPeriod]   = useState("ALL");
//   const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);

//   function showToast(msg: string, type: "success" | "error") {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   }

//   const periods = useMemo(() =>
//     Array.from(new Set(reviews.map(r => r.reviewPeriod))).sort().reverse(),
//     [reviews]
//   );

//   const filtered = useMemo(() =>
//     reviews.filter(r => {
//       const q = search.toLowerCase();
//       const matchSearch = !q || r.employee.name.toLowerCase().includes(q) || r.reviewer.name.toLowerCase().includes(q);
//       const matchPeriod = periodFilter === "ALL" || r.reviewPeriod === periodFilter;
//       return matchSearch && matchPeriod;
//     }),
//     [reviews, search, periodFilter]
//   );

//   return (
//     <>
//       {/* Stats — manager only */}
//       {isManagerPlus && stats && (
//         <div className="grid grid-cols-3 gap-3">
//           <div className="rounded-xl border border-border bg-card p-4">
//             <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Reviews</p>
//             <p className="text-2xl font-bold text-foreground">{stats.total}</p>
//           </div>
//           <div className="rounded-xl border border-border bg-card p-4">
//             <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Avg Rating</p>
//             <div className="flex items-center gap-2">
//               <p className="text-2xl font-bold text-foreground">{stats.avgRating > 0 ? stats.avgRating : "—"}</p>
//               {stats.avgRating > 0 && <Star size={16} className="text-amber-400 fill-amber-400" />}
//             </div>
//           </div>
//           <div className="rounded-xl border border-border bg-card p-4">
//             <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Review Periods</p>
//             <p className="text-2xl font-bold text-foreground">{stats.byPeriod.length}</p>
//           </div>
//         </div>
//       )}

//       {/* Toolbar */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center">
//         <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
//           <Search size={14} className="text-muted-foreground flex-shrink-0" />
//           <input value={search} onChange={e => setSearch(e.target.value)}
//             placeholder="Search by employee or reviewer..."
//             className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full" />
//           {search && <button onClick={() => setSearch("")}><X size={13} className="text-muted-foreground" /></button>}
//         </div>

//         {periods.length > 1 && (
//           <select value={periodFilter} onChange={e => setPeriod(e.target.value)}
//             className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
//             <option value="ALL">All Periods</option>
//             {periods.map(p => <option key={p} value={p}>{p}</option>)}
//           </select>
//         )}

//         {isManagerPlus && formData && (
//           <button onClick={() => setShowCreate(true)}
//             className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
//             <Plus size={14} /> New Review
//           </button>
//         )}
//       </div>

//       {/* Reviews list */}
//       {filtered.length === 0 ? (
//         <div className="text-center py-16 bg-card border border-border rounded-xl">
//           <Star size={36} className="text-muted-foreground mx-auto mb-3" />
//           <p className="text-sm font-medium text-foreground">
//             {reviews.length === 0 ? "No reviews yet" : "No reviews match your search"}
//           </p>
//           <p className="text-xs text-muted-foreground mt-1">
//             {reviews.length === 0
//               ? (isManagerPlus ? "Submit your first performance review" : "Your manager hasn't submitted a review yet")
//               : "Try adjusting your search"}
//           </p>
//           {reviews.length === 0 && isManagerPlus && formData && (
//             <button onClick={() => setShowCreate(true)}
//               className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
//               Submit Review
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {filtered.map(review => (
//             <ReviewCard
//               key={review.id}
//               review={review}
//               isManagerPlus={isManagerPlus}
//               currentUserId={currentUserId}
//               formData={formData}
//               onToast={showToast}
//             />
//           ))}
//         </div>
//       )}

//       <p className="text-xs text-muted-foreground">
//         Showing {filtered.length} of {reviews.length} reviews
//       </p>

//       {showCreate && formData && (
//         <ReviewModal formData={formData} onClose={() => setShowCreate(false)} />
//       )}

//       {toast && <Toast msg={toast.msg} type={toast.type} />}
//     </>
//   );
// }

// src/components/reviews/reviews-client.tsx
"use client";

import { PeerReviewsTab } from "@/components/reviews/peer-reviews-tab";

import { useState, useTransition, useMemo } from "react";
import {
  Star, Plus, Edit, Trash2, Search, X,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  MoreHorizontal, Sparkles, Building2, Users2,
} from "lucide-react";
import { createReview, editReview, deleteReview } from "@/actions/review.actions";
import type { ReviewListItem, ReviewFormData } from "@/actions/review.actions";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar, size = "md" }: {
  name: string; avatar?: string | null; size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-xs";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function StarRating({ value, onChange, readonly = false }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type={readonly ? "button" : "button"}
          disabled={readonly}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={cn("transition-colors", readonly ? "cursor-default" : "cursor-pointer")}>
          <Star size={18}
            className={cn(
              "transition-colors",
              (hover || value) >= s ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
      <span className="text-sm font-bold ml-1">{value}/5</span>
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    )}>
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  );
}

// ── Review Modal (Create / Edit) ──────────────────────────────
function ReviewModal({
  review, formData, onClose,
}: {
  review?:  ReviewListItem | null;
  formData: ReviewFormData;
  onClose:  () => void;
}) {
  const isEdit = !!review;
  const [employeeId,   setEmployee]   = useState(review?.employeeId ?? "");
  const [rating,       setRating]     = useState(review?.rating ?? 3);
  const [reviewPeriod, setPeriod]     = useState(review?.reviewPeriod ?? getCurrentPeriod());
  const [strengths,    setStrengths]  = useState(review?.strengths ?? "");
  const [weakness,     setWeakness]   = useState(review?.weakness ?? "");
  const [feedback,     setFeedback]   = useState(review?.feedback ?? "");
  const [error,        setError]      = useState("");
  const [pending, startTransition]    = useTransition();

  function getCurrentPeriod() {
    const now = new Date();
    const q   = Math.floor(now.getMonth() / 3) + 1;
    return `Q${q} ${now.getFullYear()}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId)   return setError("Select an employee");
    if (!reviewPeriod) return setError("Enter review period");
    setError("");

    const fd = new FormData();
    fd.set("employeeId",   employeeId);
    fd.set("rating",       String(rating));
    fd.set("reviewPeriod", reviewPeriod);
    fd.set("strengths",    strengths);
    fd.set("weakness",     weakness);
    fd.set("feedback",     feedback);

    startTransition(async () => {
      const res = isEdit
        ? await editReview(review!.id, fd)
        : await createReview(fd);
      if (res.success) onClose();
      else setError(res.error);
    });
  }

  const selectedEmployee = formData.employees.find(e => e.id === employeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEdit ? "Edit Review" : "New Performance Review"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit ? "Update review details" : "Submit a performance review for a team member"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-5 space-y-4">

            {/* Employee select */}
            {!isEdit && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Employee *</label>
                <select value={employeeId} onChange={e => setEmployee(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Select employee...</option>
                  {formData.employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.role.replace("_", " ")}{e.department ? ` · ${e.department.name}` : ""}
                    </option>
                  ))}
                </select>
                {selectedEmployee && (
                  <div className="flex items-center gap-2 mt-2 p-2.5 bg-muted/40 rounded-lg">
                    <Avatar name={selectedEmployee.name} avatar={selectedEmployee.avatar} size="sm" />
                    <div>
                      <p className="text-xs font-medium">{selectedEmployee.name}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedEmployee.designation || selectedEmployee.role.replace("_", " ")}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Review period */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Review Period *</label>
              <input value={reviewPeriod} onChange={e => setPeriod(e.target.value)}
                placeholder="e.g. Q2 2026, H1 2026, Annual 2025"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>

            {/* Rating */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Rating *</label>
              <div className="p-3 bg-muted/40 rounded-lg">
                <StarRating value={rating} onChange={setRating} />
                <p className="text-xs text-muted-foreground mt-2">
                  {rating === 5 ? "🌟 Exceptional" : rating === 4 ? "⭐ Strong" : rating === 3 ? "👍 Satisfactory" : rating === 2 ? "📈 Needs improvement" : "⚠️ Underperforming"}
                </p>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                💪 Strengths <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={2}
                placeholder="What did this employee do well?"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>

            {/* Areas to improve */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                📈 Areas to improve <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <textarea value={weakness} onChange={e => setWeakness(e.target.value)} rows={2}
                placeholder="What could be improved?"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>

            {/* Manager feedback */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                💬 Manager feedback <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
                placeholder="Any additional comments or goals for next period?"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>

            {/* AI summary note */}
            <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/15 rounded-lg">
              <Sparkles size={13} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                An AI summary will be automatically generated from your inputs and shown to the employee.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </div>
        </form>

        <div className="flex gap-2 p-5 border-t border-border flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 text-sm py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            className="flex-1 text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={() => {
              if (!employeeId)   return setError("Select an employee");
              if (!reviewPeriod) return setError("Enter review period");
              setError("");

              const fd = new FormData();
              fd.set("employeeId",   employeeId);
              fd.set("rating",       String(rating));
              fd.set("reviewPeriod", reviewPeriod);
              fd.set("strengths",    strengths);
              fd.set("weakness",     weakness);
              fd.set("feedback",     feedback);

              startTransition(async () => {
                const res = isEdit
                  ? await editReview(review!.id, fd)
                  : await createReview(fd);
                if (res.success) onClose();
                else setError(res.error);
              });
            }}>
            {pending
              ? (isEdit ? "Saving..."    : "Submitting...")
              : (isEdit ? "Save changes" : "Submit review")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────
function ReviewCard({
  review, isManagerPlus, currentUserId, formData,
  onToast,
}: {
  review:        ReviewListItem;
  isManagerPlus: boolean;
  currentUserId: string;
  formData?:     ReviewFormData;
  onToast:       (msg: string, type: "success" | "error") => void;
}) {
  const [expanded,   setExpanded]  = useState(false);
  const [editTarget, setEditTarget] = useState(false);
  const [menuOpen,   setMenuOpen]  = useState(false);
  const [pending, startTransition] = useTransition();

  const canEdit = isManagerPlus && review.reviewerId === currentUserId;

  function handleDelete() {
    if (!confirm("Delete this review?")) return;
    setMenuOpen(false);
    startTransition(async () => {
      const res = await deleteReview(review.id);
      onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
    });
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-sm transition-shadow">
        {/* Header */}
        <div className="flex items-start gap-3 p-5">
          <Avatar name={review.employee.name} avatar={review.employee.avatar} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{review.employee.name}</p>
                <p className="text-xs text-muted-foreground">
                  {review.employee.designation || review.employee.department?.name || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  {review.reviewPeriod}
                </span>
                {isManagerPlus && (
                  <div className="relative">
                    <button onClick={() => setMenuOpen(v => !v)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                      <MoreHorizontal size={14} />
                    </button>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 top-8 z-20 w-32 bg-card border border-border rounded-xl shadow-lg py-1">
                          {canEdit && (
                            <button onClick={() => { setEditTarget(true); setMenuOpen(false); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                              <Edit size={12} /> Edit
                            </button>
                          )}
                          <button onClick={handleDelete} disabled={pending}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 mt-2">
              <StarRating value={review.rating} readonly />
              <span className="text-xs text-muted-foreground">
                by {review.reviewer.name} · {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {review.aiSummary && (
          <div className="mx-5 mb-4 p-3 bg-primary/5 border border-primary/15 rounded-lg">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wide flex items-center gap-1 mb-1.5">
              <Sparkles size={10} /> AI Summary
            </p>
            <p className="text-xs text-foreground leading-relaxed">{review.aiSummary}</p>
          </div>
        )}

        {/* Expandable details */}
        {(review.strengths || review.weakness || review.feedback) && (
          <>
            <button onClick={() => setExpanded(v => !v)}
              className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              {expanded ? <><ChevronUp size={13} /> Hide details</> : <><ChevronDown size={13} /> Show details</>}
            </button>

            {expanded && (
              <div className="border-t border-border p-5 space-y-3 bg-muted/20">
                {review.strengths && (
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">💪 Strengths</p>
                    <p className="text-xs text-foreground leading-relaxed">{review.strengths}</p>
                  </div>
                )}
                {review.weakness && (
                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1.5">📈 Areas to improve</p>
                    <p className="text-xs text-foreground leading-relaxed">{review.weakness}</p>
                  </div>
                )}
                {review.feedback && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">💬 Manager feedback</p>
                    <p className="text-xs text-foreground leading-relaxed">{review.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {editTarget && formData && (
        <ReviewModal review={review} formData={formData} onClose={() => setEditTarget(false)} />
      )}
    </>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export function ReviewsClient({
  reviews, formData, stats, isManagerPlus, currentUserId,
  plan, peers, myPeerReviews,
}: {
  reviews:       ReviewListItem[];
  formData?:     ReviewFormData;
  stats?:        { total: number; avgRating: number; byPeriod: { period: string; count: number; avgRating: number }[] };
  isManagerPlus: boolean;
  currentUserId: string;
  plan?:         any;
  peers?:        any[];
  myPeerReviews?: any[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch]         = useState("");
  const [periodFilter, setPeriod]   = useState("ALL");
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab]   = useState<"reviews" | "peer">("reviews");

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const periods = useMemo(() =>
    Array.from(new Set(reviews.map(r => r.reviewPeriod))).sort().reverse(),
    [reviews]
  );

  const filtered = useMemo(() =>
    reviews.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.employee.name.toLowerCase().includes(q) || r.reviewer.name.toLowerCase().includes(q);
      const matchPeriod = periodFilter === "ALL" || r.reviewPeriod === periodFilter;
      return matchSearch && matchPeriod;
    }),
    [reviews, search, periodFilter]
  );

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-5">
        {[
          { id: "reviews", label: "Performance Reviews" },
          { id: "peer",    label: "360° Peer Reviews" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={[
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all outline-none whitespace-nowrap",
              activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            ].join(" ")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Peer reviews tab */}
      {activeTab === "peer" && plan && (
        <PeerReviewsTab
          plan={plan}
          peers={peers ?? []}
          myPeerReviews={myPeerReviews ?? []}
        />
      )}

      {activeTab === "reviews" && (
        <div className="space-y-5">
          {/* Stats — manager only */}
          {isManagerPlus && stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Reviews</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Avg Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-foreground">{stats.avgRating > 0 ? stats.avgRating : "—"}</p>
                  {stats.avgRating > 0 && <Star size={16} className="text-amber-400 fill-amber-400" />}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Review Periods</p>
                <p className="text-2xl font-bold text-foreground">{stats.byPeriod.length}</p>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
              <Search size={14} className="text-muted-foreground flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by employee or reviewer..."
                className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full" />
              {search && <button onClick={() => setSearch("")}><X size={13} className="text-muted-foreground" /></button>}
            </div>

            {periods.length > 1 && (
              <select value={periodFilter} onChange={e => setPeriod(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
                <option value="ALL">All Periods</option>
                {periods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            )}

            {isManagerPlus && formData && (
              <button onClick={() => setShowCreate(true)}
                className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
                <Plus size={14} /> New Review
              </button>
            )}
          </div>

          {/* Reviews list */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <Star size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                {reviews.length === 0 ? "No reviews yet" : "No reviews match your search"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {reviews.length === 0
                  ? (isManagerPlus ? "Submit your first performance review" : "Your manager hasn't submitted a review yet")
                  : "Try adjusting your search"}
              </p>
              {reviews.length === 0 && isManagerPlus && formData && (
                <button onClick={() => setShowCreate(true)}
                  className="mt-4 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  Submit Review
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isManagerPlus={isManagerPlus}
                  currentUserId={currentUserId}
                  formData={formData}
                  onToast={showToast}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {reviews.length} reviews
          </p>
        </div>
      )}

      {/* Create modal */}
      {showCreate && formData && (
        <ReviewModal formData={formData} onClose={() => setShowCreate(false)} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}