import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";

// Fallback products for demo when Supabase isn't connected
const fallbackProducts = [
  { name: "iPhone 15 Pro Max", price: 149999, old_price: 164999, badge: "HOT", slug: "iphone-15-pro-max", category: { name: "Smartphones" }, images: [{ image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80", is_primary: true }] },
  { name: "Sony WH-1000XM5", price: 34999, old_price: 39999, badge: "SALE", slug: "sony-wh-1000xm5", category: { name: "Audio" }, images: [{ image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", is_primary: true }] },
];

export default async function CollectionPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;
  const supabase = await createClient();
  
  let collection = null;
  let products = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // 1. Fetch collection details
    const { data: collectionData } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .single();

    if (collectionData) {
      collection = collectionData;

      // 2. Fetch products in this collection
      const { data: productsData } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug),
          images:product_images(image_url, is_primary)
        `)
        .eq("collection_id", collection.id)
        .order("created_at", { ascending: false });

      products = productsData;
    }
  }

  // Use fallback if no database connection
  const displayProducts = products || fallbackProducts;
  
  // Create a title if no DB (fallback)
  const pageTitle = collection?.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      
      {/* Header Section */}
      <div className="max-w-3xl mb-12 text-center mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{pageTitle} Collection</h1>
        <p className="text-lg text-muted-foreground">
          Explore our exclusive range of {pageTitle} products. Handpicked for the best experience.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <span className="text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm font-medium">
          {displayProducts.length} Items
        </span>
      </div>

      {displayProducts.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border/50">
          <h3 className="text-2xl font-semibold mb-2">This collection is empty</h3>
          <p className="text-muted-foreground mb-6">Check back later for new arrivals!</p>
          <Link href="/shop" className="text-primary font-medium hover:underline">
            ← Back to Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product: any, i: number) => {
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
  );
}
