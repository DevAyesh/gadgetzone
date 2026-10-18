import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, ArrowLeft, Package, Warehouse } from "lucide-react";
import Link from "next/link";

interface ProductImageItem {
  image_url: string;
  is_primary?: boolean;
}

interface StockHistoryProduct {
  id?: string;
  name?: string;
  slug?: string;
  images?: ProductImageItem[];
}

interface StockHistoryLog {
  id: string;
  quantity_change: number | null;
  reason: string | null;
  created_at: string;
  product_id?: string;
  product?: StockHistoryProduct | StockHistoryProduct[];
}

export default async function AdminStockHistoryPage() {
  const supabase = await createAdminClient();

  const { data: logs, error } = await supabase
    .from("inventory_log")
    .select(`
      id,
      quantity_change,
      reason,
      created_at,
      product_id,
      product:products(
        id,
        name,
        slug,
        images:product_images(image_url, is_primary)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to fetch inventory logs:", error);
  }

  const logList = (logs as unknown as StockHistoryLog[]) || [];

  return (
    <div className="space-y-8 max-w-[1200px]">
      <PageHeader
        title="Stock Adjustment History"
        description="Audit trail of all physical inventory changes, restocks, damage write-offs, and count reconciliations."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: "/admin/inventory" },
          { label: "History" },
        ]}
        actions={
          <Link href="/admin/inventory">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Button>
          </Link>
        }
      />

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        {logList.length === 0 ? (
          <EmptyState
            icon={History}
            title="No inventory adjustments logged yet"
            description="When you or your warehouse team adjust product stock levels, a detailed audit trail entry will be recorded here automatically."
            action={
              <Link href="/admin/inventory">
                <Button variant="default" size="sm" className="gap-2">
                  <Warehouse className="h-4 w-4" />
                  Manage Inventory Now
                </Button>
              </Link>
            }
          />
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity Change</TableHead>
                <TableHead>Adjustment Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logList.map((log) => {
                const product = Array.isArray(log.product) ? log.product[0] : log.product;
                const change = log.quantity_change ?? 0;
                const isPositive = change > 0;
                const isZero = change === 0;

                const primaryImage =
                  product?.images?.find((img) => img.is_primary)?.image_url ||
                  product?.images?.[0]?.image_url;

                const formattedDate = new Date(log.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formattedDate}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {primaryImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={primaryImage}
                              alt={product?.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {product?.name || "Unknown Product"}
                          </p>
                          {product?.slug && (
                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {product.slug}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-bold ${
                          isZero
                            ? "bg-muted text-muted-foreground"
                            : isPositive
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {isPositive ? `+${change}` : change} units
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-foreground">
                      {log.reason || "Manual adjustment"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
