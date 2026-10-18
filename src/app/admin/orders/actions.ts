"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  if (!orderId) {
    return { success: false, error: "Order ID is required" };
  }

  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: `Invalid status: ${status}` };
  }

  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id, status")
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Order not found" };
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
    revalidatePath("/admin/reports/sales");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order status";
    return { success: false, error: message };
  }
}
