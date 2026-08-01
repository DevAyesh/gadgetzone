"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Search } from "lucide-react";

interface ShopSidebarProps {
  categories: { name: string; slug: string }[];
  currentCategory?: string;
  availableBrands: string[];
}

export function ShopSidebar({ categories, currentCategory, availableBrands }: ShopSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brands")?.split(",").filter(Boolean) || []
  );
  
  const initialMinPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!, 10) : 0;
  const initialMaxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!, 10) : 100000;
  
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [brandSearch, setBrandSearch] = useState("");

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleBrand = (brand: string) => {
    const updated = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    
    setSelectedBrands(updated);
    updateFilters({ brands: updated.length > 0 ? updated.join(",") : null });
  };

  const handleInStockToggle = (checked: boolean) => {
    setInStock(checked);
    updateFilters({ inStock: checked ? "true" : null });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(parseInt(e.target.value, 10));
  };

  const applyPriceFilter = () => {
    updateFilters({ 
      minPrice: minPrice > 0 ? minPrice.toString() : null,
      maxPrice: maxPrice < 100000 ? maxPrice.toString() : null
    });
  };

  const filteredBrands = availableBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  return (
    <div className="sticky top-24 space-y-8 bg-card border border-border/50 p-6 rounded-xl glass-card">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-lg mb-4 uppercase tracking-wider text-muted-foreground text-sm">Categories</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            <Link href="/shop" className={cn("hover:text-primary transition-colors block py-1", !currentCategory && "text-primary font-medium")}>
              All Products
            </Link>
          </li>
          {categories.map(cat => (
            <li key={cat.slug}>
              <Link href={`/shop?category=${cat.slug}`} className={cn("hover:text-primary transition-colors block py-1", currentCategory === cat.slug && "text-primary font-medium")}>
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-border/50 w-full" />

      {/* In Stock Filter */}
      <div>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">In Stock Only</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={inStock} onChange={(e) => handleInStockToggle(e.target.checked)} />
            <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </label>
      </div>

      <div className="h-px bg-border/50 w-full" />

      {/* Brand Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground">By Brands</h3>
        
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Search brands..." 
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full bg-background border border-input rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="peer appearance-none w-4 h-4 border border-input rounded-sm bg-background checked:bg-primary checked:border-primary focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background transition-all"
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm group-hover:text-primary transition-colors">{brand}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No brands found.</p>
          )}
        </div>
      </div>

      <div className="h-px bg-border/50 w-full" />

      {/* Price Filter */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">By Price</h3>
          <button 
            onClick={applyPriceFilter}
            className="text-xs font-medium text-primary hover:underline"
          >
            Apply
          </button>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max="100000" 
          step="1000"
          value={maxPrice}
          onChange={handlePriceChange}
          onMouseUp={applyPriceFilter}
          onTouchEnd={applyPriceFilter}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground mt-4">
          <span>Rs. {minPrice.toLocaleString()}</span>
          <span>Rs. {maxPrice.toLocaleString()}{maxPrice >= 100000 ? '+' : ''}</span>
        </div>
      </div>
    </div>
  );
}
