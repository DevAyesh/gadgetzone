"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createCoupon } from "@/app/admin/marketing/coupons/actions";

export function AddCouponDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) {
      toast.error("Please enter a valid discount value");
      return;
    }

    if (discountType === "percentage" && numVal > 100) {
      toast.error("Percentage cannot exceed 100%");
      return;
    }

    const formData = new FormData();
    formData.append("code", code.trim().toUpperCase());
    formData.append("discount_type", discountType);
    formData.append("value", numVal.toString());
    formData.append("valid_until", validUntil);
    formData.append("is_active", isActive ? "true" : "false");

    startTransition(async () => {
      const res = await createCoupon(formData);
      if (res.success) {
        toast.success(`Coupon ${code.toUpperCase()} created successfully!`);
        setCode("");
        setValue("");
        setValidUntil("");
        setIsActive(true);
        setOpen(false);
      } else {
        toast.error(res.error || "Failed to create coupon");
      }
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Create Coupon
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">New Discount Coupon</DialogTitle>
                <DialogDescription className="text-xs">
                  Create a promotional code for customer checkout discounts.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Coupon Code */}
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-semibold">
                Coupon Code *
              </Label>
              <Input
                id="code"
                placeholder="e.g. FLASH20, SUMMER50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono uppercase font-bold"
                required
                disabled={isPending}
              />
            </div>

            {/* Discount Type and Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-semibold">
                  Discount Type
                </Label>
                <select
                  id="type"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={isPending}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (Rs.)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="value" className="text-xs font-semibold">
                  Value ({discountType === "percentage" ? "%" : "Rs."}) *
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="any"
                  min="0.01"
                  max={discountType === "percentage" ? "100" : undefined}
                  placeholder={discountType === "percentage" ? "20" : "500"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <Label htmlFor="validUntil" className="text-xs font-semibold">
                Expiration Date (Optional)
              </Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                disabled={isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank if this coupon should never expire automatically.
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                disabled={isPending}
              />
              <Label htmlFor="isActive" className="text-xs font-medium cursor-pointer">
                Activate coupon immediately upon creation
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <DialogClose
                render={<Button type="button" variant="outline" />}
                disabled={isPending}
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Coupon"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
