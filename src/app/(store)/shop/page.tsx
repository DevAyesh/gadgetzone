import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { cn, formatPrice } from "@/lib/utils";
import { ShopSidebar } from "@/components/shop-sidebar";

// Dummy fallback in case Supabase env variables are not set yet
const fallbackProducts = [
  { name: "iPhone 15 Pro Max", price: 149999, old_price: 164999, badge: "HOT", slug: "iphone-15-pro-max", category: { name: "Smartphones", slug: "smartphones" }, images: [{ image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80", is_primary: true }] },
  { name: "Sony WH-1000XM5", price: 34999, old_price: 39999, badge: "SALE", slug: "sony-wh-1000xm5", category: { name: "Audio", slug: "audio" }, images: [{ image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", is_primary: true }] },
  { name: "MacBook Air M3", price: 139999, old_price: 154999, badge: "NEW", slug: "macbook-air-m3", category: { name: "Laptops", slug: "laptops" }, images: [{ image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", is_primary: true }] },
];

export default async function ShopPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const collection = typeof searchParams.collection === 'string' ? searchParams.collection : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const brandsParam = typeof searchParams.brands === 'string' ? searchParams.brands : undefined;
  const minPrice = typeof searchParams.minPrice === 'string' ? parseInt(searchParams.minPrice, 10) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseInt(searchParams.maxPrice, 10) : undefined;
  const inStock = searchParams.inStock === 'true';
  const selectedBrands = brandsParam ? brandsParam.split(',').filter(Boolean) : [];
  
  const supabase = await createClient();
  let products: any[] | null = null;
  let allCategories: any[] = [];
  let availableBrands: string[] = [];

  // Only try to fetch if Supabase URL is configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const collectionJoin = collection ? "collection:collections!inner(name, slug)" : "collection:collections(name, slug)";
    
    let query = supabase
      .from("products")
      .select(`
        *,
        category:categories!inner(name, slug),
        ${collectionJoin},
        images:product_images(image_url, is_primary)
      `)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq('category.slug', category);
    }
    
    if (collection) {
      query = query.eq('collection.slug', collection);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (selectedBrands.length > 0) {
      query = query.in('brand', selectedBrands);
    }
    
    if (minPrice !== undefined) {
      query = query.gte('price', minPrice * 100);
    }
    
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice * 100);
    }
    
    if (inStock) {
      query = query.gt('stock', 0);
    }

    const { data } = await query;
    products = data;

    // Fetch categories for the sidebar
    const { data: cats } = await supabase.from('categories').select('name, slug').order('name');
    allCategories = cats || [];

    // Fetch distinct brands for the sidebar (simple approach by fetching all unique brands from products)
    const { data: brandsData } = await supabase.from('products').select('brand').not('brand', 'is', null);
    if (brandsData) {
      availableBrands = Array.from(new Set(brandsData.map(b => b.brand))).filter(Boolean) as string[];
      availableBrands.sort();
    }
  }

  // Use fallback if no database connection or empty results
  let displayProducts = products && products.length > 0 ? products : fallbackProducts;

  if ((!products || products.length === 0) && category) {
    displayProducts = fallbackProducts.filter(p => p.category.slug === category);
  } else if ((!products || products.length === 0) && search) {
    displayProducts = fallbackProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  } else if ((!products || products.length === 0) && collection) {
    // Basic fallback for collections just to show something
    displayProducts = fallbackProducts;
  }

  let pageTitle = "All Products";
  if (category) {
    pageTitle = category.charAt(0).toUpperCase() + category.slice(1);
  } else if (collection) {
    pageTitle = collection.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  } else if (search) {
    pageTitle = `Search Results for "${search}"`;
  }
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar / Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <ShopSidebar 
          categories={allCategories} 
          currentCategory={category}
          availableBrands={availableBrands}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            {pageTitle}
          </h1>
          <span className="text-muted-foreground">{displayProducts.length} Products</span>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product, i) => {
              const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url 
                                  || product.images?.[0]?.image_url 
                                  || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80";
              
              return (
                <Card key={i} className="group overflow-hidden border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col">
                  <Link href={`/shop/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted block">
                    {product.badge && (
                      <Badge className="absolute top-3 left-3 z-10" variant={product.badge === 'HOT' ? 'destructive' : 'default'}>
                        {product.badge}
                      </Badge>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={primaryImage} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                      {product.old_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.old_price)}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 relative z-20">
                      <AddToCartButton 
                        product={{
                          id: product.id || String(i),
                          name: product.name,
                          price: product.price,
                          slug: product.slug,
                          image_url: primaryImage
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
    </div>
  );
}
