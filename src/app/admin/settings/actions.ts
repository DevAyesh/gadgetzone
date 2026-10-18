"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function savePlatformSettings(entries: Record<string, string>) {
  try {
    const supabase = await createAdminClient();

    const upsertRows = Object.entries(entries).map(([key, val]) => ({
      setting_key: key,
      setting_value: val,
      updated_at: new Date().toISOString(),
    }));

    for (const row of upsertRows) {
      // Check if existing
      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("setting_key", row.setting_key)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase
          .from("settings")
          .update({
            setting_value: row.setting_value,
            updated_at: row.updated_at,
          })
          .eq("id", existing[0].id);
      } else {
        await supabase.from("settings").insert(row);
      }
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to persist settings";
    console.error("Failed to save platform settings:", err);
    return { success: false, error: message };
  }
}
