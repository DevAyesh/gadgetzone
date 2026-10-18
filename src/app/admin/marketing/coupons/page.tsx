import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { AddCouponDialog } from "@/components/admin/add-coupon-dialog";
import { CouponRowActions } from "@/components/admin/coupon-row-actions";
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
import { Badge } from "@/components/ui/badge";
import { Ticket, CheckCircle2, Clock, Calendar } from "lucide-react";

export default async function AdminCouponsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase() : "";
  const filter = typeof searchParams?.filter === "string" ? searchParams.filter : "all";

  const supabase = await createAdminClient();

  const { data: coupons, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch coupons:", error);
  }

  const list = coupons || [];
  const now = new Date();

  // Metrics
  const totalCoupons = list.length;
  const activeCoupons = list.filter(
    (c) => c.is_active && (!c.valid_until || new Date(c.valid_until) > now)
  ).length;
  const expiredCoupons = list.filter(
    (c) => c.valid_until && new Date(c.valid_until) <= now
  ).length;

  // Filtering
  let filtered = list;
  if (search) {
    filtered = filtered.filter((c) => c.code.toLowerCase().includes(search));
  }

  if (filter === "active") {
    filtered = filtered.filter(
      (c) => c.is_active && (!c.valid_until || new Date(c.valid_until) > now)
    );
  } else if (filter === "inactive") {
    filtered = filtered.filter((c) => !c.is_active);
  } else if (filter === "expired") {
    filtered = filtered.filter(
      (c) => c.valid_until && new Date(c.valid_until) <= now
    );
  }

  return (
    <div className="space-y-8 max-w-[1200px]">
      <PageHeader
        title="Promotions & Discount Coupons"
        description="Configure promotional voucher codes, percentage discounts, and fixed checkout markdowns."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Marketing", href: "/admin/marketing/coupons" },
          { label: "Coupons" },
        ]}
        actions={<AddCouponDialog />}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Coupons"
          value={totalCoupons.toLocaleString()}
          icon={Ticket}
          description="Catalog promotions"
        />
        <StatCard
          title="Active Promotions"
          value={activeCoupons.toLocaleString()}
          icon={CheckCircle2}
          description="Currently redeemable at checkout"
          iconClassName="bg-emerald-500/15 text-emerald-500"
        />
        <StatCard
          title="Expired / Inactive"
          value={expiredCoupons.toLocaleString()}
          icon={Clock}
          description="Past validity or disabled"
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <DataTableToolbar
            searchPlaceholder="Search coupons by code..."
            filterOptions={[
              { label: "Active Only", value: "active" },
              { label: "Inactive Only", value: "inactive" },
              { label: "Expired", value: "expired" },
            ]}
            filterPlaceholder="Filter by Validity"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No coupons found"
            description="Create promotional codes to offer percent or dollar discounts to your shoppers."
            action={<AddCouponDialog />}
          />
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Coupon Code</TableHead>
                <TableHead>Discount Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((coupon) => {
                const isExpired =
                  coupon.valid_until && new Date(coupon.valid_until) <= now;

                const discountText =
                  coupon.discount_percentage !== null
                    ? `${coupon.discount_percentage}% OFF`
                    : coupon.discount_amount !== null
                    ? `${formatPrice(coupon.discount_amount)} OFF`
                    : "Discount";

                return (
                  <TableRow key={coupon.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm tracking-wide px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                          {coupon.code}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-sm text-foreground">
                        {discountText}
                      </span>
                    </TableCell>

                    <TableCell>
                      {isExpired ? (
                        <Badge variant="destructive" className="text-[11px]">
                          Expired
                        </Badge>
                      ) : coupon.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-[11px] text-muted-foreground">
                          Disabled
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {coupon.valid_until ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(coupon.valid_until)}</span>
                        </div>
                      ) : (
                        <span className="italic">Never expires</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(coupon.created_at)}
                    </TableCell>

                    <TableCell className="text-right">
                      <CouponRowActions
                        couponId={coupon.id}
                        code={coupon.code}
                        isActive={coupon.is_active}
                      />
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
