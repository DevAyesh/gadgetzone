"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCustomerRole(userId: string, newRole: "customer" | "admin") {
  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  try {
    // 1. Verify current session is a super_admin
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized: not authenticated" };
    }

    const { data: callerProfile } = await supabaseUser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!callerProfile || (callerProfile.role !== "super_admin" && callerProfile.role !== "admin")) {
      return { success: false, error: "Permission denied: Only Admins can alter customer roles." };
    }

    // 2. Perform role update via admin client
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/customers");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user role";
    return { success: false, error: message };
  }
}
