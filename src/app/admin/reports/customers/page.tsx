import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice, formatDate } from "@/lib/utils";
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
import { Users, UserCheck, DollarSign, TrendingUp, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CustomerAggregate {
  id: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export default async function AdminCustomerReportsPage() {
  const supabase = await createAdminClient();

  const [{ data: profiles }, { data: orders }, authUsersRes] = await Promise.all([
    supabase.from("profiles").select("id, first_name, last_name"),
    supabase
      .from("orders")
      .select("id, user_id, total_amount, status, notes, created_at")
      .order("created_at", { ascending: false }),
    supabase.auth.admin.listUsers({ perPage: 1000 }).catch(() => ({ data: { users: [] } })),
  ]);

  const profileList = profiles || [];
  const orderList = orders || [];

  const authEmailMap = new Map<string, string>();
  for (const u of authUsersRes.data?.users || []) {
    if (u.id && u.email) {
      authEmailMap.set(u.id, u.email);
    }
  }

  const customerMap = new Map<string, CustomerAggregate>();

  for (const prof of profileList) {
    const fullName = `${prof.first_name || ""} ${prof.last_name || ""}`.trim() || "Customer";
    customerMap.set(prof.id, {
      id: prof.id,
      name: fullName,
      email: authEmailMap.get(prof.id) || "",
      orderCount: 0,
      totalSpent: 0,
      lastOrderDate: null,
    });
  }

  for (const o of orderList) {
    let email = "";
    if (o.notes) {
      const emailMatch = o.notes.match(/Email:\s*([^\s,;]+)/i);
      if (emailMatch) email = emailMatch[1].trim();
    }

    if (o.user_id && customerMap.has(o.user_id)) {
      const cust = customerMap.get(o.user_id)!;
      cust.orderCount += 1;
      if (o.status !== "cancelled") {
        cust.totalSpent += o.total_amount || 0;
      }
      if (!cust.email && email) cust.email = email;
      if (!cust.lastOrderDate) cust.lastOrderDate = o.created_at;
    } else if (o.user_id) {
      customerMap.set(o.user_id, {
        id: o.user_id,
        name: email ? email.split("@")[0] : "Customer",
        email: email,
        orderCount: 1,
        totalSpent: o.status !== "cancelled" ? o.total_amount || 0 : 0,
        lastOrderDate: o.created_at,
      });
    }
  }

  const allCustomers = Array.from(customerMap.values());
  const activeCustomers = allCustomers.filter((c) => c.orderCount > 0);
  const repeatCustomers = allCustomers.filter((c) => c.orderCount > 1);

  const totalRevenue = allCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLtv = activeCustomers.length > 0 ? totalRevenue / activeCustomers.length : 0;
  const repeatRate =
    activeCustomers.length > 0
      ? ((repeatCustomers.length / activeCustomers.length) * 100).toFixed(1)
      : "0";

  const topCustomers = [...allCustomers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 15);

  return (
    <div className="space-y-8 max-w-[1400px]">
      <PageHeader
        title="Customer Insights & Loyalty"
        description="Buyer retention, customer lifetime value (LTV), repeat purchase rates, and top buyers."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Reports", href: "/admin/reports/sales" },
          { label: "Customers" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/customers">
              <Button size="sm">View Customers List</Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Registered Buyers"
          value={allCustomers.length.toLocaleString()}
          icon={Users}
          description="Total tracked accounts"
        />
        <StatCard
          title="Active Purchasing Customers"
          value={activeCustomers.length.toLocaleString()}
          icon={UserCheck}
          description="Placed 1+ verified orders"
        />
        <StatCard
          title="Repeat Buyer Rate"
          value={`${repeatRate}%`}
          icon={TrendingUp}
          description={`${repeatCustomers.length} repeat purchasers`}
          iconClassName={parseFloat(repeatRate) > 0 ? "bg-emerald-500/15 text-emerald-500" : undefined}
        />
        <StatCard
          title="Avg Lifetime Value (LTV)"
          value={formatPrice(avgLtv)}
          icon={DollarSign}
          description="Per active purchasing account"
        />
      </div>

      {/* Top Buyers Leaderboard */}
      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Top Customers by Lifetime Spend</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Highest-value buyers ranked by cumulative non-cancelled order volume
            </p>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Orders Placed</TableHead>
              <TableHead>Avg Order Spend</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead className="text-right">Total Lifetime Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCustomers.map((c, index) => {
              const aovForCustomer = c.orderCount > 0 ? c.totalSpent / c.orderCount : 0;
              const initial = c.name.charAt(0).toUpperCase() || "C";

              return (
                <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-muted-foreground">
                    #{index + 1}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {initial}
                      </div>
                      <span className="font-semibold text-sm">{c.name}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {c.email || "—"}
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-mono text-sm font-semibold">
                      <ShoppingBag className="h-3 w-3 text-primary" />
                      {c.orderCount}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {formatPrice(aovForCustomer)}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {c.lastOrderDate ? formatDate(c.lastOrderDate) : "—"}
                  </TableCell>

                  <TableCell className="text-right font-bold text-sm text-foreground">
                    {formatPrice(c.totalSpent)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
