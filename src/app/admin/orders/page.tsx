import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart, Clock, CheckCircle2, Truck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatPrice, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import Link from "next/link";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";

export default async function AdminOrdersPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === "string" ? searchParams.q : "";
  const filter = typeof searchParams?.filter === "string" ? searchParams.filter : "";
  const customerId = typeof searchParams?.customer === "string" ? searchParams.customer : "";
  const supabase = await createAdminClient();

  // Fetch orders with user profiles to get customer names
  let query = supabase
    .from("orders")
    .select(`
      *,
      profiles(first_name, last_name, id)
    `)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("order_number", `%${search}%`);
  }

  if (filter && filter !== "all") {
    query = query.eq("status", filter);
  }

  if (customerId) {
    query = query.eq("user_id", customerId);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
  }

  const orderList = orders || [];

  // Metrics across all fetched or total orders
  const pendingCount = orderList.filter((o) => o.status === "pending").length;
  const processingCount = orderList.filter((o) => o.status === "processing").length;
  const totalVolume = orderList
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="space-y-8 max-w-[1400px]">
      <PageHeader
        title="Orders & Fulfillment"
        description="Track customer purchases, update processing/shipping status, and review payment confirmations."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Orders" },
        ]}
      />

      {customerId && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-primary/10 border border-primary/20 text-xs">
          <span className="font-medium text-foreground">
            Filtering orders by Customer ID: <span className="font-mono font-bold text-primary">{customerId}</span>
          </span>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear Filter
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={orderList.length.toLocaleString()}
          icon={ShoppingCart}
          description="In this view"
        />
        <StatCard
          title="Pending Action"
          value={pendingCount.toLocaleString()}
          icon={Clock}
          description="Awaiting processing"
          iconClassName={pendingCount > 0 ? "bg-amber-500/15 text-amber-500" : undefined}
        />
        <StatCard
          title="In Processing / Transit"
          value={processingCount.toLocaleString()}
          icon={Truck}
          description="Fulfillment in progress"
        />
        <StatCard
          title="Orders Value"
          value={formatPrice(totalVolume)}
          icon={CheckCircle2}
          description="Non-cancelled total"
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <DataTableToolbar
            searchPlaceholder="Search by order number (e.g. ORD-257)..."
            filterOptions={[
              { label: "Pending", value: "pending" },
              { label: "Processing", value: "processing" },
              { label: "Shipped", value: "shipped" },
              { label: "Delivered", value: "delivered" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            filterPlaceholder="All Statuses"
          />
        </div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList.length > 0 ? (
              orderList.map((order) => {
                let customerEmail = "";
                let customerPhone = "";
                if (order.notes) {
                  const emailMatch = order.notes.match(/Email:\s*([^\s,;]+)/i);
                  if (emailMatch) customerEmail = emailMatch[1].trim();
                  const phoneMatch = order.notes.match(/Phone:\s*([^\s,;]+)/i);
                  if (phoneMatch) customerPhone = phoneMatch[1].trim();
                }

                const profileName = order.profiles
                  ? `${order.profiles.first_name || ""} ${order.profiles.last_name || ""}`.trim()
                  : "";

                const customerName = profileName || (customerEmail ? customerEmail.split("@")[0] : "Customer");
                const subtitle = customerEmail || customerPhone || "Online Checkout";

                return (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-primary">
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-bold hover:underline">
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{customerName}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {subtitle}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="capitalize text-xs font-medium">
                      {order.payment_method || "Online"}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {formatPrice(order.total_amount)}
                    </TableCell>
                    <TableCell>
                      <div className="w-[140px]">
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-medium">
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
