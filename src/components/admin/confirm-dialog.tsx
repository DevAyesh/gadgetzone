"use client";

import { useState, useTransition } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ConfirmDialogProps {
  /** The trigger element (button/link that opens the dialog). */
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  /**
   * Called when the user confirms. Can be a Server Action passed as a prop —
   * this is a valid Next.js App Router pattern.
   */
  onConfirm: () => Promise<{ success: boolean; error?: string } | void>;
  variant?: "destructive" | "warning";
  successMessage?: string;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  variant = "destructive",
  successMessage = "Action completed successfully",
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const result = await onConfirm();
        if (result && !result.success) {
          toast.error("Action failed", { description: result.error });
        } else {
          toast.success(successMessage);
          setOpen(false);
        }
      } catch (err: any) {
        toast.error("An unexpected error occurred", { description: err?.message });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger — rendered inline so callers don't need Dialog boilerplate */}
      <span
        onClick={() => setOpen(true)}
        className="contents"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
      >
        {trigger}
      </span>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={
                variant === "destructive"
                  ? "h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0"
                  : "h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0"
              }
            >
              <AlertTriangle
                className={
                  variant === "destructive"
                    ? "h-5 w-5 text-red-500"
                    : "h-5 w-5 text-yellow-500"
                }
              />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />} disabled={isPending}>
            Cancel
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            variant={variant === "destructive" ? "destructive" : "default"}
            className={
              variant === "warning"
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : undefined
            }
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
