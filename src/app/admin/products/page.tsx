import { createAdminClient } from "@/lib/supabase/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AddProductDialog } from "./add-product-dialog";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { ProductRowActions } from "@/components/admin/product-row-actions";

interface ProductImageItem {
  image_url: string;
  is_primary?: boolean;
}

interface NamedRelation {
  name?: string;
}

export default async function AdminProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === "string" ? searchParams.q : "";
  const filter = typeof searchParams?.filter === "string" ? searchParams.filter : "";

  const supabase = await createAdminClient();

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
    query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
  }

  if (filter && filter !== "all") {
    query = query.eq("category_id", filter);
  }

  const { data: products } = await query;

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your store&apos;s item catalog, pricing, variants, and stock.
          </p>
        </div>
        <AddProductDialog categories={categories || []} collections={collections || []} />
      </div>

      <DataTableToolbar
        searchPlaceholder="Search products by name..."
        filterOptions={categories?.map((c) => ({ label: c.name, value: c.id })) || []}
        filterPlaceholder="All Categories"
      />

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
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
                const primaryImage =
                  product.images?.find((img: ProductImageItem) => img.is_primary)?.image_url ||
                  product.images?.[0]?.image_url ||
                  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80";

                const categoryName =
                  (Array.isArray(product.category)
                    ? product.category[0]?.name
                    : (product.category as NamedRelation | null)?.name) || "None";

                const collectionName =
                  Array.isArray(product.collection)
                    ? product.collection[0]?.name
                    : (product.collection as NamedRelation | null)?.name;

                return (
                  <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {primaryImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{product.name}</span>
                        {product.is_popular && (
                          <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                            Popular
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {categoryName}
                    </TableCell>
                    <TableCell>{product.brand || "—"}</TableCell>
                    <TableCell>
                      {collectionName ? (
                        <Badge variant="outline">
                          {collectionName}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                        {product.stock} in stock
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.is_active ? (
                        <span className="flex items-center text-sm text-green-500">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-sm text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground mr-2" />
                          Draft
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ProductRowActions productId={product.id} productName={product.name} />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No products found matching criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
