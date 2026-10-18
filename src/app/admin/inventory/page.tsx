import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StockAdjustDialog } from "@/components/admin/stock-adjust-dialog";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Warehouse,
  AlertTriangle,
  PackageX,
  Boxes,
  DollarSign,
  History,
  Plus,
  Package,
} from "lucide-react";
import Link from "next/link";

interface ProductImageItem {
  image_url: string;
  is_primary?: boolean;
}

export default async function AdminInventoryPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase() : "";
  const filter = typeof searchParams?.filter === "string" ? searchParams.filter : "all";

  const supabase = await createAdminClient();

  // Fetch all categories for filter dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  // Fetch all products
  const { data: allProducts, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      stock,
      is_active,
      brand,
      category_id,
      category:categories(name),
      images:product_images(image_url, is_primary)
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch inventory products:", error);
  }

  const products = allProducts || [];

  // ─── Inventory Health Calculations ──────────────────────────────────────────
  const LOW_STOCK_THRESHOLD = 10;
  const totalItems = products.length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
  const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValuation = products.reduce(
    (sum, p) => sum + (p.price || 0) * (p.stock || 0),
    0
  );

  // ─── Client Filter Application ──────────────────────────────────────────────
  let filteredProducts = products;

  if (search) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(search) ||
      (p.brand && p.brand.toLowerCase().includes(search)) ||
      (p.slug && p.slug.toLowerCase().includes(search))
    );
  }

  if (filter === "low_stock") {
    filteredProducts = filteredProducts.filter(
      (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
    );
  } else if (filter === "out_of_stock") {
    filteredProducts = filteredProducts.filter((p) => p.stock === 0);
  } else if (filter === "in_stock") {
    filteredProducts = filteredProducts.filter((p) => p.stock > LOW_STOCK_THRESHOLD);
  } else if (filter && filter !== "all") {
    // Check if matching category_id
    filteredProducts = filteredProducts.filter((p) => p.category_id === filter);
  }

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="Inventory Stock Management"
        description="Monitor catalog stock levels, identify replenishment shortages, and log inventory adjustments."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/inventory/stock-history">
              <Button variant="outline" size="sm" className="gap-2">
                <History className="h-4 w-4" />
                Stock History Log
              </Button>
            </Link>
            <Link href="/admin/products/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Product
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── Stock Health KPI Row ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Products"
          value={totalItems.toLocaleString()}
          icon={Warehouse}
          description="Catalog entries"
        />
        <StatCard
          title="Total Units On Hand"
          value={totalUnits.toLocaleString()}
          icon={Boxes}
          description="Warehouse physical count"
        />
        <StatCard
          title="Inventory Valuation"
          value={formatPrice(totalValuation)}
          icon={DollarSign}
          description="At current retail pricing"
        />
        <StatCard
          title="Low Stock Warning"
          value={lowStockCount.toLocaleString()}
          icon={AlertTriangle}
          description={`<= ${LOW_STOCK_THRESHOLD} units remaining`}
          iconClassName={lowStockCount > 0 ? "bg-amber-500/15 text-amber-500" : undefined}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockCount.toLocaleString()}
          icon={PackageX}
          description="Requires urgent restock"
          iconClassName={outOfStockCount > 0 ? "bg-red-500/15 text-red-500" : undefined}
        />
      </div>

      {/* ── Toolbar & Table ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <DataTableToolbar
            searchPlaceholder="Search product by name or brand..."
            filterOptions={[
              { label: "⚠️ Low Stock (<= 10)", value: "low_stock" },
              { label: "🚨 Out of Stock (0 units)", value: "out_of_stock" },
              { label: "✅ In Stock (> 10)", value: "in_stock" },
              ...(categories?.map((c) => ({
                label: `Category: ${c.name}`,
                value: c.id,
              })) || []),
            ]}
            filterPlaceholder="Filter by Stock / Category"
          />
        </div>

        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[70px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead className="text-right">Quick Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const images = product.images as ProductImageItem[] | null;
                const primaryImage =
                  images?.find((img) => img.is_primary)?.image_url ||
                  images?.[0]?.image_url ||
                  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&q=80";

                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

                const categoryName =
                  (Array.isArray(product.category)
                    ? product.category[0]?.name
                    : (product.category as { name?: string } | null)?.name) || "Uncategorized";

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
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="hover:underline hover:text-primary transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {product.slug}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {categoryName}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {product.brand || "—"}
                    </TableCell>

                    <TableCell className="font-semibold text-sm">
                      {formatPrice(product.price)}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-bold font-mono">
                        {product.stock}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">units</span>
                    </TableCell>

                    <TableCell>
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="text-[11px] font-semibold">
                          Out of Stock
                        </Badge>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Healthy
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground font-medium text-sm">
                      {formatPrice((product.price || 0) * (product.stock || 0))}
                    </TableCell>

                    <TableCell className="text-right">
                      <StockAdjustDialog
                        productId={product.id}
                        productName={product.name}
                        currentStock={product.stock}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Warehouse className="h-6 w-6 text-muted-foreground/60" />
                    <span>No inventory items match the current filter or search criteria.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
