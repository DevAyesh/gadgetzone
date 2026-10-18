"use client";

import { useTransition } from "react";
import { Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleReviewApproval, deleteReview } from "@/app/admin/content/reviews/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface ReviewRowActionsProps {
  reviewId: string;
  isApproved: boolean;
}

export function ReviewRowActions({
  reviewId,
  isApproved,
}: ReviewRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleReviewApproval(reviewId, !isApproved);
      if (res.success) {
        toast.success(`Review ${!isApproved ? "approved" : "hidden from storefront"}`);
      } else {
        toast.error(res.error || "Failed to update review status");
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
          isApproved
            ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
            : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
        }`}
        title={isApproved ? "Unapprove review" : "Approve review"}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isApproved ? (
          <XCircle className="h-3.5 w-3.5" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        <span>{isApproved ? "Unapprove" : "Approve"}</span>
      </Button>

      <ConfirmDialog
        title="Delete Review"
        description="Are you sure you want to permanently delete this customer review? This action cannot be undone."
        confirmLabel="Delete Review"
        variant="destructive"
        successMessage="Review deleted successfully"
        onConfirm={async () => {
          return await deleteReview(reviewId);
        }}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Delete review"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
      />
    </div>
  );
}
