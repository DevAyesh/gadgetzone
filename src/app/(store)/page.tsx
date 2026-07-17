import Link from "next/link";
import { ArrowRight, Truck, RefreshCcw, CreditCard, Headset, Heart, Eye, Zap } from "lucide-react";
import { SiSamsung, SiGoogle, SiBeats, SiSony, SiApple, SiBose, SiJbl, SiXiaomi, SiFitbit, SiSennheiser, SiOneplus, SiLg } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { Button, buttonVariants } from "@/components/ui/button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MOCK_PRODUCTS = [
  { id: "1", name: "Beats Solo 3 Wireless Bluetooth", price: 249.99, priceStr: "$249.99", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", badge: "NEW", slug: "beats-solo-3", rating: 5 },
  { id: "2", name: "Beats Studio Pro", price: 349.99, priceStr: "$349.99", img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80", badge: "NEW", slug: "beats-studio-pro", rating: 5 },
  { id: "3", name: "BeatsFit - True Wireless Earbuds", price: 179.99, priceStr: "$179.99", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80", badge: "NEW", slug: "beats-fit", rating: 5 },
  { id: "4", name: "Sony - WH-1000XM5 Wireless Noise Canceling", price: 398.00, priceStr: "$398.00", img: "https://images.unsplash.com/photo-1572569433602-6663dbb38a79?w=600&q=80", badge: "NEW", slug: "sony-wh-1000xm5", rating: 5 },
  { id: "5", name: "Sony - WH-CH520 Wireless On-Ear Headset", price: 59.99, priceStr: "$59.99", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", badge: "NEW", slug: "sony-wh-ch520", rating: 5 },
  { id: "6", name: "Skullcandy - Crusher ANC 2 Wireless", price: 199.99, priceStr: "$199.99", img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80", badge: "NEW", slug: "skullcandy-crusher", rating: 5 },
  { id: "7", name: "Beats Studio Pro - Light", price: 349.99, priceStr: "$349.99", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80", badge: "NEW", slug: "beats-studio-pro-light", rating: 5 },
  { id: "8", name: "Skullcandy - Rail True Wireless Earbuds", price: 79.99, priceStr: "$79.99", img: "https://images.unsplash.com/photo-1572569433602-6663dbb38a79?w=600&q=80", badge: "NEW", slug: "skullcandy-rail", rating: 5 }
];

const MOCK_POPULAR = [
  { id: "9", name: "Beats Buds Mini", price: 129.99, priceStr: "$129.99", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80", badge: "", slug: "beats-buds", rating: 5 },
  { id: "10", name: "Beats Studio Pro White", price: 349.99, priceStr: "$349.99", img: "https://images.unsplash.com/photo-1572569433602-6663dbb38a79?w=600&q=80", badge: "", slug: "beats-studio-white", rating: 5 },
  { id: "11", name: "Sony - WH-1000XM4 Wireless Noise Canceling", price: 348.00, priceStr: "$348.00", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", badge: "", slug: "sony-wh-1000xm4", rating: 5 },
  { id: "12", name: "Skullcandy - Rail True Wireless Earbuds", price: 79.99, priceStr: "$79.99", img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80", badge: "", slug: "skullcandy-rail-2", rating: 5 },
  { id: "13", name: "Beats Flex Wireless", price: 69.99, priceStr: "$69.99", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80", badge: "", slug: "beats-flex", rating: 5 },
  { id: "14", name: "JBL Reflect Flow Pro", price: 179.95, priceStr: "$179.95", img: "https://images.unsplash.com/photo-1572569433602-6663dbb38a79?w=600&q=80", badge: "", slug: "jbl-reflect", rating: 5 },
  { id: "15", name: "Bose QuietComfort 45", price: 329.00, priceStr: "$329.00", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", badge: "", slug: "bose-qc45", rating: 5 },
  { id: "16", name: "JBL VIBE 100 TWS", price: 49.95, priceStr: "$49.95", img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80", badge: "", slug: "jbl-vibe", rating: 5 }
];

function ProductCard({ product }: { product: any }) {
  return (
    <Card className="group border-none shadow-none bg-transparent">
      <div className="relative aspect-square overflow-hidden bg-[#F5F5F5] rounded-md mb-4 flex items-center justify-center">
        {product.badge && (
          <Badge className="absolute top-3 left-3 z-10 bg-black text-white hover:bg-black rounded-sm text-xs font-semibold px-2 py-0.5">
            {product.badge}
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button className="bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white">
            <Heart className="h-4 w-4" />
          </button>
          <button className="bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white">
            <Eye className="h-4 w-4" />
          </button>
        </div>
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.img} 
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <AddToCartButton 
            product={{
              id: product.id,
              name: product.name,
              price: product.price * 100, // convert to cents
              slug: product.slug,
              image_url: product.img
            }}
          />
        </div>
      </div>
      <CardContent className="p-0">
        <div className="flex text-yellow-400 text-sm mb-2">
          {Array(product.rating).fill(0).map((_, i) => (
            <span key={i}>★</span>
          ))}
        </div>
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
        <p className="font-bold text-sm">{product.priceStr}</p>
      </CardContent>
    </Card>
  );
}

import { HeroSlider } from "@/components/hero-slider";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* Hero Section */}
      <HeroSlider />

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center justify-center p-8 bg-[#F8F9FA] rounded-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Free Delivery</h3>
                <p className="text-xs text-gray-500 mt-1">Orders above $200</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-[#F8F9FA] rounded-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <RefreshCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Refund Policy</h3>
                <p className="text-xs text-gray-500 mt-1">30 days guarantee</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-[#F8F9FA] rounded-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Online Payments</h3>
                <p className="text-xs text-gray-500 mt-1">Secure payment 100%</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-[#F8F9FA] rounded-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <Headset className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">24/7 Support</h3>
                <p className="text-xs text-gray-500 mt-1">Dedicated support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold tracking-tight mb-8">New Arrivals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop Collection Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Shop Collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[500px]">
            {/* Left Large Box */}
            <div className="bg-[#F5F5F5] rounded-md relative p-12 overflow-hidden flex flex-col justify-end h-[300px] md:h-full group cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80" 
                alt="Headphones Collection" 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3/4 object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
              />
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-2">Headphones</h3>
                <Link href="/shop" className="text-sm font-medium hover:underline inline-flex items-center gap-1 border border-black/20 px-3 py-1 bg-white/50 backdrop-blur-sm rounded">
                  Collection <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            
            {/* Right Stacked Boxes */}
            <div className="grid grid-rows-2 gap-6 h-[500px] md:h-full">
              <div className="bg-[#F8F9FA] rounded-md relative p-8 overflow-hidden flex flex-col justify-center h-full group cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80" 
                  alt="Earbuds Collection" 
                  className="absolute right-0 top-0 w-1/2 h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Earbuds</h3>
                  <Link href="/shop" className="text-sm font-medium hover:underline inline-flex items-center gap-1 border border-black/20 px-3 py-1 bg-white/50 backdrop-blur-sm rounded">
                    Collection <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <div className="bg-[#F8F9FA] rounded-md relative p-8 overflow-hidden flex flex-col justify-center h-full group cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1572569433602-6663dbb38a79?w=600&q=80" 
                  alt="Accessories Collection" 
                  className="absolute right-0 top-0 w-1/2 h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Accessories</h3>
                  <Link href="/shop" className="text-sm font-medium hover:underline inline-flex items-center gap-1 border border-black/20 px-3 py-1 bg-white/50 backdrop-blur-sm rounded">
                    Collection <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Popular Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MOCK_POPULAR.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-r from-[#1A1C23] to-[#2D3340] rounded-xl overflow-hidden relative flex flex-col md:flex-row items-center h-auto md:h-[400px]">
            <div className="md:w-1/2 relative h-[300px] md:h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80" 
                alt="Promo" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="md:w-1/2 p-8 md:p-16 text-white bg-[#F5F5F5] md:bg-transparent text-black md:text-white h-full flex flex-col justify-center">
              <p className="text-sm font-bold text-blue-500 mb-2 uppercase tracking-wider">Promotion</p>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black md:text-white">
                Hurry up! 40% OFF
              </h2>
              <p className="text-gray-600 md:text-gray-300 mb-8 max-w-md">
                Thousands of high tech are waiting for you
              </p>
              
              <div className="flex gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl">02</div>
                  <span className="text-[10px] mt-1 md:text-gray-300 text-gray-600">Days</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl">12</div>
                  <span className="text-[10px] mt-1 md:text-gray-300 text-gray-600">Hours</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl">46</div>
                  <span className="text-[10px] mt-1 md:text-gray-300 text-gray-600">Minutes</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl">06</div>
                  <span className="text-[10px] mt-1 md:text-gray-300 text-gray-600">Seconds</span>
                </div>
              </div>
              
              <div>
                <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "bg-black hover:bg-gray-800 text-white md:bg-white md:text-black md:hover:bg-gray-200 px-8 rounded-md h-12")}>
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Feedback Section */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-black">What Our Customers Say</h2>
            <p className="text-gray-500 text-lg">Real reviews from our verified buyers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
              <div className="text-blue-500 text-4xl font-serif absolute top-6 right-8 opacity-20">"</div>
              <div className="flex text-yellow-400 text-lg mb-4">
                ★★★★★
              </div>
              <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                "The noise cancellation on the Sony WH-1000XM5 is absolutely unreal. It completely blocks out my noisy office. Best purchase I've made this year!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  AD
                </div>
                <div>
                  <h4 className="font-bold text-black">Alex D.</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px]">✓</span> 
                    Verified Buyer
                  </p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
              <div className="text-blue-500 text-4xl font-serif absolute top-6 right-8 opacity-20">"</div>
              <div className="flex text-yellow-400 text-lg mb-4">
                ★★★★★
              </div>
              <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                "Incredible sound quality and the battery life lasts for days. Highly recommend Gadget Mart for their blazing fast shipping and great packaging."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xl">
                  SM
                </div>
                <div>
                  <h4 className="font-bold text-black">Sarah M.</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px]">✓</span> 
                    Verified Buyer
                  </p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
              <div className="text-blue-500 text-4xl font-serif absolute top-6 right-8 opacity-20">"</div>
              <div className="flex text-yellow-400 text-lg mb-4">
                ★★★★★
              </div>
              <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                "I was skeptical about the new Beats, but they fit perfectly and the bass is incredibly punchy without being overwhelming. 10/10."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                  JT
                </div>
                <div>
                  <h4 className="font-bold text-black">James T.</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px]">✓</span> 
                    Verified Buyer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-8 bg-white border-t border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 overflow-hidden">
          <div className="flex items-center overflow-x-auto scrollbar-hide gap-4 md:gap-6 pb-4 pt-2 snap-x snap-mandatory mask-image-linear-gradient">
            {/* Apple */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiApple className="h-10 md:h-12 w-auto text-black" />
            </div>
            {/* JBL */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiJbl className="h-10 md:h-12 w-auto text-[#ff3300]" />
            </div>
            {/* Sharge */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center gap-1 font-black text-xl italic tracking-tighter">
                <Zap className="h-6 w-6 fill-current text-black" /> SHARGE
              </div>
            </div>
            {/* Xiaomi */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiXiaomi className="h-10 md:h-12 w-auto text-[#ff6900]" />
            </div>
            {/* Marshall */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <span className="font-bold text-2xl md:text-3xl tracking-tighter" style={{fontFamily: 'cursive', transform: 'rotate(-5deg)'}}>Marshall</span>
            </div>
            {/* Sony */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiSony className="h-6 md:h-8 w-auto text-black" />
            </div>
            {/* Samsung */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiSamsung className="h-6 md:h-7 w-auto text-black" />
            </div>
            {/* Fitbit */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiFitbit className="h-8 md:h-10 w-auto text-[#00B0B9]" />
            </div>
            {/* Anker */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <span className="text-xl md:text-2xl font-black tracking-widest text-[#00a9e0]">ANKER</span>
            </div>
            {/* Bose */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiBose className="h-6 md:h-7 w-auto text-black italic" />
            </div>
            {/* Google */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <FcGoogle className="h-10 md:h-12 w-auto" />
            </div>
            {/* Haylou */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <span className="text-lg md:text-xl font-medium tracking-[0.2em] text-[#00A9E0]">H A Y L O U</span>
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
      </section>

    </div>
  );
}
