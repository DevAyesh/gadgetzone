"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Eye, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { updateCustomerRole } from "@/app/admin/customers/actions";

interface CustomerRowActionsProps {
  customerId: string;
  customerName: string;
  role: string;
  ordersCount: number;
}

export function CustomerRowActions({
  customerId,
  customerName,
  role,
  ordersCount,
}: CustomerRowActionsProps) {
  const [isPending] = useTransition();
  const isStaff = role === "admin" || role === "super_admin";
  const nextRole = role === "admin" ? "customer" : "admin";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {ordersCount > 0 ? (
        <Link href={`/admin/orders?customer=${customerId}`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Eye className="h-3.5 w-3.5" />
            Orders ({ordersCount})
          </Button>
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground/60 px-2">—</span>
      )}

      {role !== "super_admin" && (
        <ConfirmDialog
          title={isStaff ? "Demote to Customer" : "Promote to Admin"}
          description={`Are you sure you want to change ${customerName}'s account role to ${nextRole.toUpperCase()}? ${
            nextRole === "admin"
              ? "This user will gain full management access to the store's admin panel."
              : "This user will lose access to the admin dashboard."
          }`}
          confirmLabel={isStaff ? "Demote Account" : "Grant Admin Access"}
          variant={isStaff ? "warning" : "default"}
          successMessage={`Role updated for ${customerName}`}
          onConfirm={async () => {
            return await updateCustomerRole(customerId, nextRole as "customer" | "admin");
          }}
          trigger={
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className={`h-8 px-2 text-xs gap-1 ${
                isStaff
                  ? "text-purple-600 hover:text-purple-700 hover:bg-purple-500/10 border-purple-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={isStaff ? "Demote from Admin" : "Promote to Admin"}
            >
              {isStaff ? (
                <>
                  <ShieldAlert className="h-3 w-3" />
                  Demote
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3 w-3" />
                  Make Admin
                </>
              )}
            </Button>
          }
        />
      )}
    </div>
  );
}
