"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderStatusUpdate({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleUpdate = async () => {
    setIsPending(true);
    try {
      const result = await updateOrderStatus(orderId, status);
      if (result.success) {
        toast.success("Order status updated successfully!");
      } else {
        toast.error("Failed to update status", { description: result.error });
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Update Status:</span>
      <div className="relative inline-flex items-center">
        <select
          disabled={isPending}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="appearance-none rounded-md bg-muted/50 px-4 py-2 pr-10 text-sm font-medium border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer w-40 capitalize"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="pointer-events-none absolute right-3 flex items-center justify-center">
          <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      <Button 
        onClick={handleUpdate} 
        disabled={isPending || status === currentStatus}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-md"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
      </Button>
    </div>
  );
}
