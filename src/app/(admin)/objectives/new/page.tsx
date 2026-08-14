// // src/app/(admin)/objectives/new/page.tsx
// import { getCurrentUser, requireRole } from "@/lib/auth";
// import { getObjectiveFormData }         from "@/actions/objectives.actions";
// import { CreateObjectiveForm }          from "@/components/objectives/create-objective-form";

// export default async function NewObjectivePage() {
//   const user = await getCurrentUser();
//   requireRole(user.role, "MANAGER");

//   const formData = await getObjectiveFormData(user.organizationId, user.id);

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       <div>
//         <a href="/objectives" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
//           ← Back to objectives
//         </a>
//         <h1 className="text-xl font-bold text-foreground mt-1">Create New Objective</h1>
//         <p className="text-sm text-muted-foreground mt-0.5">
//           Define a clear goal and measurable key results
//         </p>
//       </div>

//       <CreateObjectiveForm formData={formData} />
//     </div>
//   );
// }


// src/app/(admin)/objectives/new/page.tsx
import { getCurrentUser }     from "@/lib/auth";
import { getObjectiveFormData } from "@/actions/objectives.actions";
import { getOrgSubscription }  from "@/actions/subscription.actions";
import { CreateObjectiveForm } from "@/components/objectives/create-objective-form";
import { requireRole }         from "@/lib/auth";

export default async function NewObjectivePage() {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const [formData, sub] = await Promise.all([
    getObjectiveFormData(user.organizationId, user.id),
    getOrgSubscription(user.organizationId),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Create Objective</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Set a new OKR for yourself or your team
        </p>
      </div>
      <CreateObjectiveForm formData={formData} plan={sub.plan} />
    </div>
  );
}