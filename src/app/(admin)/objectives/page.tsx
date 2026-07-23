// import { Suspense }       from "react";
// import { getCurrentUser } from "@/lib/auth";
// import { getObjectives }  from "@/actions/objectives.actions";
// import { ObjectivesClient } from "@/components/objectives/objective-client";
// import { Skeleton }        from "@/components/ui/skeleton";

// async function ObjectivesContent({ orgId, userId, role }: { orgId: string; userId: string; role: string }) {
//   const objectives = await getObjectives(orgId, userId, role);
//   const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(role);
//   return <ObjectivesClient objectives={objectives} isManagerPlus={isManagerPlus} />;
// }

// export default async function ObjectivesPage() {
//   const user = await getCurrentUser();
//   const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(user.role);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-bold text-foreground">
//             {isManagerPlus ? "Objectives" : "My Objectives"}
//           </h1>
//           <p className="text-sm text-muted-foreground mt-0.5">
//             {isManagerPlus ? "Manage OKRs across your organization" : "Track and update your goals"}
//           </p>
//         </div>
//         {isManagerPlus && (
//           <a
//             href="/objectives/new"
//             className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
//           >
//             + New Objective
//           </a>
//         )}
//       </div>

//       <Suspense fallback={<ObjectivesSkeleton />}>
//         <ObjectivesContent orgId={user.organizationId} userId={user.id} role={user.role} />
//       </Suspense>
//     </div>
//   );
// }

// function ObjectivesSkeleton() {
//   return (
//     <div className="space-y-3">
//       <div className="flex gap-2">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <Skeleton key={i} className="h-8 w-20 rounded-full" />
//         ))}
//       </div>
//       {Array.from({ length: 4 }).map((_, i) => (
//         <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
//           <div className="flex justify-between">
//             <Skeleton className="h-4 w-1/2" />
//             <Skeleton className="h-6 w-12" />
//           </div>
//           <Skeleton className="h-2 w-full rounded-full" />
//           <div className="flex gap-3">
//             <Skeleton className="h-3 w-20" />
//             <Skeleton className="h-3 w-20" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }



// src/app/(admin)/objectives/page.tsx
import { Suspense }       from "react";
import { getCurrentUser } from "@/lib/auth";
import { getObjectives, getObjectiveFilterData } from "@/actions/objectives.actions";
import { ObjectivesClient } from "@/components/objectives/objective-client";
import { Skeleton }        from "@/components/ui/skeleton";

async function ObjectivesContent({ orgId, userId, role }: { orgId: string; userId: string; role: string }) {
  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(role);

  const [objectives, filterData] = await Promise.all([
    getObjectives(orgId, userId, role),
    isManagerPlus ? getObjectiveFilterData(orgId) : Promise.resolve(undefined),
  ]);

  return (
    <ObjectivesClient
      objectives={objectives}
      isManagerPlus={isManagerPlus}
      filterData={filterData}
      orgId={orgId}
      userId={userId}
      role={role}
    />
  );
}

export default async function ObjectivesPage() {
  const user = await getCurrentUser();
  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isManagerPlus ? "Objectives" : "My Objectives"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isManagerPlus ? "Manage OKRs across your organization" : "Track and update your goals"}
          </p>
        </div>
        {isManagerPlus && (
          <a href="/objectives/new"
            className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
            + New Objective
          </a>
        )}
      </div>

      <Suspense fallback={<ObjectivesSkeleton />}>
        <ObjectivesContent orgId={user.organizationId} userId={user.id} role={user.role} />
      </Suspense>
    </div>
  );
}

function ObjectivesSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}