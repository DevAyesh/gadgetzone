"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface StockAdjustResult {
  success: boolean;
  error?: string;
  newStock?: number;
}

export async function adjustProductStock(
  productId: string,
  newStock: number,
  reason: string
): Promise<StockAdjustResult> {
  if (!productId) {
    return { success: false, error: "Product ID is required" };
  }

  if (isNaN(newStock) || newStock < 0) {
    return { success: false, error: "Stock count must be a non-negative number" };
  }

  const cleanReason = (reason || "Manual adjustment").trim();

  try {
    const supabase = await createAdminClient();

    // 1. Fetch current stock
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("id, name, stock")
      .eq("id", productId)
      .single();

    if (fetchError || !currentProduct) {
      return { success: false, error: "Product not found" };
    }

    const previousStock = currentProduct.stock ?? 0;
    const quantityChange = newStock - previousStock;

    // 2. Update product stock
    const { error: updateError } = await supabase
      .from("products")
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (updateError) {
      console.error("Failed to update product stock:", updateError);
      return { success: false, error: updateError.message };
    }

    // 3. Record in inventory_log
    const { error: logError } = await supabase.from("inventory_log").insert({
      product_id: productId,
      quantity_change: quantityChange,
      reason: cleanReason,
    });

    if (logError) {
      console.warn("Failed to record inventory log:", logError.message);
      // Non-fatal: stock was updated, log failure is noted
    }

    // 4. Revalidate relevant paths
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/inventory/stock-history");
    revalidatePath("/admin");
    revalidatePath("/admin/products");

    return { success: true, newStock };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to adjust stock";
    console.error("Error adjusting stock:", err);
    return { success: false, error: message };
  }
}
