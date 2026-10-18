"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export async function addCategory(formData: FormData) {
  const supabase = await createAdminClient();

  const name = (formData.get("name") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug || slugify(name);
  const icon = (formData.get("icon") as string)?.trim() || "📦";

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    icon,
  });

  if (error) {
    console.error("Error creating category:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  const supabase = await createAdminClient();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug || slugify(name);
  const icon = (formData.get("icon") as string)?.trim() || "📦";

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      icon,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating category:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/categories");
}

export async function deleteCategory(input: FormData | string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient();
  const id = typeof input === "string" ? input : (input.get("id") as string);

  if (!id) return { success: false, error: "Category ID is required" };

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("Delete category error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}
