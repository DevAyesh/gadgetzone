"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export async function addCollection(formData: FormData) {
  const supabase = await createAdminClient();

  const name = (formData.get("name") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug || slugify(name);

  const { error } = await supabase.from("collections").insert({
    name,
    slug,
  });

  if (error) {
    console.error("Error creating collection:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/collections");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/collections");
}

export async function updateCollection(formData: FormData) {
  const supabase = await createAdminClient();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug || slugify(name);

  const { error } = await supabase
    .from("collections")
    .update({
      name,
      slug,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating collection:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/collections");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/collections");
}

export async function deleteCollection(input: FormData | string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient();
  const id = typeof input === "string" ? input : (input.get("id") as string);

  if (!id) return { success: false, error: "Collection ID is required" };

  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) {
    console.error("Delete collection error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/collections");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}
