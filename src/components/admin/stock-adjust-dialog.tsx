"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Minus, Warehouse, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { adjustProductStock } from "@/app/admin/inventory/actions";

interface StockAdjustDialogProps {
  productId: string;
  productName: string;
  currentStock: number;
}

const COMMON_REASONS = [
  "Restock / Supplier Delivery",
  "Physical Audit Count Correction",
  "Damaged / Defective Unit",
  "Customer Return to Inventory",
  "Internal Testing / Display Unit",
  "Manual Correction",
];

export function StockAdjustDialog({
  productId,
  productName,
  currentStock,
}: StockAdjustDialogProps) {
  const [open, setOpen] = useState(false);
  const [stock, setStock] = useState<number>(currentStock);
  const [reason, setReason] = useState<string>("Restock / Supplier Delivery");
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setStock(currentStock);
    setReason("Restock / Supplier Delivery");
    setOpen(true);
  };

  const handleAdjust = (delta: number) => {
    setStock((prev) => Math.max(0, prev + delta));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    startTransition(async () => {
      const result = await adjustProductStock(productId, stock, reason);
      if (result.success) {
        toast.success(`Stock updated for ${productName}`, {
          description: `New stock level: ${result.newStock} units`,
        });
        setOpen(false);
      } else {
        toast.error("Failed to update stock", {
          description: result.error || "Please try again.",
        });
      }
    });
  };

  const delta = stock - currentStock;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="h-8 gap-1.5 text-xs font-medium hover:border-primary/50"
      >
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
        Adjust
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Warehouse className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Adjust Stock Level</DialogTitle>
                <DialogDescription className="text-xs truncate max-w-[280px]">
                  {productName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Stock Count Display & Quick Steppers */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Current on hand: <strong>{currentStock}</strong></span>
                {delta !== 0 && (
                  <span
                    className={`font-semibold ${
                      delta > 0 ? "text-emerald-500" : "text-amber-500"
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta} units
                  </span>
                )}
              </div>

              {/* Number Input with Stepper */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => handleAdjust(-1)}
                  disabled={stock <= 0 || isPending}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-center font-bold text-lg h-10"
                  disabled={isPending}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => handleAdjust(1)}
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleAdjust(5)}
                  disabled={isPending}
                >
                  +5
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleAdjust(10)}
                  disabled={isPending}
                >
                  +10
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleAdjust(25)}
                  disabled={isPending}
                >
                  +25
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleAdjust(50)}
                  disabled={isPending}
                >
                  +50
                </Button>
              </div>
            </div>

            {/* Audit Reason Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Adjustment Reason / Note
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isPending}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {COMMON_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                This adjustment will be recorded in the permanent inventory history log.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <DialogClose
                render={<Button type="button" variant="outline" />}
                disabled={isPending}
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isPending || stock === currentStock}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Stock"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
