import Link from "next/link";
import { ShoppingCart, User, Search, Menu, ChevronDown, Flame } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSheet } from "@/components/cart-sheet";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <div className="flex flex-col w-full z-50">
      {/* Top Banner */}
      <div className="w-full bg-black text-white text-[11px] py-1.5 px-4 flex items-center justify-center gap-2 font-medium tracking-wide">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span>50% off sitewide - limited time!</span>
        <Link href="/shop" className="text-yellow-400 hover:underline flex items-center">
          Shop Now <span className="ml-1">→</span>
        </Link>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-b border-border">
        <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
                  <Link href="/shop" className="text-lg font-medium hover:text-primary transition-colors">Product</Link>
                  <Link href="/sale" className="text-lg font-medium hover:text-primary transition-colors">Sale</Link>
                  <Link href="/contact" className="text-lg font-medium hover:text-primary transition-colors">Contact Us</Link>
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-foreground tracking-tight">
                Gadget Mart
              </span>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <div className="flex items-center gap-1 cursor-pointer group relative">
              <Link href="/shop" className="text-foreground group-hover:text-primary transition-colors">Product</Link>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer group relative">
              <Link href="/sale" className="text-foreground group-hover:text-primary transition-colors">Sale</Link>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">Contact Us</Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:bg-muted">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full text-foreground hover:bg-muted")}>
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Link>

            <CartSheet />
          </div>
        </div>
      </header>
    </div>
  );
}
