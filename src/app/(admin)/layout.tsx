// // app/(admin)/layout.tsx
// import { redirect }       from "next/navigation";
// import { getCurrentUser } from "@/lib/auth";
// import { prisma }         from "@/lib/prisma";
// import { Sidebar }        from "@/components/layout/sidebar";
// import { Navbar }         from "@/components/layout/navbar";
// import { getBranding } from "@/actions/branding.actions";
// import { getContrastColor } from "@/lib/color";
// export default async function AdminLayout({ children }: { children: React.ReactNode }) {
//   const user = await getCurrentUser();
//   const branding = await getBranding(user.organizationId);

//   // SUPER_ADMIN has its own area
//   if (user.role === "SUPER_ADMIN") redirect("/platform");

//   // Fetch unread notifications count
//   const unreadCount = await prisma.notification.count({
//     where: { userId: user.id, isRead: false },
//   });

//   const organization = user.organizationId
//     ? await prisma.organization.findUnique({
//         where: { id: user.organizationId },
//       })
//     : null;

//   const orgName = organization?.name ?? "OKR Desk";
//   const orgLogo = organization?.logo ?? null;

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Fixed sidebar */}
//       <Sidebar
//         user={user}
//         orgName={orgName}
//         orgLogo={orgLogo}
//         unreadCount={unreadCount}
//         primaryColor={branding.primaryColor}
//       />

//       {/* Main content — offset by sidebar width */}
//       <div className="ml-[220px] flex flex-col min-h-screen">
//         {/* Fixed navbar */}
//         <Navbar user={user} orgName={orgName} unreadCount={unreadCount} />

//         {/* Page content — offset by navbar height */}
//         <main className="flex-1 mt-14 p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }




// app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { getBranding } from "@/actions/branding.actions";
import { getContrastColor } from "@/lib/color";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // SUPER_ADMIN has its own area
  if (user.role === "SUPER_ADMIN") {
    redirect("/platform");
  }

  const [branding, unreadCount, organization] = await Promise.all([
    getBranding(user.organizationId),

    prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    }),

    prisma.organization.findUnique({
      where: {
        id: user.organizationId,
      },
    }),
  ]);

  const orgName = organization?.name ?? "OKR Desk";
  const orgLogo = organization?.logo ?? null;

  const primaryColor = branding.primaryColor ?? "#6366f1";

  const primaryForeground = getContrastColor(primaryColor);

  return (
    <div
      className="min-h-screen bg-background"
      style={
        {
          "--primary": primaryColor,
          "--primary-foreground": primaryForeground,

          // Sidebar active/accent color
          "--sidebar-accent": primaryColor,
          "--sidebar-primary": primaryColor,
        } as React.CSSProperties
      }
    >
      {/* Fixed sidebar */}
      <Sidebar
        user={user}
        orgName={orgName}
        orgLogo={orgLogo}
        unreadCount={unreadCount}
        primaryColor={primaryColor}
      />

      {/* Main content */}
      <div className="ml-[220px] flex flex-col min-h-screen">
        <Navbar
          user={user}
          orgName={orgName}
          unreadCount={unreadCount}
        />

        <main className="flex-1 mt-14 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}