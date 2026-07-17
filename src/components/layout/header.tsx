import Link from "next/link";
import { ShoppingCart, User, Search, Menu, ChevronDown, Flame } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSheet } from "@/components/cart-sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/search-bar";

export async function Header() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  const categoryImages: Record<string, string> = {
    'smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80',
    'laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80',
    'audio': 'https://dlifestylesg.com/cdn/shop/files/ULT_WEAR_Black_Standard-Large_1200x.jpg?v=1712806803',
    'wearables': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&q=80',
    'cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80',
    'gaming': 'https://pisces.bbystatic.com/image2/BestBuy_US/dam/4672150-VG-cope-0389c629-d4c2-4afd-9ec0-46adadd4b8cf.jpg;maxHeight=455;maxWidth=815',
    'gaming-consoles': 'https://pisces.bbystatic.com/image2/BestBuy_US/dam/4672150-VG-cope-0389c629-d4c2-4afd-9ec0-46adadd4b8cf.jpg;maxHeight=455;maxWidth=815',
    'accessories': 'https://cdn.packhacker.com/2022/07/f1b89bdb-travel-tech-acc-featured.jpg'
  };

  return (
    <div className="flex flex-col w-full z-50 sticky top-0">
      {/* Top Banner */}
      <div className="w-full bg-black text-white text-[11px] py-1.5 px-4 flex items-center justify-center gap-2 font-medium tracking-wide">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span>50% off sitewide - limited time!</span>
        <Link href="/shop" className="text-yellow-400 hover:underline flex items-center">
          Shop Now <span className="ml-1">→</span>
        </Link>
      </div>

      {/* Main Header */}
      <header className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-6 mt-8">
                  <Link href="/" className="text-lg font-medium hover:text-black transition-colors">Home</Link>
                  
                  <div className="flex flex-col gap-3">
                    <Link href="/shop" className="text-lg font-medium hover:text-black transition-colors">Products</Link>
                    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x w-full">
                      {categories?.map((category) => {
                        const imgUrl = categoryImages[category.slug] || 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=300&q=80';
                        return (
                          <Link 
                            key={category.id} 
                            href={`/shop?category=${category.slug}`} 
                            className="flex flex-col items-center gap-2 shrink-0 snap-start w-16 group/mob"
                          >
                            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center p-0.5 border border-gray-100 group-hover/mob:bg-gray-100 transition-colors">
                              <img src={imgUrl} alt={category.name} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <span className="text-[10px] font-medium text-center text-gray-600 leading-tight group-hover/mob:text-black transition-colors">
                              {category.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <Link href="/sale" className="text-lg font-medium hover:text-black transition-colors">Sale</Link>
                  <Link href="/contact" className="text-lg font-medium hover:text-black transition-colors">Contact Us</Link>
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
            <div className="flex items-center gap-1 cursor-pointer group relative py-4">
              <Link href="/shop" className="text-foreground group-hover:text-primary transition-colors">Product</Link>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              
              {/* Categories Mega Menu Dropdown */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-max max-w-[95vw] lg:max-w-5xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-3 group-hover:translate-y-0 transition-all duration-300 ease-out pt-6 z-50">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide">
                  {categories?.map((category) => {
                    const imgUrl = categoryImages[category.slug] || 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=300&q=80';
                    return (
                      <Link 
                        key={category.id} 
                        href={`/shop?category=${category.slug}`} 
                        className="flex flex-col items-center gap-3 group/cat shrink-0 w-16 md:w-20"
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F8F9FA] flex items-center justify-center p-1 md:p-1.5 group-hover/cat:shadow-md group-hover/cat:bg-white border border-transparent group-hover/cat:border-gray-100 transition-all duration-300 group-hover/cat:-translate-y-1 group-hover/cat:scale-105">
                          <img 
                            src={imgUrl} 
                            alt={category.name} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        </div>
                        <span className="text-[11px] md:text-xs font-medium text-center text-gray-500 group-hover/cat:text-black transition-colors tracking-wide">
                          {category.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 cursor-pointer group relative">
              <Link href="/sale" className="text-foreground group-hover:text-primary transition-colors">Sale</Link>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">Contact Us</Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <SearchBar />
            
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
