// src/app/(admin)/reviews/page.tsx
import { Suspense }       from "react";
import { getCurrentUser } from "@/lib/auth";
import { getReviews, getReviewFormData, getReviewStats } from "@/actions/review.actions";
import { ReviewsClient }  from "@/components/reviews/reviews-client";
import { Skeleton }       from "@/components/ui/skeleton";

async function ReviewsContent({ orgId, userId, role }: {
  orgId: string; userId: string; role: string;
}) {
  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(role);

  const [reviews, formData, stats] = await Promise.all([
    getReviews(orgId, userId, role),
    isManagerPlus ? getReviewFormData(orgId, userId) : Promise.resolve(undefined),
    isManagerPlus ? getReviewStats(orgId)            : Promise.resolve(undefined),
  ]);

  return (
    <ReviewsClient
      reviews={reviews}
      formData={formData}
      stats={stats}
      isManagerPlus={isManagerPlus}
      currentUserId={userId}
    />
  );
}

export default async function ReviewsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {["MANAGER","HR","ORG_ADMIN","SUPER_ADMIN"].includes(user.role)
            ? "Performance Reviews"
            : "My Reviews"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {["MANAGER","HR","ORG_ADMIN","SUPER_ADMIN"].includes(user.role)
            ? "Submit and manage team performance reviews"
            : "View your performance feedback"}
        </p>
      </div>

      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsContent orgId={user.organizationId} userId={user.id} role={user.role} />
      </Suspense>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}