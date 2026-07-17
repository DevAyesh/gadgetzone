import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GadgetZone - Premium Electronics & Gadgets",
  description: "Discover the latest premium electronics, smartphones, laptops, and accessories at GadgetZone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}>
          {children}
          <Toaster />
      </body>
    </html>
  );
}
