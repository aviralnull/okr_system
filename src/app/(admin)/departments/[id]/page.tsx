// src/app/(admin)/departments/[id]/page.tsx
import { notFound }       from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDepartmentById, getDepartmentFormData } from "@/actions/department.actions";
import { DepartmentDetailClient } from "@/components/departments/department-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DepartmentDetailPage({ params }: Props) {
  const { id } = await params;
  const user   = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const [dept, { managers }] = await Promise.all([
    getDepartmentById(id, user.organizationId),
    getDepartmentFormData(user.organizationId),
  ]);

  if (!dept) notFound();

  return <DepartmentDetailClient dept={dept} managers={managers} />;
}