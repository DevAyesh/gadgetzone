"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteProduct } from "@/app/admin/products/actions";

interface ProductRowActionsProps {
  productId: string;
  productName: string;
}

export function ProductRowActions({ productId, productName }: ProductRowActionsProps) {
  const [isPending] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/products/${productId}/edit`}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
        title="Edit product"
      >
        <Edit className="h-4 w-4" />
      </Link>

      <ConfirmDialog
        title="Delete Product"
        description={`Are you sure you want to permanently delete "${productName}"? This action cannot be undone and will remove all product imagery and catalog associations.`}
        confirmLabel="Delete Product"
        variant="destructive"
        successMessage={`Product "${productName}" deleted successfully`}
        onConfirm={async () => {
          return await deleteProduct(productId);
        }}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}
