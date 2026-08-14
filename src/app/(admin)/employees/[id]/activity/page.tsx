// // src/app/(admin)/employees/[id]/activity/page.tsx
// import { Suspense }                from "react";
// import { getCurrentUser, requireRole } from "@/lib/auth";
// import { getEmployeeActivity }     from "@/actions/employee-activity.actions";
// import { EmployeeActivityClient }  from "@/components/employee/employee-activity-client";
// import { Skeleton }                from "@/components/ui/skeleton";
// import { notFound }                from "next/navigation";

// async function ActivityContent({ employeeId }: { employeeId: string }) {
//   try {
//     const data = await getEmployeeActivity(employeeId);
//     if (!data.employee) notFound();
//     return <EmployeeActivityClient data={data} />;
//   } catch (e: any) {
//     if (e.message === "Employee not in your scope") notFound();
//     throw e;
//   }
// }

// export default async function EmployeeActivityPage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const user = await getCurrentUser();
//   requireRole(user.role, "MANAGER");

//   return (
//     <div className="space-y-6">
//       <Suspense fallback={
//         <div className="space-y-4">
//           <Skeleton className="h-32 rounded-xl" />
//           {Array.from({ length: 4 }).map((_, i) => (
//             <Skeleton key={i} className="h-24 rounded-xl" />
//           ))}
//         </div>
//       }>
//         <ActivityContent employeeId={params.id} />
//       </Suspense>
//     </div>
//   );
// }




// src/app/(admin)/employees/[id]/activity/page.tsx

import { Suspense } from "react";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getEmployeeActivity } from "@/actions/employee-activity.actions";
import { EmployeeActivityClient } from "@/components/employee/employee-activity-client";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";

async function ActivityContent({ employeeId }: { employeeId: string }) {
  try {
    const data = await getEmployeeActivity(employeeId);

    if (!data.employee) {
      notFound();
    }

    return <EmployeeActivityClient data={data} />;
  } catch (e: any) {
    if (e.message === "Employee not in your scope") {
      notFound();
    }

    throw e;
  }
}

export default async function EmployeeActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const { id } = await params;

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />

            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        }
      >
        <ActivityContent employeeId={id} />
      </Suspense>
    </div>
  );
}