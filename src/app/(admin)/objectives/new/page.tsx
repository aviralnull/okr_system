// src/app/(admin)/objectives/new/page.tsx
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getObjectiveFormData }         from "@/actions/objectives.actions";
import { CreateObjectiveForm }          from "@/components/objectives/create-objective-form";

export default async function NewObjectivePage() {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const formData = await getObjectiveFormData(user.organizationId, user.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <a href="/objectives" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back to objectives
        </a>
        <h1 className="text-xl font-bold text-foreground mt-1">Create New Objective</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Define a clear goal and measurable key results
        </p>
      </div>

      <CreateObjectiveForm formData={formData} />
    </div>
  );
}