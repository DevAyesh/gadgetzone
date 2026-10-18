"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { Loader2 } from "lucide-react";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'processing': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'shipped': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'delivered': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'bg-transparent';
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsPending(true);
    
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setStatus(newStatus);
        toast.success("Order status updated");
      } else {
        toast.error("Failed to update status", { description: result.error });
        // Revert to currentStatus on failure (since UI is controlled by state temporarily)
        e.target.value = status;
      }
    } catch {
      toast.error("An unexpected error occurred");
      e.target.value = status;
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        disabled={isPending}
        value={status}
        onChange={handleStatusChange}
        className={`appearance-none rounded-full px-3 py-1 pr-8 text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer ${getStatusColor(status)} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="pending" className="text-foreground bg-background">Pending</option>
        <option value="processing" className="text-foreground bg-background">Processing</option>
        <option value="shipped" className="text-foreground bg-background">Shipped</option>
        <option value="delivered" className="text-foreground bg-background">Delivered</option>
        <option value="cancelled" className="text-foreground bg-background">Cancelled</option>
      </select>
      <div className="pointer-events-none absolute right-2 flex items-center justify-center">
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <svg className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        )}
      </div>
    </div>
  );
}
