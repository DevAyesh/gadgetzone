"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "ORD-000000";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4 py-20 text-center">
      
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative bg-background border-4 border-primary/20 p-4 rounded-full">
          <CheckCircle2 className="w-24 h-24 text-primary" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
        Order Confirmed!
      </h1>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
        Thank you for your purchase. We have received your order and are currently processing it.
      </p>

      <div className="glass-card border border-border/50 p-6 rounded-2xl mb-10 w-full max-w-sm flex items-center justify-between">
        <span className="text-muted-foreground">Order Number</span>
        <span className="font-mono font-bold text-lg">{orderNumber}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/shop">
          <Button size="lg" className="rounded-full w-full sm:w-auto h-12 px-8">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Continue Shopping
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto h-12 px-8">
            Return Home
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex flex-col items-center justify-center">Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
