// "use client";

// import { useState, useMemo, useTransition } from "react";
// import {
//   Search, X, Target, Calendar, MessageSquare, Activity,
//   Trash2, MoreHorizontal, ChevronRight, Users2,
// } from "lucide-react";
// import type { ObjectiveListItem } from "@/actions/objectives.actions"
// import { deleteObjective }        from "@/actions/objectives.actions"

// const STATUS_COLOR: Record<string, string> = {
//   ON_TRACK: "#10b981", AT_RISK: "#f59e0b",
//   BEHIND: "#ef4444", COMPLETED: "#6366f1", NOT_STARTED: "#94a3b8",
// };
// const STATUS_LABEL: Record<string, string> = {
//   ON_TRACK: "On Track", AT_RISK: "At Risk",
//   BEHIND: "Behind", COMPLETED: "Completed", NOT_STARTED: "Not Started",
// };
// const PRIORITY_COLOR: Record<string, string> = {
//   CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#6366f1", LOW: "#94a3b8",
// };

// function cn(...c: (string |false |undefined)[]) {return  c.filter(Boolean).join("") } ;
// function Avatar({name , avatar , size="md"} : {name :string ; avatar?:string | null ; size?:"sm"|"md"}){
//     const dim = size === "sm" ?"w-6 h-6 text-[9px]" : "w-8 h-8 text-[11px]" ; 
//     if(avatar)return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />
//     return (
//         <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold  flex items-center justify-center flex-shrink-0`}>{name.slice(0,2).toUpperCase()}</div>
//     ) ;
// }
// export function ObjectivesClient({
//     objectives , isManagerPlus ,
// } : {objectives : ObjectiveListItem[] ; isManagerPlus : boolean ;}) {
//     const [search ,setSearch] = useState("");
//     const [statusFilter ,setStatus] = useState("ALL") ;
//     const [priorityFilter , setPrio] = useState("ALL") ;
//     const [quarterFilter ,setQtr] = useState("ALL") ;
//     const [openMenu ,setOpenMenu] = useState<string |null>(null) ;
//     const [pending ,startTransition] = useTransition() ;
//  const quarters = useMemo(
//     ()=> Array.from(new Set(objectives.map(o=>o.quarter))).sort().reverse() ,[objectives]
//  ) ;

//  const filtered = useMemo(()=>{
//     return objectives.filter(o=>{
//         const q = search.toLowerCase() ;
//         const matchSearch = !q || o.title.toLowerCase().includes(q) || o.owner.name.toLowerCase().includes(q) ;
//         const matchStatus = statusFilter === "ALL" || o.status === statusFilter ;
//         const matchPrio = priorityFilter === "ALL" || o.priority === priorityFilter ;
//         const matchQuarter = quarterFilter ==="ALL" || o.quarter === quarterFilter ;
//         return matchStatus&& matchSearch&& matchPrio&&matchQuarter ;

//     }) ;
//  } , [objectives ,search , statusFilter ,priorityFilter, quarterFilter]) ;
//  const  hasFilters =  search || statusFilter !=="ALL"  || priorityFilter !== "ALL" ||quarterFilter !=="ALL"; 
//  const statusCounts = useMemo(()=>{
//     const counts:Record<string ,number> = {ALL:objectives.length} ;
//     for(const o of objectives)counts[o.status] = (counts[o.status]??0 ) +1  ;
//     return counts ;
//  } , [objectives]) ;

// function  handleDelete(id:string ,title:string){
//     if(!confirm(`Delete "${title}"? This cannot be undone. `))return ;
//     startTransition(async()=>{
//         await deleteObjective(id) ;
//         setOpenMenu(null) ;
//     })
// }

//   return (
//     <>
//       {/* Status pills */}
//       <div className="flex gap-2 flex-wrap">
//         {["ALL", "ON_TRACK", "AT_RISK", "BEHIND", "COMPLETED", "NOT_STARTED"].map(s => (
//           <button
//             key={s}
//             onClick={() => setStatus(s)}
//           className={cn(
//            "text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 font-medium",
//             statusFilter === s
//             ? "bg-primary text-primary-foreground border-primary"
//             : "bg-card border-border text-foreground hover:bg-muted"
// )}
//           >
//             {s === "ALL" ? "All" : STATUS_LABEL[s]}
//             <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
//             statusFilter === s
//              ? "bg-primary-foreground/20 text-primary-foreground"
//              : "bg-muted text-muted-foreground"
// )}>
//               {statusCounts[s] ?? 0}
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* Search + filters */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center">
//         <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
//           <Search size={14} className="text-muted-foreground flex-shrink-0" />
//           <input
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             placeholder="Search objectives, owner..."
//             className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
//           />
//           {search && <button onClick={() => setSearch("")}><X size={13} className="text-muted-foreground" /></button>}
//         </div>

//         <div className="flex items-center gap-2 flex-wrap">
//           <select value={priorityFilter} onChange={e => setPrio(e.target.value)}
//             className="text-xs px-3 py-2 rounded-lg border border-border text-foreground bg-card outline-none cursor-pointer">
//             <option value="ALL">All Priorities</option>
//             <option value="CRITICAL">Critical</option>
//             <option value="HIGH">High</option>
//             <option value="MEDIUM">Medium</option>
//             <option value="LOW">Low</option>
//           </select>

//           {quarters.length > 1 && (
//             <select value={quarterFilter} onChange={e => setQtr(e.target.value)}
//               className="text-xs px-3 py-2 rounded-lg border border-border text-foreground bg-card outline-none cursor-pointer">
//               <option value="ALL">All Quarters</option>
//               {quarters.map(q => <option key={q} value={q}>{q}</option>)}
//             </select>
//           )}

//           {hasFilters && (
//             <button onClick={() => { setSearch(""); setStatus("ALL"); setPrio("ALL"); setQtr("ALL"); }}
//               className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
//               <X size={12} /> Clear
//             </button>
//           )}
//         </div>
//       </div>

//       {/* List */}
//       {filtered.length === 0 ? (
//         <div className="text-center py-16 bg-card border border-border rounded-xl">
//           <Target size={36} className="text-muted-foreground mx-auto mb-3" />
//           <p className="text-sm font-medium text-foreground">
//             {objectives.length === 0 ? "No objectives yet" : "No objectives match your filters"}
//           </p>
//           <p className="text-xs text-muted-foreground mt-1">
//             {objectives.length === 0
//               ? (isManagerPlus ? "Create your first OKR to get started" : "Your manager will assign OKRs to you")
//               : "Try adjusting your search or filters"}
//           </p>
//           {objectives.length === 0 && isManagerPlus && (
//             <a href="/objectives/new" className="mt-4 inline-block text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
//               Create Objective
//             </a>
//           )}
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {filtered.map(obj => (
//             <div key={obj.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
//               <div className="flex items-start justify-between gap-3 mb-3">
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 flex-wrap mb-1.5">
//                     <span className="text-xs font-medium px-2 py-0.5 rounded-full"
//                       style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
//                       {STATUS_LABEL[obj.status]}
//                     </span>
//                     <span className="text-xs font-medium px-2 py-0.5 rounded-full"
//                       style={{ background: `${PRIORITY_COLOR[obj.priority]}18`, color: PRIORITY_COLOR[obj.priority] }}>
//                       {obj.priority}
//                     </span>
//                     {obj.team && (
//                       <span className="text-xs text-muted-foreground flex items-center gap-1">
//                         <Users2 size={11} /> {obj.team.name}
//                       </span>
//                     )}
//                     <span className="text-xs text-muted-foreground">{obj.quarter}</span>
//                   </div>
//                   <a href={`/objectives/${obj.id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
//                     {obj.title}
//                   </a>
//                   {obj.description && (
//                     <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{obj.description}</p>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-3 flex-shrink-0">
//                   <div className="text-right">
//                     <p className="text-xl font-bold" style={{ color: STATUS_COLOR[obj.status] }}>
//                       {Math.round(obj.progress)}%
//                     </p>
//                   </div>

//                   {isManagerPlus && (
//                     <div className="relative">
//                       <button onClick={() => setOpenMenu(openMenu === obj.id ? null : obj.id)}
//                         className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
//                         <MoreHorizontal size={15} />
//                       </button>
//                       {openMenu === obj.id && (
//                         <>
//                           <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
//                           <div className="absolute right-0 top-8 z-20 w-40 bg-card border border-border rounded-xl shadow-lg py-1">
//                             <button onClick={() => handleDelete(obj.id, obj.title)} disabled={pending}
//                               className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
//                               <Trash2 size={13} /> Delete
//                             </button>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Progress bar */}
//               <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
//                 <div className="h-full rounded-full" style={{ width: `${obj.progress}%`, background: STATUS_COLOR[obj.status] }} />
//               </div>

//               {/* Footer */}
//               <div className="flex items-center gap-4 text-xs text-muted-foreground">
//                 <div className="flex items-center gap-1.5">
//                   <Avatar name={obj.owner.name} avatar={obj.owner.avatar} size="sm" />
//                   <span>{obj.owner.name}</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <Target size={11} /> {obj._count.keyResults} KRs
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <Calendar size={11} /> Due {new Date(obj.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
//                 </div>
//                 {obj._count.comments > 0 && (
//                   <div className="flex items-center gap-1">
//                     <MessageSquare size={11} /> {obj._count.comments}
//                   </div>
//                 )}
//                 {obj._count.progressUpdates > 0 && (
//                   <div className="flex items-center gap-1">
//                     <Activity size={11} /> {obj._count.progressUpdates}
//                   </div>
//                 )}
//                 <a href={`/objectives/${obj.id}`} className="ml-auto text-primary hover:underline flex items-center gap-1">
//                   View <ChevronRight size={11} />
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <p className="text-xs text-muted-foreground">
//         Showing {filtered.length} of {objectives.length} objectives
//       </p>
//     </>
//   );
// }



// src/components/objectives/objectives-client.tsx
"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import {
  Search, X, Target, Calendar, MessageSquare, Activity,
  Trash2, MoreHorizontal, ChevronRight, Users2, Building2, Filter,
} from "lucide-react";
import type { ObjectiveListItem, ObjectiveFilterData } from "@/actions/objectives.actions";
import { deleteObjective, getObjectives } from "@/actions/objectives.actions";

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

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar, size = "md" }: { name: string; avatar?: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-[11px]";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function ObjectivesClient({
  objectives: initialObjectives,
  isManagerPlus,
  filterData,
  orgId, userId, role,
}: {
  objectives:    ObjectiveListItem[];
  isManagerPlus: boolean;
  filterData?:   ObjectiveFilterData;
  orgId:         string;
  userId:        string;
  role:          string;
}) {
  const [objectives, setObjectives] = useState(initialObjectives);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("ALL");
  const [priorityFilter, setPrio]   = useState("ALL");
  const [teamFilter, setTeamF]      = useState("ALL");
  const [deptFilter, setDeptF]      = useState("ALL");
  const [memberFilter, setMemberF]  = useState("ALL");
  const [openMenu, setOpenMenu]     = useState<string | null>(null);
  const [pending, startTransition]  = useTransition();
  const [refreshing, setRefreshing] = useState(false);

  // Re-fetch when team/dept/member filter changes (server-side filter)
  useEffect(() => {
    if (!isManagerPlus) return;
    if (teamFilter === "ALL" && deptFilter === "ALL" && memberFilter === "ALL") {
      setObjectives(initialObjectives);
      return;
    }
    setRefreshing(true);
    getObjectives(orgId, userId, role, {
      teamId:       teamFilter !== "ALL" ? teamFilter : undefined,
      departmentId: deptFilter !== "ALL" ? deptFilter : undefined,
      ownerId:      memberFilter !== "ALL" ? memberFilter : undefined,
    }).then(data => {
      setObjectives(data);
      setRefreshing(false);
    });
  }, [teamFilter, deptFilter, memberFilter, orgId, userId, role, isManagerPlus, initialObjectives]);

  const quarters = useMemo(() => Array.from(new Set(objectives.map(o => o.quarter))).sort().reverse(), [objectives]);

  const filtered = useMemo(() => {
    return objectives.filter(o => {
      const q = search.toLowerCase();
      const matchSearch = !q || o.title.toLowerCase().includes(q) || o.owner.name.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchPrio   = priorityFilter === "ALL" || o.priority === priorityFilter;
      return matchSearch && matchStatus && matchPrio;
    });
  }, [objectives, search, statusFilter, priorityFilter]);

  const hasFilters = search || statusFilter !== "ALL" || priorityFilter !== "ALL" || teamFilter !== "ALL" || deptFilter !== "ALL" || memberFilter !== "ALL";

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: objectives.length };
    for (const o of objectives) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return counts;
  }, [objectives]);

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteObjective(id);
      setObjectives(prev => prev.filter(o => o.id !== id));
      setOpenMenu(null);
    });
  }

  function clearAllFilters() {
    setSearch(""); setStatus("ALL"); setPrio("ALL");
    setTeamF("ALL"); setDeptF("ALL"); setMemberF("ALL");
  }

  return (
    <>
      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "ON_TRACK", "AT_RISK", "BEHIND", "COMPLETED", "NOT_STARTED"].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 font-medium outline-none",
              "focus-visible:ring-2 focus-visible:ring-primary/40",
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-foreground hover:bg-muted"
            )}>
            {s === "ALL" ? "All" : STATUS_LABEL[s]}
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
              statusFilter === s ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {statusCounts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search objectives, owner..."
              className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full" />
            {search && <button onClick={() => setSearch("")}><X size={13} className="text-muted-foreground" /></button>}
          </div>

          <select value={priorityFilter} onChange={e => setPrio(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {hasFilters && (
            <button onClick={clearAllFilters}
              className="text-xs px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Manager-only: Team / Dept / Member filters */}
        {isManagerPlus && filterData && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Filter size={11} /> Filter by:</span>

            <select value={teamFilter} onChange={e => { setTeamF(e.target.value); setDeptF("ALL"); setMemberF("ALL"); }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
              <option value="ALL">All Teams</option>
              {filterData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <select value={deptFilter} onChange={e => { setDeptF(e.target.value); setTeamF("ALL"); setMemberF("ALL"); }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
              <option value="ALL">All Departments</option>
              {filterData.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <select value={memberFilter} onChange={e => { setMemberF(e.target.value); setTeamF("ALL"); setDeptF("ALL"); }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
              <option value="ALL">All Members</option>
              {filterData.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            {refreshing && <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>}
          </div>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Target size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {objectives.length === 0 ? "No objectives yet" : "No objectives match your filters"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {objectives.length === 0
              ? (isManagerPlus ? "Create your first OKR to get started" : "Your manager will assign OKRs to you")
              : "Try adjusting your search or filters"}
          </p>
          {objectives.length === 0 && isManagerPlus && (
            <a href="/objectives/new" className="mt-4 inline-block text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Create Objective
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(obj => (
            <div key={obj.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
                      {STATUS_LABEL[obj.status]}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${PRIORITY_COLOR[obj.priority]}18`, color: PRIORITY_COLOR[obj.priority] }}>
                      {obj.priority}
                    </span>
                    {obj.team && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users2 size={11} /> {obj.team.name}
                      </span>
                    )}
                    {obj.owner.department && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 size={11} /> {obj.owner.department.name}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{obj.quarter}</span>
                  </div>
                  <a href={`/objectives/${obj.id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                    {obj.title}
                  </a>
                  {obj.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{obj.description}</p>}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-xl font-bold" style={{ color: STATUS_COLOR[obj.status] }}>{Math.round(obj.progress)}%</p>

                  {isManagerPlus && (
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === obj.id ? null : obj.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                        <MoreHorizontal size={15} />
                      </button>
                      {openMenu === obj.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-0 top-8 z-20 w-40 bg-card border border-border rounded-xl shadow-lg py-1">
                            <button onClick={() => handleDelete(obj.id, obj.title)} disabled={pending}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full" style={{ width: `${obj.progress}%`, background: STATUS_COLOR[obj.status] }} />
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Avatar name={obj.owner.name} avatar={obj.owner.avatar} size="sm" />
                  <span>{obj.owner.name}</span>
                </div>
                <div className="flex items-center gap-1"><Target size={11} /> {obj._count.keyResults} KRs</div>
                <div className="flex items-center gap-1"><Calendar size={11} /> Due {new Date(obj.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                {obj._count.comments > 0 && <div className="flex items-center gap-1"><MessageSquare size={11} /> {obj._count.comments}</div>}
                {obj._count.progressUpdates > 0 && <div className="flex items-center gap-1"><Activity size={11} /> {obj._count.progressUpdates}</div>}
                <a href={`/objectives/${obj.id}`} className="ml-auto text-primary hover:underline flex items-center gap-1">
                  View <ChevronRight size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {objectives.length} objectives</p>
    </>
  );
}