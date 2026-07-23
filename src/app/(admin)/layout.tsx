// app/(admin)/layout.tsx
import { redirect }       from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { Sidebar }        from "@/components/layout/sidebar";
import { Navbar }         from "@/components/layout/navbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // SUPER_ADMIN has its own area
  if (user.role === "SUPER_ADMIN") redirect("/platform");

  // Fetch unread notifications count
  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  const organization = user.organizationId
    ? await prisma.organization.findUnique({
        where: { id: user.organizationId },
      })
    : null;

  const orgName = organization?.name ?? "OKR Desk";
  const orgLogo = organization?.logo ?? null;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed sidebar */}
      <Sidebar
        user={user}
        orgName={orgName}
        orgLogo={orgLogo}
        unreadCount={unreadCount}
      />

      {/* Main content — offset by sidebar width */}
      <div className="ml-[220px] flex flex-col min-h-screen">
        {/* Fixed navbar */}
        <Navbar user={user} unreadCount={unreadCount} />

        {/* Page content — offset by navbar height */}
        <main className="flex-1 mt-14 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}