import { createClient } from "@/lib/supabase/server";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { updateProduct } from "../../actions";
import { notFound } from "next/navigation";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const { data: collections } = await supabase.from("collections").select("*").order("name");
  const { data: product } = await supabase.from("products").select("*, product_images(image_url, is_primary)").eq("id", params.id).single();

  if (!product) {
    notFound();
  }

  const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
                        || product.product_images?.[0]?.image_url 
                        || "";

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProduct} className="space-y-6">
            <input type="hidden" name="id" value={product.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">Product Name</label>
                <input 
                  id="name" name="name" required type="text"
                  defaultValue={product.name}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="slug">URL Slug</label>
                <input 
                  id="slug" name="slug" required type="text"
                  defaultValue={product.slug}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="price">Price (Rs.)</label>
                <input 
                  id="price" name="price" required type="number" step="0.01" min="0"
                  defaultValue={product.price / 100}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="stock">Stock Quantity</label>
                <input 
                  id="stock" name="stock" required type="number" min="0"
                  defaultValue={product.stock}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="category_id">Category</label>
                <select 
                  id="category_id" name="category_id" required
                  defaultValue={product.category_id || "none"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="none">Select Category...</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="collection_id">Collection (Optional)</label>
                <select 
                  id="collection_id" name="collection_id"
                  defaultValue={product.collection_id || "none"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="none">None</option>
                  {collections?.map(col => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="badge">Product Badge</label>
                <select 
                  id="badge" name="badge" 
                  defaultValue={product.badge || "NONE"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="NONE">None</option>
                  <option value="NEW">NEW</option>
                  <option value="HOT">HOT</option>
                  <option value="SALE">SALE</option>
                </select>
              </div>
            
              <div className="space-y-2 flex flex-col justify-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="is_popular" 
                    id="is_popular"
                    defaultChecked={product.is_popular}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium">Mark as Popular Product</span>
                </label>
                <p className="text-xs text-muted-foreground ml-6">This will show the product in the Popular Products section on the homepage.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="image_url">Image URL</label>
              <input 
                id="image_url" name="image_url" type="url"
                defaultValue={primaryImage}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">Description</label>
              <textarea 
                id="description" name="description" rows={4}
                defaultValue={product.description || ""}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <Button type="submit" className="w-full">Update Product</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
