"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    image_url: string;
  };
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  showIcon?: boolean;
  iconOnly?: boolean;
}

export function AddToCartButton({ product, className, variant = "default", showIcon = true, iconOnly = false }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link area
    e.stopPropagation(); // Prevent bubbling up to parent clickable areas
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      slug: product.slug,
      image_url: product.image_url,
    });
    
    // Automatically open the cart sheet
    document.dispatchEvent(new CustomEvent('open-cart'));
    
    toast.success("Added to cart", {
      description: `${product.name} was added to your shopping cart.`
    });
  };

  return (
    <Button 
      variant={variant} 
      className={cn("transition-all duration-300 active:scale-95", className)} 
      onClick={handleAddToCart}
      size={iconOnly ? "icon" : "default"}
    >
      {showIcon && <ShoppingCart className={cn(iconOnly ? "w-5 h-5" : "w-4 h-4 mr-2")} />}
      {!iconOnly && "Add to Cart"}
    </Button>
  );
}
