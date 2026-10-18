import { createAdminClient } from "@/lib/supabase/admin";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { addProduct } from "../actions";

export default async function NewProductPage(props: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;

  const supabase = await createAdminClient();
  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("collections").select("*").order("name"),
  ]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create a new item in your store&apos;s inventory catalog.
          </p>
        </div>
        <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{decodeURIComponent(error)}</span>
        </div>
      )}

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">Product Name *</label>
                <input 
                  id="name" name="name" required type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. iPhone 16 Pro Max"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="slug">URL Slug (Optional)</label>
                <input 
                  id="slug" name="slug" type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Leave blank to auto-generate"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="brand">Brand</label>
                <input 
                  id="brand" name="brand" type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. Apple, Samsung, Sony"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="price">Price (Rs.) *</label>
                <input 
                  id="price" name="price" required type="number" step="0.01" min="0"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="999.99"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="old_price">Original / Strike-through Price (Optional)</label>
                <input 
                  id="old_price" name="old_price" type="number" step="0.01" min="0"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="1099.99"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="stock">Stock Quantity *</label>
                <input 
                  id="stock" name="stock" required type="number" min="0" defaultValue="10"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="category_id">Category</label>
                <select 
                  id="category_id" name="category_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="none">Select Category...</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="collection_id">Curated Collection (Optional)</label>
                <select 
                  id="collection_id" name="collection_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="none">None</option>
                  {collections?.map(col => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="badge">Promotional Badge</label>
                <select 
                  id="badge" name="badge" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="NONE">None</option>
                  <option value="NEW">NEW</option>
                  <option value="HOT">HOT</option>
                  <option value="SALE">SALE</option>
                </select>
              </div>

              <div className="space-y-2 flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input
                    type="checkbox"
                    name="is_popular"
                    className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                  />
                  Feature in Popular Items Section
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="image_url">Primary Image URL</label>
              <input 
                id="image_url" name="image_url" type="url"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">Full Product Description</label>
              <textarea 
                id="description" name="description" rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter detailed technical specifications, warranty, and features..."
              />
            </div>

            <Button type="submit" className="w-full">Create and Publish Product</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
