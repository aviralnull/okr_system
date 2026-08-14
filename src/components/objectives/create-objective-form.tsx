// // src/components/objectives/create-objective-form.tsx
// "use client";

// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { Plus, X, Target, Calendar, Users2, Flag, AlertCircle } from "lucide-react";
// import { createObjective } from "@/actions/objectives.actions";
// import type { ObjectiveFormData } from "@/actions/objectives.actions";

// interface KeyResultDraft {
//   id: string;
//   title: string;
//   targetValue: string;
//   unit: string;
// }

// const PRIORITY_OPTIONS = [
//   { value: "LOW",      label: "Low",      color: "#94a3b8" },
//   { value: "MEDIUM",   label: "Medium",   color: "#6366f1" },
//   { value: "HIGH",     label: "High",     color: "#f59e0b" },
//   { value: "CRITICAL", label: "Critical", color: "#ef4444" },
// ];

// const UNIT_OPTIONS = ["%", "deals", "$", "users", "days", "tasks", "leads", "points"];

// function getCurrentQuarter() {
//   const now = new Date();
//   const q = Math.floor(now.getMonth() / 3) + 1;
//   return `Q${q} ${now.getFullYear()}`;
// }

// export function CreateObjectiveForm({ formData }: { formData: ObjectiveFormData }) {
//   const router = useRouter();
//   const [pending, startTransition] = useTransition();
//   const [error, setError] = useState("");

//   const [title, setTitle]             = useState("");
//   const [description, setDescription] = useState("");
//   const [ownerId, setOwnerId]         = useState(formData.currentUserId);
//   const [teamId, setTeamId]           = useState("");
//   const [quarter, setQuarter]         = useState(getCurrentQuarter());
//   const [priority, setPriority]       = useState("MEDIUM");
//   const [startDate, setStartDate]     = useState(new Date().toISOString().split("T")[0]);
//   const [dueDate, setDueDate]         = useState("");

//   const [keyResults, setKeyResults] = useState<KeyResultDraft[]>([
//     { id: crypto.randomUUID(), title: "", targetValue: "", unit: "%" },
//   ]);

//   function addKeyResult() {
//     setKeyResults(prev => [...prev, { id: crypto.randomUUID(), title: "", targetValue: "", unit: "%" }]);
//   }
//   function removeKeyResult(id: string) {
//     setKeyResults(prev => prev.filter(kr => kr.id !== id));
//   }
//   function updateKR(id: string, field: keyof KeyResultDraft, value: string) {
//     setKeyResults(prev => prev.map(kr => kr.id === id ? { ...kr, [field]: value } : kr));
//   }

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");

//     // Validate
//     if (!title.trim())   return setError("Title is required");
//     if (!dueDate)        return setError("Due date is required");
//     if (new Date(dueDate) <= new Date(startDate)) return setError("Due date must be after start date");

//     const validKRs = keyResults.filter(kr => kr.title.trim() && kr.targetValue);
//     if (validKRs.length === 0) return setError("At least one key result is required");

//     for (const kr of validKRs) {
//       if (Number(kr.targetValue) <= 0) return setError(`Target value for "${kr.title}" must be > 0`);
//     }

//     const fd = new FormData();
//     fd.set("title", title.trim());
//     fd.set("description", description.trim());
//     fd.set("ownerId", ownerId);
//     fd.set("teamId", teamId);
//     fd.set("quarter", quarter);
//     fd.set("priority", priority);
//     fd.set("startDate", startDate);
//     fd.set("dueDate", dueDate);
//     fd.set("keyResults", JSON.stringify(validKRs.map(kr => ({
//       title: kr.title.trim(),
//       targetValue: Number(kr.targetValue),
//       unit: kr.unit,
//     }))));

//     console.log("FormData being sent:");
// for (const [key, value] of fd.entries()) {
//   console.log(key, "=", value);
// }

//     startTransition(async () => {
//       const res = await createObjective(fd);
//       if (res.success && res.id) {
//         router.push(`/objectives/${res.id}`);
//       } else if (!res.success) {
//         setError(res.error);
//       }
//     });
//   }

//   const selectedOwner = formData.users.find(u => u.id === ownerId);

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5">

//       {/* Title + description */}
//       <div className="rounded-xl border border-border bg-card p-5 space-y-4">
//         <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
//           <Target size={15} className="text-primary" /> Objective details
//         </div>

//         <div>
//           <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title *</label>
//           <input
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="e.g. Grow monthly recurring revenue to $500k"
//             className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//           />
//         </div>

//         <div>
//           <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
//           <textarea
//             value={description}
//             onChange={e => setDescription(e.target.value)}
//             rows={2}
//             placeholder="What is this objective about? (optional)"
//             className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Quarter *</label>
//             <input
//               value={quarter}
//               onChange={e => setQuarter(e.target.value)}
//               placeholder="Q2 2026"
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//             />
//           </div>
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Priority *</label>
//             <div className="flex gap-1.5">
//               {PRIORITY_OPTIONS.map(p => (
//                 <button
//                   key={p.value}
//                   type="button"
//                   onClick={() => setPriority(p.value)}
//                   className="flex-1 text-xs py-2 rounded-lg border transition-all font-medium"
//                   style={priority === p.value
//                     ? { background: `${p.color}18`, borderColor: p.color, color: p.color }
//                     : { borderColor: "var(--border)" }
//                   }
//                 >
//                   {p.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center gap-1">
//               <Calendar size={11} /> Start date *
//             </label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={e => setStartDate(e.target.value)}
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//             />
//           </div>
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center gap-1">
//               <Calendar size={11} /> Due date *
//             </label>
//             <input
//               type="date"
//               value={dueDate}
//               onChange={e => setDueDate(e.target.value)}
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Assignment */}
//       <div className="rounded-xl border border-border bg-card p-5 space-y-4">
//         <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
//           <Users2 size={15} className="text-primary" /> Assignment
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Owner *</label>
//             <select
//               value={ownerId}
//               onChange={e => setOwnerId(e.target.value)}
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//             >
//               {formData.users.map(u => (
//                 <option key={u.id} value={u.id}>
//                   {u.name} {u.id === formData.currentUserId ? "(You)" : ""} — {u.role.replace("_", " ")}
//                 </option>
//               ))}
//             </select>
//             {selectedOwner && selectedOwner.id !== formData.currentUserId && (
//               <p className="text-[11px] text-muted-foreground mt-1.5">
//                 {selectedOwner.name} will be notified of this assignment
//               </p>
//             )}
//           </div>
//           <div>
//             <label className="text-xs font-medium text-muted-foreground block mb-1.5">Team (optional)</label>
//             <select
//               value={teamId}
//               onChange={e => setTeamId(e.target.value)}
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//             >
//               <option value="">No team</option>
//               {formData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Key Results */}
//       <div className="rounded-xl border border-border bg-card p-5 space-y-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
//             <Flag size={15} className="text-primary" /> Key results
//           </div>
//           <span className="text-xs text-muted-foreground">{keyResults.length} added</span>
//         </div>

//         <div className="space-y-3">
//           {keyResults.map((kr, idx) => (
//             <div key={kr.id} className="border border-border rounded-lg p-3 relative">
//               <div className="flex items-center gap-2 mb-2">
//                 <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
//                   {idx + 1}
//                 </div>
//                 <input
//                   value={kr.title}
//                   onChange={e => updateKR(kr.id, "title", e.target.value)}
//                   placeholder="e.g. Close 40 enterprise deals"
//                   className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                 />
//                 {keyResults.length > 1 && (
//                   <button type="button" onClick={() => removeKeyResult(kr.id)}
//                     className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
//                     <X size={14} />
//                   </button>
//                 )}
//               </div>
//               <div className="grid grid-cols-2 gap-2 pl-7">
//                 <input
//                   type="number"
//                   value={kr.targetValue}
//                   onChange={e => updateKR(kr.id, "targetValue", e.target.value)}
//                   placeholder="Target value (e.g. 40)"
//                   min="0"
//                   step="any"
//                   className="text-sm px-2.5 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                 />
//                 <select
//                   value={kr.unit}
//                   onChange={e => updateKR(kr.id, "unit", e.target.value)}
//                   className="text-sm px-2.5 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                 >
//                   {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
//                 </select>
//               </div>
//             </div>
//           ))}
//         </div>

//         <button
//           type="button"
//           onClick={addKeyResult}
//           className="w-full text-sm py-2.5 rounded-lg border border-dashed border-border text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
//         >
//           <Plus size={14} /> Add key result
//         </button>
//       </div>

//       {error && (
//         <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg">
//           <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
//           {error}
//         </div>
//       )}

//       <div className="flex gap-3">
//         <a href="/objectives" className="flex-1 text-center text-sm px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
//           Cancel
//         </a>
//         <button
//           type="submit"
//           disabled={pending}
//           className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
//         >
//           {pending ? "Creating..." : "Create Objective"}
//         </button>
//       </div>
//     </form>
//   );
// }




// src/components/objectives/create-objective-form.tsx
"use client";

import { AIOKRSuggestions } from "@/components/objectives/ai-suggestions";

import { useState, useTransition, useMemo } from "react";
import { useRouter }   from "next/navigation";
import {
  Plus, X, Target, Calendar, Users2, Flag,
  AlertCircle, Building2, User, Check, Search,
} from "lucide-react";
import { createObjective }   from "@/actions/objectives.actions";
import type { ObjectiveFormData } from "@/actions/objectives.actions";

interface KRDraft {
  id: string; title: string; targetValue: string; unit: string;
}

const PRIORITY_OPTIONS = [
  { value: "LOW",      label: "Low",      color: "#94a3b8" },
  { value: "MEDIUM",   label: "Medium",   color: "#6366f1" },
  { value: "HIGH",     label: "High",     color: "#f59e0b" },
  { value: "CRITICAL", label: "Critical", color: "#ef4444" },
];
const UNIT_OPTIONS = ["%", "deals", "$", "users", "days", "tasks", "leads", "points", "calls"];

function getCurrentQuarter() {
  const q = Math.floor(new Date().getMonth() / 3) + 1;
  return `Q${q} ${new Date().getFullYear()}`;
}

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
  if (avatar) return <img src={avatar} alt={name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[9px] font-semibold flex items-center justify-center flex-shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

type AssignType = "individual" | "team" | "department";

export function CreateObjectiveForm({ formData, plan = "FREE" }: { formData: ObjectiveFormData; plan?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error,   setError]        = useState("");
  const [step,    setStep]         = useState<1 | 2 | 3>(1);

  // Step 1 — Details
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [quarter,     setQuarter]     = useState(getCurrentQuarter());
  const [priority,    setPriority]    = useState("MEDIUM");
  const [startDate,   setStartDate]   = useState(new Date().toISOString().split("T")[0]);
  const [dueDate,     setDueDate]     = useState("");

  // Step 2 — Assignment
  const [assignType,    setAssignType]    = useState<AssignType>("individual");
  const [ownerId,       setOwnerId]       = useState(formData.currentUserId);
  const [teamId,        setTeamId]        = useState("");
  const [departmentId,  setDepartmentId]  = useState("");
  const [memberSearch,  setMemberSearch]  = useState("");

  // Step 3 — Key Results
  const [keyResults, setKeyResults] = useState<KRDraft[]>([
    { id: crypto.randomUUID(), title: "", targetValue: "", unit: "%" },
  ]);

  // Derived — who will be assigned
  const assignedMembers = useMemo(() => {
    if (assignType === "individual") {
      const u = formData.users.find(u => u.id === ownerId);
      return u ? [u] : [];
    }
    if (assignType === "team") {
      return formData.users.filter(u => u.team?.name && formData.users.find(x => x.id === ownerId)?.team?.name === u.team?.name
        || (teamId && u.id === ownerId));
    }
    return [];
  }, [assignType, ownerId, teamId, departmentId, formData.users]);

  const selectedTeam = formData.teams.find(t => t.id === teamId);
  const selectedDept = formData.departments.find(d => d.id === departmentId);

  const filteredUsers = useMemo(() =>
    formData.users.filter(u =>
      !memberSearch ||
      u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (u.department?.name ?? "").toLowerCase().includes(memberSearch.toLowerCase())
    ),
    [formData.users, memberSearch]
  );

  function addKR() {
    setKeyResults(p => [...p, { id: crypto.randomUUID(), title: "", targetValue: "", unit: "%" }]);
  }
  function removeKR(id: string) {
    setKeyResults(p => p.filter(k => k.id !== id));
  }
  function updateKR(id: string, field: keyof KRDraft, value: string) {
    setKeyResults(p => p.map(k => k.id === id ? { ...k, [field]: value } : k));
  }

  function validateStep1() {
    if (!title.trim())   { setError("Title is required"); return false; }
    if (!dueDate)        { setError("Due date is required"); return false; }
    if (new Date(dueDate) <= new Date(startDate)) { setError("Due date must be after start date"); return false; }
    setError(""); return true;
  }

  function validateStep2() {
    if (assignType === "individual" && !ownerId) { setError("Select an owner"); return false; }
    if (assignType === "team"       && !teamId)  { setError("Select a team"); return false; }
    if (assignType === "department" && !departmentId) { setError("Select a department"); return false; }
    setError(""); return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validKRs = keyResults.filter(k => k.title.trim() && k.targetValue);
    if (validKRs.length === 0) { setError("At least one key result is required"); return; }
    for (const kr of validKRs) {
      if (Number(kr.targetValue) <= 0) { setError(`Target for "${kr.title}" must be > 0`); return; }
    }
    setError("");

    const fd = new FormData();
    fd.set("title",       title.trim());
    fd.set("description", description.trim());
    fd.set("assignType",  assignType);
    fd.set("ownerId",     ownerId);
    fd.set("teamId",      teamId);
    fd.set("departmentId", departmentId);
    fd.set("quarter",     quarter);
    fd.set("priority",    priority);
    fd.set("startDate",   startDate);
    fd.set("dueDate",     dueDate);
    fd.set("keyResults",  JSON.stringify(validKRs.map(k => ({
      title: k.title.trim(), targetValue: Number(k.targetValue), unit: k.unit,
    }))));

    startTransition(async () => {
      const res = await createObjective(fd);
      if (res.success && res.id) router.push(`/objectives/${res.id}`);
      else if (!res.success) setError(res.error);
    });
  }

  const STEPS = [
    { n: 1, label: "Details" },
    { n: 2, label: "Assign" },
    { n: 3, label: "Key Results" },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button type="button"
              onClick={() => {
                if (s.n === 2 && !validateStep1()) return;
                if (s.n === 3 && (!validateStep1() || !validateStep2())) return;
                setStep(s.n);
              }}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all",
                step === s.n
                  ? "bg-primary text-primary-foreground"
                  : step > s.n
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}>
              {step > s.n ? <Check size={11} /> : s.n}
              {s.label}
            </button>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Details ── */}
      {step === 1 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target size={15} className="text-primary" /> Objective details
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
              placeholder="e.g. Grow monthly recurring revenue to $500k"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            {/* AI suggestions — click to fill title */}
            <div className="mt-2">
              <AIOKRSuggestions
                plan={plan as any}
                onSelect={(s) => setTitle(s)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description <span className="text-muted-foreground/60">(optional)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="What is this objective about?"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Quarter *</label>
              <input value={quarter} onChange={e => setQuarter(e.target.value)} placeholder="Q2 2026"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Priority *</label>
              <div className="flex gap-1.5">
                {PRIORITY_OPTIONS.map(p => (
                  <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                    className="flex-1 text-xs py-2 rounded-lg border transition-all font-medium outline-none"
                    style={priority === p.value
                      ? { background: `${p.color}18`, borderColor: p.color, color: p.color }
                      : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center gap-1"><Calendar size={11} /> Start date *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center gap-1"><Calendar size={11} /> Due date *</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Assignment ── */}
      {step === 2 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users2 size={15} className="text-primary" /> Assign to
          </div>

          {/* Assign type selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "individual", label: "Individual", icon: User,      desc: "1 person" },
              { value: "team",       label: "Team",       icon: Users2,    desc: "All team members" },
              { value: "department", label: "Department", icon: Building2, desc: "All dept members" },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button key={value} type="button" onClick={() => setAssignType(value as AssignType)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
                  assignType === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground"
                )}>
                <Icon size={18} />
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-[10px] opacity-70">{desc}</span>
              </button>
            ))}
          </div>

          {/* Individual selector */}
          {assignType === "individual" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Select owner *</label>
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mb-2">
                <Search size={13} className="text-muted-foreground flex-shrink-0" />
                <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Search by name or department..."
                  className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full" />
              </div>
              <div className="border border-border rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                {filteredUsers.map(u => (
                  <button key={u.id} type="button" onClick={() => setOwnerId(u.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-0",
                      ownerId === u.id && "bg-primary/5"
                    )}>
                    <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                      ownerId === u.id ? "bg-primary border-primary" : "border-border"
                    )}>
                      {ownerId === u.id && <Check size={9} className="text-white" />}
                    </div>
                    <Avatar name={u.name} avatar={u.avatar} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {u.name} {u.id === formData.currentUserId && "(You)"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {u.role.replace("_", " ")}
                        {u.team && ` · ${u.team.name}`}
                        {u.department && ` · ${u.department.name}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {ownerId && ownerId !== formData.currentUserId && (
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  ✉️ {formData.users.find(u => u.id === ownerId)?.name} will be notified
                </p>
              )}
            </div>
          )}

          {/* Team selector */}
          {assignType === "team" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Select team *</label>
                <select value={teamId} onChange={e => setTeamId(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Choose a team...</option>
                  {formData.teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t._count.users} members)</option>
                  ))}
                </select>
              </div>
              {selectedTeam && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-primary mb-1">📋 This OKR will be assigned to:</p>
                  <p className="text-xs text-foreground">
                    All <strong>{selectedTeam._count.users}</strong> active members of <strong>{selectedTeam.name}</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Each member gets their own copy to track individually</p>
                </div>
              )}
            </div>
          )}

          {/* Department selector */}
          {assignType === "department" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Select department *</label>
                <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Choose a department...</option>
                  {formData.departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d._count.users} members)</option>
                  ))}
                </select>
              </div>
              {selectedDept && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-primary mb-1">📋 This OKR will be assigned to:</p>
                  <p className="text-xs text-foreground">
                    All <strong>{selectedDept._count.users}</strong> active members of <strong>{selectedDept.name}</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Each member gets their own copy to track individually</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Key Results ── */}
      {step === 3 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Flag size={15} className="text-primary" /> Key results
            </div>
            <span className="text-xs text-muted-foreground">{keyResults.length} added</span>
          </div>

          <div className="space-y-3">
            {keyResults.map((kr, idx) => (
              <div key={kr.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <input value={kr.title} onChange={e => updateKR(kr.id, "title", e.target.value)}
                    placeholder="e.g. Close 40 enterprise deals"
                    className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  {keyResults.length > 1 && (
                    <button type="button" onClick={() => removeKR(kr.id)} className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pl-7">
                  <input type="number" value={kr.targetValue} onChange={e => updateKR(kr.id, "targetValue", e.target.value)}
                    placeholder="Target (e.g. 40)" min="0" step="any"
                    className="text-sm px-2.5 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  <select value={kr.unit} onChange={e => updateKR(kr.id, "unit", e.target.value)}
                    className="text-sm px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addKR}
            className="w-full text-sm py-2.5 rounded-lg border border-dashed border-border text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
            <Plus size={14} /> Add key result
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Footer buttons */}
      <div className="flex gap-3">
        {step > 1 ? (
          <button type="button" onClick={() => { setError(""); setStep((step - 1) as 1 | 2 | 3); }}
            className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
            ← Back
          </button>
        ) : (
          <a href="/objectives" className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-center">
            Cancel
          </a>
        )}

        {step < 3 ? (
          <button type="button"
            onClick={() => {
              if (step === 1 && !validateStep1()) return;
              if (step === 2 && !validateStep2()) return;
              setStep((step + 1) as 2 | 3);
            }}
            className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
            Next →
          </button>
        ) : (
          <button type="submit" disabled={pending}
            className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {pending ? "Creating..." : "Create Objective"}
          </button>
        )}
      </div>
    </form>
  );
}