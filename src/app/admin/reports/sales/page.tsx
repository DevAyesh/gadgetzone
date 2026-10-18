import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderStatusChart } from "@/components/admin/order-status-chart";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminSalesReportsPage() {
  const supabase = await createAdminClient();
  const now = new Date();

  const { data: allOrders } = await supabase
    .from("orders")
    .select("id, total_amount, status, payment_method, created_at, order_number")
    .order("created_at", { ascending: false });

  const orders = allOrders || [];

  const nonCancelled = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = nonCancelled.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrdersCount = orders.length;
  const aov = nonCancelled.length > 0 ? totalRevenue / nonCancelled.length : 0;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
  const cancellationRate =
    totalOrdersCount > 0 ? ((cancelledCount / totalOrdersCount) * 100).toFixed(1) : "0";

  // Payment Gateway breakdown
  const paymentGateways: Record<string, { count: number; total: number }> = {};
  for (const o of orders) {
    const gw = o.payment_method || "Other";
    if (!paymentGateways[gw]) {
      paymentGateways[gw] = { count: 0, total: 0 };
    }
    paymentGateways[gw].count += 1;
    if (o.status !== "cancelled") {
      paymentGateways[gw].total += o.total_amount || 0;
    }
  }

  // 12-month chart data
  const chartMonths = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      name: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    };
  });

  const chartData = chartMonths.map(({ key, name }) => ({
    name,
    revenue: nonCancelled
      .filter((o) => o.created_at.slice(0, 7) === key)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
    orders: orders.filter((o) => o.created_at.slice(0, 7) === key).length,
  }));

  // Status breakdown
  const statusCounts = {
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: cancelledCount,
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };

  const statusChartData = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || "#888" }));

  return (
    <div className="space-y-8 max-w-[1400px]">
      <PageHeader
        title="Sales & Revenue Analytics"
        description="Performance indicators, sales velocity, average order values, and payment processor volumes."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Reports", href: "/admin/reports/sales" },
          { label: "Sales" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/reports/inventory">
              <Button variant="outline" size="sm">
                Inventory Report
              </Button>
            </Link>
            <Link href="/admin/reports/customers">
              <Button variant="outline" size="sm">
                Customer Insights
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="All-Time Revenue"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
          description="Gross revenue from fulfilled orders"
        />
        <StatCard
          title="Average Order Value"
          value={formatPrice(aov)}
          icon={TrendingUp}
          description="Average spend per completed order"
        />
        <StatCard
          title="Total Orders"
          value={totalOrdersCount.toLocaleString()}
          icon={ShoppingCart}
          description="All recorded checkout intents"
        />
        <StatCard
          title="Cancellation Rate"
          value={`${cancellationRate}%`}
          icon={Percent}
          description={`${cancelledCount} cancelled orders`}
          iconClassName={cancelledCount > 0 ? "bg-red-500/10 text-red-500" : undefined}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 glass-card rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">12-Month Sales Trajectory</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monthly revenue volume paired with order placement frequency
              </p>
            </div>
          </div>
          <RevenueChart data={chartData} />
        </div>

        <div className="lg:col-span-3 glass-card rounded-xl border border-border/50 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Fulfillment Pipeline</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current order status distribution
            </p>
          </div>
          <OrderStatusChart data={statusChartData} total={totalOrdersCount} />
        </div>
      </div>

      {/* Payment Gateway Breakdown */}
      <div className="glass-card rounded-xl border border-border/50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Payment Methods & Gateways</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(paymentGateways).map(([gateway, info]) => (
            <div
              key={gateway}
              className="rounded-lg border border-border/40 bg-muted/20 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm capitalize">{gateway}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {info.count} orders
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {formatPrice(info.total)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
