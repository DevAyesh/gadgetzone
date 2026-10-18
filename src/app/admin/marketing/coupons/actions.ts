"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createCoupon(formData: FormData) {
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const discountType = formData.get("discount_type") as string;
  const value = parseFloat(formData.get("value") as string);
  const validUntil = (formData.get("valid_until") as string)?.trim();
  const isActive = formData.get("is_active") === "true";

  if (!code || code.length < 3) {
    return { success: false, error: "Coupon code must be at least 3 characters" };
  }

  if (isNaN(value) || value <= 0) {
    return { success: false, error: "Discount value must be greater than zero" };
  }

  if (discountType === "percentage" && value > 100) {
    return { success: false, error: "Percentage discount cannot exceed 100%" };
  }

  try {
    const supabase = await createAdminClient();

    // Check if code already exists
    const { data: existing } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", code)
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: false, error: `Coupon code '${code}' already exists` };
    }

    const { error } = await supabase.from("coupons").insert({
      code,
      discount_percentage: discountType === "percentage" ? value : null,
      discount_amount: discountType === "fixed" ? Math.round(value * 100) : null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      is_active: isActive,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/marketing/coupons");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create coupon";
    return { success: false, error: message };
  }
}

export async function toggleCouponStatus(couponId: string, newStatus: boolean) {
  if (!couponId) {
    return { success: false, error: "Coupon ID is required" };
  }

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: newStatus })
      .eq("id", couponId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/marketing/coupons");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update coupon";
    return { success: false, error: message };
  }
}

export async function deleteCoupon(couponId: string) {
  if (!couponId) {
    return { success: false, error: "Coupon ID is required" };
  }

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", couponId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/marketing/coupons");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete coupon";
    return { success: false, error: message };
  }
}
