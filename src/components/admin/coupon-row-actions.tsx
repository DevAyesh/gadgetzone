"use client";

import { useTransition } from "react";
import { Loader2, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleCouponStatus, deleteCoupon } from "@/app/admin/marketing/coupons/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface CouponRowActionsProps {
  couponId: string;
  code: string;
  isActive: boolean;
}

export function CouponRowActions({
  couponId,
  code,
  isActive,
}: CouponRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleCouponStatus(couponId, !isActive);
      if (res.success) {
        toast.success(`Coupon ${code} ${!isActive ? "activated" : "deactivated"}`);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        className={`h-8 px-2 text-xs gap-1.5 ${
          isActive
            ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title={isActive ? "Deactivate coupon" : "Activate coupon"}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Power className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">{isActive ? "Active" : "Inactive"}</span>
      </Button>

      <ConfirmDialog
        title="Delete Coupon"
        description={`Are you sure you want to permanently delete coupon "${code}"? This promo code will no longer be valid at checkout.`}
        confirmLabel="Delete Coupon"
        variant="destructive"
        successMessage={`Coupon ${code} deleted`}
        onConfirm={async () => {
          return await deleteCoupon(couponId);
        }}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Delete coupon"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
      />
    </div>
  );
}
