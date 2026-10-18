import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const supabase = await createAdminClient();

  const { data: rows, error } = await supabase
    .from("settings")
    .select("setting_key, setting_value");

  if (error) {
    console.error("Failed to load platform settings:", error);
  }

  const initialSettings: Record<string, string> = {};
  if (rows) {
    for (const row of rows) {
      if (row.setting_key && row.setting_value) {
        initialSettings[row.setting_key] = row.setting_value;
      }
    }
  }

  return (
    <div className="space-y-8 max-w-[1000px]">
      <PageHeader
        title="Store & Platform Settings"
        description="Configure store metadata, checkout rules, inventory alerts, and customer notifications."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
      />

      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}
