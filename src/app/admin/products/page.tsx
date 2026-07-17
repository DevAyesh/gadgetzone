import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { AddProductDialog } from "./add-product-dialog";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";

export default async function AdminProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const filter = typeof searchParams?.filter === 'string' ? searchParams.filter : '';

  const supabase = await createClient();
  
  // Fetch categories
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  // Fetch collections
  const { data: collections } = await supabase.from("collections").select("*").order("name");

  // Fetch products
  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(name),
      collection:collections(name),
      images:product_images(image_url, is_primary)
    `)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  
  if (filter && filter !== "all") {
    query = query.eq("category_id", filter);
  }

  const { data: products } = await query;



  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
        <AddProductDialog categories={categories || []} collections={collections || []} />
      </div>

      <DataTableToolbar 
        searchPlaceholder="Search products by name..." 
        filterOptions={categories?.map(c => ({ label: c.name, value: c.id })) || []}
        filterPlaceholder="All Categories"
      />

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product) => {
                const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url 
                                    || product.images?.[0]?.image_url 
                                    || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80";

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.name}
                        {product.is_popular && (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-[10px] font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            Popular
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name || "None"}</TableCell>
                    <TableCell>
                      {product.collection?.name ? (
                        <Badge variant="outline">{product.collection.name}</Badge>
                      ) : "None"}
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                        {product.stock} in stock
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.is_active ? (
                        <span className="flex items-center text-sm text-green-500"><span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>Active</span>
                      ) : (
                        <span className="flex items-center text-sm text-muted-foreground"><span className="h-2 w-2 rounded-full bg-muted-foreground mr-2"></span>Draft</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/products/${product.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <Edit className="h-4 w-4" />
                      </Link>
                      <form action={async () => {
                        "use server";
                        const { deleteProduct } = await import("./actions");
                        const formData = new FormData();
                        formData.append("id", product.id);
                        await deleteProduct(formData);
                      }} className="inline-block">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" type="submit">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
