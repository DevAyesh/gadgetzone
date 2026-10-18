import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Award, ShoppingBag, ExternalLink, DollarSign, Plus } from "lucide-react";
import Link from "next/link";

interface BrandMetric {
  name: string;
  productCount: number;
  inStockCount: number;
  totalUnits: number;
  totalValuation: number;
  minPrice: number;
  maxPrice: number;
}

export default async function AdminBrandsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase() : "";

  const supabase = await createAdminClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, brand, price, stock, is_active");

  if (error) {
    console.error("Failed to fetch brand products:", error);
  }

  const productList = products || [];

  // Group by brand
  const brandMap = new Map<string, BrandMetric>();

  for (const p of productList) {
    const brandName = (p.brand || "Unbranded / Generic").trim();
    const existing = brandMap.get(brandName);

    if (existing) {
      existing.productCount += 1;
      if (p.stock > 0) existing.inStockCount += 1;
      existing.totalUnits += p.stock || 0;
      existing.totalValuation += (p.price || 0) * (p.stock || 0);
      existing.minPrice = Math.min(existing.minPrice, p.price || 0);
      existing.maxPrice = Math.max(existing.maxPrice, p.price || 0);
    } else {
      brandMap.set(brandName, {
        name: brandName,
        productCount: 1,
        inStockCount: p.stock > 0 ? 1 : 0,
        totalUnits: p.stock || 0,
        totalValuation: (p.price || 0) * (p.stock || 0),
        minPrice: p.price || 0,
        maxPrice: p.price || 0,
      });
    }
  }

  const allBrands = Array.from(brandMap.values()).sort(
    (a, b) => b.productCount - a.productCount
  );

  // Metrics
  const totalBrands = allBrands.length;
  const topBrand = allBrands[0]?.name || "N/A";
  const totalBrandValuation = allBrands.reduce((acc, b) => acc + b.totalValuation, 0);

  // Filtering
  let filtered = allBrands;
  if (search) {
    filtered = filtered.filter((b) => b.name.toLowerCase().includes(search));
  }

  return (
    <div className="space-y-8 max-w-[1400px]">
      <PageHeader
        title="Brands Portfolio"
        description="Catalog breakdown by manufacturers, device brands, and supplier product lines."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Catalog", href: "/admin/products" },
          { label: "Brands" },
        ]}
        actions={
          <Link href="/admin/products/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product with Brand
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Active Brands"
          value={totalBrands.toLocaleString()}
          icon={Award}
          description="Distinct brand lines in store"
        />
        <StatCard
          title="Top Brand Line"
          value={topBrand}
          icon={ShoppingBag}
          description="Largest product catalog share"
        />
        <StatCard
          title="Brand Catalog Valuation"
          value={formatPrice(totalBrandValuation)}
          icon={DollarSign}
          description="Total retail inventory value"
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <DataTableToolbar
            searchPlaceholder="Search brand name..."
            filterOptions={[]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No brands found"
            description="Assign brands to your products during creation or editing to organize products by brand line."
          />
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Brand Name</TableHead>
                <TableHead>Catalog Products</TableHead>
                <TableHead>In-Stock Availability</TableHead>
                <TableHead>Total Warehouse Units</TableHead>
                <TableHead>Price Spectrum</TableHead>
                <TableHead>Inventory Valuation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((brand) => (
                <TableRow key={brand.name} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-sm">{brand.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono font-medium text-sm">
                      {brand.productCount}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">products</span>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {brand.inStockCount} / {brand.productCount} in stock
                    </span>
                  </TableCell>

                  <TableCell className="font-mono text-sm font-semibold">
                    {brand.totalUnits.toLocaleString()} units
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {formatPrice(brand.minPrice)} — {formatPrice(brand.maxPrice)}
                  </TableCell>

                  <TableCell className="font-semibold text-sm">
                    {formatPrice(brand.totalValuation)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Link
                      href={`/admin/products?q=${encodeURIComponent(brand.name === "Unbranded / Generic" ? "" : brand.name)}`}
                    >
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                        <span>View Catalog</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
