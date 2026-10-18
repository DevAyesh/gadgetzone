"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteCollection } from "@/app/admin/collections/actions";

interface CollectionRowActionsProps {
  collectionId: string;
  collectionName: string;
}

export function CollectionRowActions({ collectionId, collectionName }: CollectionRowActionsProps) {
  const [isPending] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/collections/${collectionId}/edit`}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
        title="Edit collection"
      >
        <Edit className="h-4 w-4" />
      </Link>

      <ConfirmDialog
        title="Delete Collection"
        description={`Are you sure you want to permanently delete collection "${collectionName}"? Products in this collection will remain in the catalog.`}
        confirmLabel="Delete Collection"
        variant="destructive"
        successMessage={`Collection "${collectionName}" deleted successfully`}
        onConfirm={async () => {
          return await deleteCollection(collectionId);
        }}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Delete collection"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}
