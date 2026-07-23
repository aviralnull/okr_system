// // src/app/(admin)/departments/page.tsx
// import { Suspense }       from "react";
// import { getCurrentUser, requireRole } from "@/lib/auth";
// import { getDepartments, getDepartmentFormData } from "@/actions/department.actions";
// import { DepartmentsClient } from "@/components/departments/departments-client";
// import { Skeleton }          from "@/components/ui/skeleton";

// async function DepartmentsContent({ orgId }: { orgId: string }) {
//   const [departments, { managers }] = await Promise.all([
//     getDepartments(orgId),
//     getDepartmentFormData(orgId),
//   ]);
//   return <DepartmentsClient departments={departments} managers={managers} />;
// }

// export default async function DepartmentsPage() {
//   const user = await getCurrentUser();
//   requireRole(user.role, "ORG_ADMIN");

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-xl font-bold text-foreground">Departments</h1>
//         <p className="text-sm text-muted-foreground mt-0.5">
//           Organize your team into departments
//         </p>
//       </div>

//       <Suspense fallback={<DepartmentsSkeleton />}>
//         <DepartmentsContent orgId={user.organizationId} />
//       </Suspense>
//     </div>
//   );
// }

// function DepartmentsSkeleton() {
//   return (
//     <div className="space-y-4">
//       <div className="flex gap-3">
//         <Skeleton className="h-9 w-64" />
//         <Skeleton className="h-9 w-36 ml-auto" />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {Array.from({ length: 6 }).map((_, i) => (
//           <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
//             <div className="flex items-center gap-3">
//               <Skeleton className="w-10 h-10 rounded-xl" />
//               <div className="space-y-1.5">
//                 <Skeleton className="h-4 w-28" />
//                 <Skeleton className="h-3 w-16" />
//               </div>
//             </div>
//             <Skeleton className="h-10 rounded-lg" />
//             <div className="flex gap-1">
//               {Array.from({ length: 3 }).map((_, j) => (
//                 <Skeleton key={j} className="w-6 h-6 rounded-full" />
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }




import { Suspense }       from "react";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDepartments, getDepartmentFormData } from "@/actions/department.actions";
import { DepartmentsClient } from "@/components/departments/departments-client";
import { Skeleton }          from "@/components/ui/skeleton";

async function DepartmentsContent({ orgId }: { orgId: string }) {
  const [departments, formData] = await Promise.all([
    getDepartments(orgId),
    getDepartmentFormData(orgId),
  ]);
  return <DepartmentsClient departments={departments} formData={formData} />;
}

export default async function DepartmentsPage() {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Departments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Organize your team into departments
        </p>
      </div>
      <Suspense fallback={<DeptSkeleton />}>
        <DepartmentsContent orgId={user.organizationId} />
      </Suspense>
    </div>
  );
}

function DeptSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36 ml-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-10 rounded-lg" />
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="w-6 h-6 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
