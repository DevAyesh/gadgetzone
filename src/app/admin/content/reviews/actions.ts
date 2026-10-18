"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function toggleReviewApproval(reviewId: string, newStatus: boolean) {
  if (!reviewId) {
    return { success: false, error: "Review ID is required" };
  }

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("reviews")
      .update({
        is_approved: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/content/reviews");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update review";
    return { success: false, error: message };
  }
}

export async function deleteReview(reviewId: string) {
  if (!reviewId) {
    return { success: false, error: "Review ID is required" };
  }

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/content/reviews");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete review";
    return { success: false, error: message };
  }
}
