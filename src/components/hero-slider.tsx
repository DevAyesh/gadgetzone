"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const SLIDES = [
  {
    title: "Listen Beyond",
    titleBold: "Just Sound.",
    desc: "Experience music like never before with industry-leading noise cancellation and premium comfort.",
    price: "$398.00",
    badge: "NEW ARRIVAL",
    img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&q=80",
    link: "/shop"
  },
  {
    title: "Vibrant Beats",
    titleBold: "For Everyone.",
    desc: "Bring color to your everyday listening. Feel the bass and make a statement.",
    price: "$249.99",
    badge: "BEST SELLER",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    link: "/shop"
  },
  {
    title: "True Wireless",
    titleBold: "True Freedom.",
    desc: "Seamless connectivity, crystal clear calls, and all-day comfort in a compact case.",
    price: "$179.99",
    badge: "TRENDING",
    img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&q=80",
    link: "/shop"
  }
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mt-4 mx-4 md:mx-8 rounded-xl overflow-hidden relative bg-[#F8F9FA] h-[500px] md:h-[600px]">
      {SLIDES.map((slide, index) => (
        <div 
          key={index}
          className={cn(
            "absolute inset-0 flex flex-col md:flex-row transition-opacity duration-1000",
            index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          )}
        >
          {/* Left Content Area */}
          <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center h-[50%] md:h-full z-10 bg-white/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none absolute md:relative bottom-0 w-full">
            <div className="space-y-4 md:space-y-6 max-w-lg transform transition-transform duration-700 translate-y-0" style={{ transform: index === current ? 'translateY(0)' : 'translateY(20px)' }}>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-bold rounded-full uppercase tracking-wider">
                <Tag className="h-3 w-3" />
                {slide.badge}
              </div>
              
              <h1 className="text-4xl md:text-7xl font-light tracking-tight text-black leading-[1.1]">
                {slide.title} <br />
                <span className="font-extrabold">{slide.titleBold}</span>
              </h1>
              
              <p className="text-sm md:text-lg text-gray-600 font-medium">
                {slide.desc}
              </p>
              
              <div className="flex items-center gap-6 pt-2">
                <span className="text-2xl md:text-3xl font-black">{slide.price}</span>
                <Link href={slide.link} className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base bg-black hover:bg-gray-800 text-white rounded-full group")}>
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Image Area (Split Screen) */}
          <div className="md:w-1/2 h-full absolute md:relative top-0 right-0 w-full md:w-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={slide.img} 
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ))}
      
      {/* Pagination Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === current ? "bg-black w-6" : "bg-gray-400 hover:bg-gray-600"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
