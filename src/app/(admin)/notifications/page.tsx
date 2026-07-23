
// import { Suspense }       from "react";
// import { getCurrentUser } from "@/lib/auth";
// import { getNotifications } from "@/actions/notification.actions";
// import { NotificationsClient } from "@/components/notifications/notifications-client";
// import { Skeleton }            from "@/components/ui/skeleton";

// async function NotificationsContent({ userId, orgId }: { userId: string; orgId: string }) {
//   const notifications = await getNotifications(userId, orgId);
//   return <NotificationsClient notifications={notifications} />;
// }

// export default async function NotificationsPage() {
//   const user = await getCurrentUser();

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-xl font-bold text-foreground">Notifications</h1>
//         <p className="text-sm text-muted-foreground mt-0.5">
//           Stay updated on your OKRs, reviews, and team activity
//         </p>
//       </div>
//       <Suspense fallback={<NotifSkeleton />}>
//         <NotificationsContent userId={user.id} orgId={user.organizationId} />
//       </Suspense>
//     </div>
//   );
// }

// function NotifSkeleton() {
//   return (
//     <div className="space-y-2">
//       {Array.from({ length: 6 }).map((_, i) => (
//         <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
//           <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
//           <div className="flex-1 space-y-2">
//             <Skeleton className="h-4 w-48" />
//             <Skeleton className="h-3 w-64" />
//             <Skeleton className="h-3 w-24" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }



import { Suspense }            from "react";
import { getCurrentUser }      from "@/lib/auth";
import { getNotifications }    from "@/actions/notification.actions";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { Skeleton }            from "@/components/ui/skeleton";

async function NotificationsContent({ userId, orgId }: { userId: string; orgId: string }) {
  // ✅ Scoped to current user only
  const notifications = await getNotifications(userId, orgId);
  return <NotificationsClient notifications={notifications} />;
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your personal notifications — OKR updates, reviews, and comments
        </p>
      </div>
      <Suspense fallback={
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      }>
        <NotificationsContent userId={user.id} orgId={user.organizationId} />
      </Suspense>
    </div>
  );
}

