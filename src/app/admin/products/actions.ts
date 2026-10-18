"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export async function addProduct(formData: FormData) {
  const supabase = await createAdminClient();

  const name = (formData.get("name") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug || slugify(name);
  const category_id = formData.get("category_id") as string;
  const collection_id = formData.get("collection_id") as string;
  const price = parseFloat(formData.get("price") as string) * 100; // Convert to cents
  const oldPriceStr = formData.get("old_price") as string;
  const old_price = oldPriceStr ? parseFloat(oldPriceStr) * 100 : null;
  const stock = parseInt(formData.get("stock") as string, 10) || 0;
  const badge = formData.get("badge") as string;
  const description = formData.get("description") as string;
  const image_url = formData.get("image_url") as string;
  const brand = (formData.get("brand") as string)?.trim() || null;
  const is_popular = formData.get("is_popular") === "on";

  const { data: insertedProduct, error } = await supabase.from("products").insert({
    name,
    slug,
    category_id: category_id === "none" ? null : category_id,
    collection_id: collection_id === "none" ? null : collection_id,
    price,
    old_price,
    stock,
    badge: badge === "NONE" ? "" : badge,
    description,
    brand,
    is_active: true,
    is_popular,
  }).select("id").single();

  if (error) {
    console.error("Error inserting product:", error);
    redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
  }

  // Insert image if provided
  if (image_url && insertedProduct) {
    await supabase.from("product_images").insert({
      product_id: insertedProduct.id,
      image_url,
      is_primary: true
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/"); // Update homepage New Arrivals / Popular
  redirect("/admin/products");
}

export async function deleteProduct(input: FormData | string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient();
  const id = typeof input === "string" ? input : (input.get("id") as string);
  
  if (!id) {
    return { success: false, error: "Product ID is required" };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Delete product error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/"); // Update homepage
  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const supabase = await createAdminClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const category_id = formData.get("category_id") as string;
  const collection_id = formData.get("collection_id") as string;
  const price = parseFloat(formData.get("price") as string) * 100;
  const stock = parseInt(formData.get("stock") as string, 10);
  const badge = formData.get("badge") as string;
  const description = formData.get("description") as string;
  const image_url = formData.get("image_url") as string;
  const brand = formData.get("brand") as string;
  const is_popular = formData.get("is_popular") === "on";

  const { error } = await supabase.from("products").update({
    name,
    slug,
    category_id: category_id === "none" ? null : category_id,
    collection_id: collection_id === "none" ? null : collection_id,
    price,
    stock,
    badge: badge === "NONE" ? "" : badge,
    description,
    brand,
    is_popular,
  }).eq("id", id);

  if (error) {
    console.error("Update product error:", error);
    redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  if (image_url) {
    // Basic implementation: delete old images and insert the new one
    await supabase.from("product_images").delete().eq("product_id", id);
    await supabase.from("product_images").insert({
      product_id: id,
      image_url,
      is_primary: true
    });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/shop/${slug}`);
  revalidatePath("/"); // Update homepage
  redirect("/admin/products");
}
