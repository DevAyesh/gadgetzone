import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata: Metadata = {
  title: "GadgetZone Admin",
  description: "Admin panel for GadgetZone",
};

// Server Action passed as prop to AdminSidebar & AdminHeader
async function logoutAction() {
  "use server";
  const { logout } = await import("@/app/(store)/(auth)/actions");
  await logout();
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    redirect("/?error=Unauthorized Access");
  }

  // Fetch low stock count for header alert
  let lowStockCount = 0;
  try {
    const adminSupabase = await createAdminClient();
    const { count } = await adminSupabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lte("stock", 10);
    lowStockCount = count ?? 0;
  } catch (e) {
    console.error("Failed to fetch low stock count for admin header:", e);
  }

  // Derive display name for avatar
  const userInitial =
    profile.first_name?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "A";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Collapsible Grouped Sidebar for desktop */}
      <AdminSidebar
        logoutAction={logoutAction}
        userInitial={userInitial}
        userEmail={user.email}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header with mobile sheet navigation */}
        <AdminHeader
          userInitial={userInitial}
          userEmail={user.email}
          userRole={profile.role}
          lowStockCount={lowStockCount}
          logoutAction={logoutAction}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
