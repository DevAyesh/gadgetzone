import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { CustomerRowActions } from "@/components/admin/customer-row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
}

export default async function AdminCustomersPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase() : "";
  const filter = typeof searchParams?.filter === "string" ? searchParams.filter : "all";

  const supabase = await createAdminClient();

  const [{ data: profiles }, { data: orders }, authUsersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, phone, role, created_at, avatar_url")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, user_id, total_amount, status, notes, created_at, order_number")
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

  // ─── Build Customer Records with Aggregates ──────────────────────────────────
  const customerMap = new Map<string, CustomerRecord>();

  for (const prof of profileList) {
    const fullName = `${prof.first_name || ""} ${prof.last_name || ""}`.trim() || "Registered User";
    const normalizedRole = prof.role === "member" ? "customer" : (prof.role || "customer");

    customerMap.set(prof.id, {
      id: prof.id,
      name: fullName,
      email: authEmailMap.get(prof.id) || "",
      phone: prof.phone || "",
      role: normalizedRole,
      ordersCount: 0,
      totalSpent: 0,
      lastOrderDate: null,
      createdAt: prof.created_at,
    });
  }

  // Aggregate orders for each customer
  for (const order of orderList) {
    let email = "";
    let phone = "";

    // Parse email and phone from notes if formatted like: Shipping Info: ... Phone: 07... Email: abc@...
    if (order.notes) {
      const emailMatch = order.notes.match(/Email:\s*([^\s,;]+)/i);
      if (emailMatch) email = emailMatch[1].trim();

      const phoneMatch = order.notes.match(/Phone:\s*([^\s,;]+)/i);
      if (phoneMatch) phone = phoneMatch[1].trim();
    }

    if (order.user_id && customerMap.has(order.user_id)) {
      const cust = customerMap.get(order.user_id)!;
      cust.ordersCount += 1;
      if (order.status !== "cancelled") {
        cust.totalSpent += order.total_amount || 0;
      }
      if (!cust.email && email) cust.email = email;
      if (!cust.phone && phone) cust.phone = phone;
      if (!cust.lastOrderDate) cust.lastOrderDate = order.created_at;
    } else if (order.user_id) {
      // User has an order but profile missing
      customerMap.set(order.user_id, {
        id: order.user_id,
        name: email ? email.split("@")[0] : "Customer",
        email: email,
        phone: phone,
        role: "customer",
        ordersCount: 1,
        totalSpent: order.status !== "cancelled" ? order.total_amount || 0 : 0,
        lastOrderDate: order.created_at,
        createdAt: order.created_at,
      });
    }
  }

  const allCustomers = Array.from(customerMap.values());

  // ─── Metrics ────────────────────────────────────────────────────────────────
  const totalCustomers = allCustomers.length;
  const activeBuyers = allCustomers.filter((c) => c.ordersCount > 0).length;
  const totalLtv = allCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgLtv = activeBuyers > 0 ? totalLtv / activeBuyers : 0;

  // ─── Filtering ──────────────────────────────────────────────────────────────
  let filtered = allCustomers;

  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search) ||
        c.id.toLowerCase().includes(search)
    );
  }

  if (filter && filter !== "all") {
    filtered = filtered.filter((c) => c.role === filter);
  }

  return (
    <div className="space-y-8 max-w-[1400px]">
      <PageHeader
        title="Customer Relationship Management"
        description="Inspect customer profiles, order frequency, total lifetime value, and support contacts."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Customers" },
        ]}
      />

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          icon={Users}
          description="Registered profiles"
        />
        <StatCard
          title="Active Buyers"
          value={activeBuyers.toLocaleString()}
          icon={UserCheck}
          description="Placed at least 1 order"
        />
        <StatCard
          title="Customer Lifetime Value"
          value={formatPrice(totalLtv)}
          icon={DollarSign}
          description="Total revenue from customers"
        />
        <StatCard
          title="Avg Spend per Buyer"
          value={formatPrice(avgLtv)}
          icon={TrendingUp}
          description="Average LTV per active account"
        />
      </div>

      {/* ── Toolbar & Customer List ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <DataTableToolbar
            searchPlaceholder="Search customer by name, email, phone..."
            filterOptions={[
              { label: "Regular Customers", value: "customer" },
              { label: "Admins", value: "admin" },
              { label: "Super Admins", value: "super_admin" },
            ]}
            filterPlaceholder="All Account Roles"
          />
        </div>

        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Total Spend (LTV)</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((customer) => {
                const initial = customer.name.charAt(0).toUpperCase() || "C";
                const isStaff = customer.role === "admin" || customer.role === "super_admin";

                return (
                  <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isStaff
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                              : "bg-primary/15 text-primary border border-primary/25"
                          }`}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate leading-none">
                            {customer.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono mt-1 truncate max-w-[180px]">
                            ID: {customer.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        {customer.email ? (
                          <div className="flex items-center gap-1.5 text-foreground truncate max-w-[200px]">
                            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        ) : null}
                        {customer.phone ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{customer.phone}</span>
                          </div>
                        ) : null}
                        {!customer.email && !customer.phone ? (
                          <span className="text-muted-foreground italic">No contact details</span>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>
                      {customer.role === "super_admin" ? (
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] gap-1 font-semibold">
                          <ShieldCheck className="h-3 w-3" />
                          Super Admin
                        </Badge>
                      ) : customer.role === "admin" ? (
                        <Badge variant="secondary" className="text-[10px] gap-1 font-semibold">
                          <ShieldCheck className="h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Customer</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {customer.ordersCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          {customer.ordersCount}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">0 orders</span>
                      )}
                    </TableCell>

                    <TableCell className="font-semibold text-sm">
                      {formatPrice(customer.totalSpent)}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : "—"}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(customer.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <CustomerRowActions
                        customerId={customer.id}
                        customerName={customer.name}
                        role={customer.role}
                        ordersCount={customer.ordersCount}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-6 w-6 text-muted-foreground/60" />
                    <span>No customer profiles found matching criteria.</span>
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
