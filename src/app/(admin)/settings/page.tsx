
// // src/app/(admin)/settings/page.tsx
// import { Suspense }         from "react";
// import { getCurrentUser }   from "@/lib/auth";
// import { getSettingsData }  from "@/actions/settings.actions";
// import { SettingsClient }   from "@/components/settings/settings-client";
// import { Skeleton }         from "@/components/ui/skeleton";

// async function SettingsContent({ userId, orgId }: { userId: string; orgId: string }) {
//   const data = await getSettingsData(userId, orgId);
//   return <SettingsClient data={data} />;
// }

// export default async function SettingsPage() {
//   const user = await getCurrentUser();

//   return (
//     <div className="space-y-6 max-w-4xl">
//       <div>
//         <h1 className="text-xl font-bold text-foreground">Settings</h1>
//         <p className="text-sm text-muted-foreground mt-0.5">
//           Manage your account, organization, and preferences
//         </p>
//       </div>

//       <Suspense fallback={<SettingsSkeleton />}>
//         <SettingsContent userId={user.id} orgId={user.organizationId} />
//       </Suspense>
//     </div>
//   );
// }

// function SettingsSkeleton() {
//   return (
//     <div className="space-y-4">
//       <div className="flex gap-2">
//         {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-28 rounded-lg" />)}
//       </div>
//       <div className="rounded-xl border border-border bg-card p-6 space-y-4">
//         <Skeleton className="h-16 w-16 rounded-full" />
//         <Skeleton className="h-10 w-full" />
//         <Skeleton className="h-10 w-full" />
//         <Skeleton className="h-24 w-full" />
//       </div>
//     </div>
//   );
// }



// import { Suspense }               from "react";
// import { getCurrentUser }         from "@/lib/auth";
// import { getSettingsData }        from "@/actions/settings.actions";
// import { getOrgSubscription }     from "@/actions/subscription.actions";
// import { SettingsClient }         from "@/components/settings/settings-client";
// import { Skeleton }               from "@/components/ui/skeleton";

// async function SettingsContent({ userId, orgId }: { userId: string; orgId: string }) {
//   const [data, sub] = await Promise.all([
//     getSettingsData(userId, orgId),
//     getOrgSubscription(orgId),
//   ]);
//   return <SettingsClient data={data} sub={sub} />;
// }

// export default async function SettingsPage() {
//   const user = await getCurrentUser();

//   return (
//     <div className="space-y-6 max-w-4xl">
//       <div>
//         <h1 className="text-xl font-bold text-foreground">Settings</h1>
//         <p className="text-sm text-muted-foreground mt-0.5">
//           Manage your account, organization, and preferences
//         </p>
//       </div>

//       <Suspense fallback={<SettingsSkeleton />}>
//         <SettingsContent userId={user.id} orgId={user.organizationId} />
//       </Suspense>
//     </div>
//   );
// }

// function SettingsSkeleton() {
//   return (
//     <div className="space-y-4">
//       <div className="flex gap-2">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <Skeleton key={i} className="h-9 w-28 rounded-lg" />
//         ))}
//       </div>
//       <div className="rounded-xl border border-border bg-card p-6 space-y-4">
//         <Skeleton className="h-16 w-16 rounded-full" />
//         <Skeleton className="h-10 w-full" />
//         <Skeleton className="h-10 w-full" />
//         <Skeleton className="h-24 w-full" />
//       </div>
//     </div>
//   );
// }




// src/app/(admin)/settings/page.tsx
import { Suspense }               from "react";
import { getCurrentUser }         from "@/lib/auth";
import { getSettingsData }        from "@/actions/settings.actions";
import { getOrgSubscription }     from "@/actions/subscription.actions";
import { getBranding }            from "@/actions/branding.actions";
import { SettingsClient }         from "@/components/settings/settings-client";
import { Skeleton }               from "@/components/ui/skeleton";

async function SettingsContent({ userId, orgId }: { userId: string; orgId: string }) {
  const [data, sub, branding] = await Promise.all([
    getSettingsData(userId, orgId),
    getOrgSubscription(orgId),
    getBranding(orgId),
  ]);
  return <SettingsClient data={data} sub={sub} branding={branding} />;
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, organization, and preferences
        </p>
      </div>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent userId={user.id} orgId={user.organizationId} />
      </Suspense>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-28 rounded-lg" />)}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}