import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Warehouse, Boxes, DollarSign, AlertTriangle, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminInventoryReportsPage() {
  const supabase = await createAdminClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, price, stock, is_active, category_id, category:categories(name)")
      .order("stock", { ascending: true }),
    supabase.from("categories").select("id, name"),
  ]);

  const productList = products || [];
  const categoryList = categories || [];

  const totalProducts = productList.length;
  const totalUnits = productList.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValuation = productList.reduce(
    (sum, p) => sum + (p.price || 0) * (p.stock || 0),
    0
  );
  const lowStockCount = productList.filter((p) => p.stock > 0 && p.stock <= 10).length;

  // Category breakdown
  const categoryStats = categoryList.map((cat) => {
    const catProducts = productList.filter((p) => p.category_id === cat.id);
    const catUnits = catProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const catValuation = catProducts.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0
    );
    const valuationPercent =
      totalValuation > 0 ? ((catValuation / totalValuation) * 100).toFixed(1) : "0";

    return {
      id: cat.id,
      name: cat.name,
      productCount: catProducts.length,
      units: catUnits,
      valuation: catValuation,
      percent: valuationPercent,
    };
  }).sort((a, b) => b.valuation - a.valuation);

  // Top 10 Capital-intensive products
  const topCapitalProducts = [...productList]
    .map((p) => ({
      ...p,
      valuation: (p.price || 0) * (p.stock || 0),
    }))
    .sort((a, b) => b.valuation - a.valuation)
    .slice(0, 10);

  return (
    <div className="space-y-8 max-w-[1400px]">
      <PageHeader
        title="Inventory Valuation & Stock Capital"
        description="Warehouse capital distribution, category stock density, and highest inventory investments."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Reports", href: "/admin/reports/sales" },
          { label: "Inventory" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/inventory">
              <Button size="sm">Manage Stock</Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory Capital"
          value={formatPrice(totalValuation)}
          icon={DollarSign}
          description="Total retail asset value"
        />
        <StatCard
          title="Warehouse Units on Hand"
          value={totalUnits.toLocaleString()}
          icon={Boxes}
          description="Physical count across catalog"
        />
        <StatCard
          title="Low Stock Risk Items"
          value={lowStockCount.toLocaleString()}
          icon={AlertTriangle}
          description="<= 10 units remaining"
          iconClassName={lowStockCount > 0 ? "bg-amber-500/15 text-amber-500" : undefined}
        />
        <StatCard
          title="Stocked Catalog Size"
          value={totalProducts.toLocaleString()}
          icon={Warehouse}
          description="Active SKUs in inventory"
        />
      </div>

      {/* Category Breakdown Table */}
      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Valuation by Category</h2>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>SKU Count</TableHead>
              <TableHead>Units in Stock</TableHead>
              <TableHead>Total Inventory Valuation</TableHead>
              <TableHead className="text-right">Share of Capital</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryStats.map((cat) => (
              <TableRow key={cat.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-semibold text-sm">{cat.name}</TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {cat.productCount} SKUs
                </TableCell>
                <TableCell className="text-sm font-mono font-medium">
                  {cat.units.toLocaleString()} units
                </TableCell>
                <TableCell className="text-sm font-semibold">
                  {formatPrice(cat.valuation)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, parseFloat(cat.percent))}%` }}
                      />
                    </div>
                    <span>{cat.percent}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Top Capital Products */}
      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h2 className="text-sm font-semibold">Top 10 Capital-Tied Products</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Products holding the largest physical stock dollar value
          </p>
        </div>

        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Retail Price</TableHead>
              <TableHead>On-Hand Units</TableHead>
              <TableHead className="text-right">Total Stock Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCapitalProducts.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="hover:underline hover:text-primary transition-colors"
                  >
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {(Array.isArray(p.category) ? p.category[0]?.name : (p.category as { name?: string } | null)?.name) || "Uncategorized"}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {formatPrice(p.price)}
                </TableCell>
                <TableCell className="text-sm font-mono font-bold">
                  {p.stock} units
                </TableCell>
                <TableCell className="text-right font-bold text-sm text-primary">
                  {formatPrice(p.valuation)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
