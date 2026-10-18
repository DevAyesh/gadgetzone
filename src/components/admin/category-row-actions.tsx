"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteCategory } from "@/app/admin/categories/actions";

interface CategoryRowActionsProps {
  categoryId: string;
  categoryName: string;
}

export function CategoryRowActions({ categoryId, categoryName }: CategoryRowActionsProps) {
  const [isPending] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/categories/${categoryId}/edit`}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
        title="Edit category"
      >
        <Edit className="h-4 w-4" />
      </Link>

      <ConfirmDialog
        title="Delete Category"
        description={`Are you sure you want to permanently delete category "${categoryName}"? Any products currently mapped to this category will become uncategorized.`}
        confirmLabel="Delete Category"
        variant="destructive"
        successMessage={`Category "${categoryName}" deleted successfully`}
        onConfirm={async () => {
          return await deleteCategory(categoryId);
        }}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}
