// import { Suspense } from "react";
// import { getCurrentUser } from "@/lib/auth";
// import { getEmployeeFormData , getEmployees } from "@/actions/Employee.actions";
// import { EmployeesClient } from "@/components/employee/employee-client";
// import { EmployeeDashboard } from "@/components/employee/employee-dashboard";
// import { Skeleton } from "@/components/ui/skeleton";

// async function EmployeesContent({ orgId }: { orgId: string }) {
//   const [employees, formData] = await Promise.all([
//     getEmployees(orgId),
//     getEmployeeFormData(orgId),
//   ]);
 
//   return <EmployeesClient employees={employees} formData={formData} />;

// }
 
// export default async function EmployeesPage() {
//   const user = await getCurrentUser();
 
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-xl font-bold text-foreground">Employees</h1>
//         <p className="text-sm text-muted-foreground mt-0.5">
//           Manage your organization's team members
//         </p>
//       </div>
 
//       <Suspense fallback={<EmployeesSkeleton />}>
//         <EmployeesContent orgId={user.organizationId} />
//       </Suspense>
//     </div>
//   );
// }
 
// function EmployeesSkeleton() {
//   return (
//     <div className="space-y-4">
//       {/* Toolbar skeleton */}
//       <div className="flex items-center gap-3">
//         <Skeleton className="h-9 flex-1 max-w-sm" />
//         <Skeleton className="h-9 w-32" />
//         <Skeleton className="h-9 w-32" />
//         <Skeleton className="h-9 w-32 ml-auto" />
//       </div>
//       {/* Table skeleton */}
//       <div className="rounded-xl border border-border bg-card">
//         <div className="p-4 border-b border-border">
//           <div className="grid grid-cols-7 gap-4">
//             {Array.from({ length: 7 }).map((_, i) => (
//               <Skeleton key={i} className="h-4" />
//             ))}
//           </div>
//         </div>
//         {Array.from({ length: 6 }).map((_, i) => (
//           <div key={i} className="p-4 border-b border-border last:border-0">
//             <div className="grid grid-cols-7 gap-4 items-center">
//               <div className="flex items-center gap-3">
//                 <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
//                 <div className="space-y-1.5 flex-1">
//                   <Skeleton className="h-3.5 w-24" />
//                   <Skeleton className="h-3 w-32" />
//                 </div>
//               </div>
//               {Array.from({ length: 6 }).map((_, j) => (
//                 <Skeleton key={j} className="h-4 w-20" />
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



// src/app/(admin)/employees/page.tsx
import { Suspense }       from "react";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { EmployeesClient } from "@/components/employee/employee-client";
import { Skeleton }        from "@/components/ui/skeleton";

async function EmployeesContent({ orgId, role }: { orgId: string; role: string }) {
  const isOrgAdmin = ["ORG_ADMIN", "SUPER_ADMIN", "HR"].includes(role);
  const isManager  = role === "MANAGER";

  const [employees, teams, departments, managers] = await Promise.all([
    prisma.user.findMany({
      where:   { organizationId: orgId, isActive: true, role: { not: "SUPER_ADMIN" } },
      orderBy: { name: "asc" },
     include: {
  department: {
    select: {
      id: true,
      name: true,
    },
  },

  team: {
    select: {
      id: true,
      name: true,
    },
  },

  manager: {
    select: {
      name: true,
    },
  },

  _count: {
    select: {
      objectives: true,
    },
  },
},
    }),
    prisma.team.findMany({
      where:   { organizationId: orgId },
      select:  { id: true, name: true, department: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      where:   { organizationId: orgId },
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where:   { organizationId: orgId, role: { in: ["MANAGER", "HR", "ORG_ADMIN"] }, isActive: true },
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <EmployeesClient
      employees={employees as any}
      formData={{ teams, departments, managers }}
      isOrgAdmin={isOrgAdmin}
    />
  );
}

export default async function EmployeesPage() {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage team members, roles, and assignments
          </p>
        </div>
        {["ORG_ADMIN", "SUPER_ADMIN"].includes(user.role) && (
          <a href="/invitations"
            className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
            + Invite Employee
          </a>
        )}
      </div>
      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      }>
        <EmployeesContent orgId={user.organizationId} role={user.role} />
      </Suspense>
    </div>
  );
}