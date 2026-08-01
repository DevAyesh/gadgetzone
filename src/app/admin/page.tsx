import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import type { RevenueChartDataPoint } from "@/components/admin/revenue-chart";
import { OrderStatusChart } from "@/components/admin/order-status-chart";
import type { OrderStatusDataPoint } from "@/components/admin/order-status-chart";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PackageX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

// ─── Data fetching ─────────────────────────────────────────────────────────────
//
// Why createAdminClient?
//   The dashboard reads orders from ALL users, which normal RLS would block.
//   The admin client uses the service role key and bypasses RLS safely
//   (server-only, never exposed to the browser).
//
// Why Promise.all?
//   All 6 queries run in parallel so the dashboard renders in a single round-trip.

async function getDashboardData() {
  const supabase = await createAdminClient();
  const now = new Date();

  // Date boundaries
  const todayStart    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart     = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    { data: allOrders },
    { data: orderItems },
    { data: allProducts },
    { data: recentCustomers },
    { count: totalUsers },
    { count: totalProducts },
  ] = await Promise.all([
    // All orders — used for revenue calculations, chart data, status counts, recent list
    supabase
      .from("orders")
      .select("id, total_amount, status, created_at, order_number, profiles(first_name, last_name)")
      .order("created_at", { ascending: false }),

    // Order items — used to compute top-selling products
    supabase
      .from("order_items")
      .select("product_id, quantity, products(id, name, product_images(image_url, is_primary))"),

    // Products — used for stock alerts
    supabase
      .from("products")
      .select("id, name, stock, price, is_active, product_images(image_url, is_primary)"),

    // Most recently registered users
    supabase
      .from("profiles")
      .select("id, first_name, last_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
  ]);

  const orders   = allOrders   || [];
  const products = allProducts || [];

  // ── Revenue calculations ────────────────────────────────────────────────────
  const revenueOrders = orders.filter((o) => o.status !== "cancelled");

  const sum = (arr: typeof revenueOrders) =>
    arr.reduce((s, o) => s + (o.total_amount || 0), 0);

  const allTimeRevenue  = sum(revenueOrders);
  const todayRevenue    = sum(revenueOrders.filter((o) => new Date(o.created_at) >= todayStart));
  const weekRevenue     = sum(revenueOrders.filter((o) => new Date(o.created_at) >= weekStart));
  const monthRevenue    = sum(revenueOrders.filter((o) => new Date(o.created_at) >= monthStart));
  const prevMonthRevenue = sum(
    revenueOrders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= prevMonthStart && d < monthStart;
    })
  );

  const revenueGrowth =
    prevMonthRevenue > 0
      ? Number(((monthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1))
      : monthRevenue > 0 ? 100 : 0;

  // ── Order status counts (all-time) ──────────────────────────────────────────
  const statusCounts = {
    pending:    orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped:    orders.filter((o) => o.status === "shipped").length,
    delivered:  orders.filter((o) => o.status === "delivered").length,
    cancelled:  orders.filter((o) => o.status === "cancelled").length,
  };

  // ── Stock alerts ────────────────────────────────────────────────────────────
  const LOW_STOCK_THRESHOLD = 10;
  const lowStockCount   = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // ── Top 5 selling products ──────────────────────────────────────────────────
  const productSalesMap = new Map<string, { name: string; quantity: number; imageUrl: string }>();
  for (const item of (orderItems || [])) {
    const pid  = item.product_id;
    const prod = item.products as any;
    const existing = productSalesMap.get(pid);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      const imageUrl =
        prod?.product_images?.find((img: any) => img.is_primary)?.image_url ||
        prod?.product_images?.[0]?.image_url || "";
      productSalesMap.set(pid, { name: prod?.name || "Unknown", quantity: item.quantity, imageUrl });
    }
  }
  const topProducts = Array.from(productSalesMap.entries())
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5)
    .map(([id, data]) => ({ id, ...data }));

  // ── 12-month chart data ─────────────────────────────────────────────────────
  const chartMonths = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      name: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    };
  });

  const chartData: RevenueChartDataPoint[] = chartMonths.map(({ key, name }) => ({
    name,
    revenue: sum(revenueOrders.filter((o) => o.created_at.slice(0, 7) === key)),
    orders:  orders.filter((o) => o.created_at.slice(0, 7) === key).length,
  }));

  // ── Order status chart data ─────────────────────────────────────────────────
  const STATUS_COLORS: Record<string, string> = {
    pending:    "#f59e0b",
    processing: "#3b82f6",
    shipped:    "#8b5cf6",
    delivered:  "#10b981",
    cancelled:  "#ef4444",
  };
  const statusChartData: OrderStatusDataPoint[] = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || "#888" }));

  return {
    allTimeRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    revenueGrowth,
    statusCounts,
    totalOrders:    orders.length,
    totalUsers:     totalUsers ?? 0,
    totalProducts:  totalProducts ?? 0,
    lowStockCount,
    outOfStockCount,
    topProducts,
    recentCustomers: recentCustomers || [],
    recentOrders:    orders.slice(0, 8),
    chartData,
    statusChartData,
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const {
    allTimeRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    revenueGrowth,
    statusCounts,
    totalOrders,
    totalUsers,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    topProducts,
    recentCustomers,
    recentOrders,
    chartData,
    statusChartData,
  } = data;

  return (
    <div className="space-y-8 max-w-[1400px]">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back — here's what's happening with your store.
        </p>
      </div>

      {/* ── Primary KPI Row ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="All-Time Revenue"
          value={formatPrice(allTimeRevenue)}
          icon={DollarSign}
          description="Non-cancelled orders"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          description="All time"
        />
        <StatCard
          title="Total Customers"
          value={totalUsers.toLocaleString()}
          icon={Users}
          description="Registered accounts"
        />
        <StatCard
          title="Active Products"
          value={totalProducts.toLocaleString()}
          icon={Package}
          description="In catalog"
        />
      </div>

      {/* ── Secondary KPI Row ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Today's Revenue"
          value={formatPrice(todayRevenue)}
          icon={TrendingUp}
          description="Since midnight"
        />
        <StatCard
          title="Weekly Revenue"
          value={formatPrice(weekRevenue)}
          icon={TrendingUp}
          description="Last 7 days"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatPrice(monthRevenue)}
          icon={DollarSign}
          trend={revenueGrowth}
          trendLabel="vs last month"
        />
        <StatCard
          title="Pending Orders"
          value={statusCounts.pending.toLocaleString()}
          icon={Clock}
          description="Awaiting action"
          iconClassName={statusCounts.pending > 0 ? "bg-yellow-500/10" : undefined}
        />
        <div className="glass-card rounded-xl border border-border/50 p-5 flex flex-col gap-4">
          <span className="text-sm font-medium text-muted-foreground">Stock Alerts</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">Low Stock</span>
              </div>
              <Link href="/admin/inventory" className="text-sm font-bold text-yellow-500 hover:underline">
                {lowStockCount}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <PackageX className="h-4 w-4 text-red-500" />
                <span className="text-muted-foreground">Out of Stock</span>
              </div>
              <Link href="/admin/inventory" className="text-sm font-bold text-red-500 hover:underline">
                {outOfStockCount}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Delivered</span>
              </div>
              <span className="text-sm font-bold text-green-500">
                {statusCounts.delivered}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-muted-foreground">Cancelled</span>
              </div>
              <span className="text-sm font-bold text-red-400">
                {statusCounts.cancelled}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Trend */}
        <div className="lg:col-span-4 glass-card rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Revenue Trend</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 12 months — revenue (solid) & orders (dashed)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-primary inline-block rounded" />
                Revenue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-blue-500 inline-block rounded border-dashed border-t-2 border-blue-500" />
                Orders
              </span>
            </div>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Order Status Distribution */}
        <div className="lg:col-span-3 glass-card rounded-xl border border-border/50 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Order Status</h2>
            <p className="text-xs text-muted-foreground mt-0.5">All-time distribution</p>
          </div>
          <OrderStatusChart data={statusChartData} total={totalOrders} />
        </div>
      </div>

      {/* ── Bottom Row ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-7">

        {/* Top Selling Products */}
        <div className="lg:col-span-4 glass-card rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Top Selling Products</h2>
            <Link
              href="/admin/products"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all →
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4 text-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="h-8 w-8 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{product.quantity}</p>
                    <p className="text-[11px] text-muted-foreground">sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Panel */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Recent Customers */}
          <div className="glass-card rounded-xl border border-border/50 p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">New Customers</h2>
              <Link
                href="/admin/customers"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all →
              </Link>
            </div>
            {recentCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No customers yet</p>
            ) : (
              <div className="space-y-3">
                {recentCustomers.map((customer: any) => {
                  const name =
                    `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
                    "Anonymous";
                  const initial = name.charAt(0).toUpperCase();
                  return (
                    <div key={customer.id} className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">
                        {formatDate(customer.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders Table ──────────────────────────────────────────────── */}
      <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentOrders.map((order: any) => {
                  const customer = order.profiles;
                  const customerName =
                    customer
                      ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Guest"
                      : "Guest";
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-primary hover:underline text-xs"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{customerName}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-5 py-3 font-semibold">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getOrderStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
