import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: "GadgetZone Admin",
  description: "Admin panel for GadgetZone",
};

// Server Action — passed as a prop to the AdminSidebar Client Component.
// This is the correct Next.js App Router pattern for cross-boundary server actions.
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

  // Derive display name for the sidebar avatar
  const userInitial =
    profile.first_name?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "A";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Collapsible Grouped Sidebar (Client Component) */}
      <AdminSidebar
        logoutAction={logoutAction}
        userInitial={userInitial}
        userEmail={user.email}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="h-14 border-b border-border/50 glass sticky top-0 z-10 flex items-center justify-between px-6 flex-shrink-0">
          <div className="text-sm font-medium text-muted-foreground">
            Admin Portal
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center font-bold text-sm text-primary">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
