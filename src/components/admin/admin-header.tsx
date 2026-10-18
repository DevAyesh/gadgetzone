"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/admin/admin-sidebar";

interface AdminHeaderProps {
  userInitial: string;
  userEmail?: string;
  userRole?: string;
  lowStockCount?: number;
  logoutAction: () => Promise<void>;
}

export function AdminHeader({
  userInitial,
  userEmail,
  userRole = "admin",
  lowStockCount = 0,
  logoutAction,
}: AdminHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border/50 glass sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
              />
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 max-w-[85vw] border-r border-border/50">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent
              logoutAction={logoutAction}
              userInitial={userInitial}
              userEmail={userEmail}
              onItemClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground tracking-tight">
            Admin Portal
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Low Stock Alert Indicator */}
        {lowStockCount > 0 && (
          <Link
            href="/admin/inventory?filter=low_stock"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-medium transition-colors"
            title={`${lowStockCount} items have low or out-of-stock inventory`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Stock Alert:</span>
            <span className="font-bold">{lowStockCount}</span>
          </Link>
        )}

        {/* View Store Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md transition-colors"
        >
          <span>Store</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Info & Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/40">
          <div
            className="h-8 w-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center font-bold text-xs text-primary shadow-xs"
            title={`${userEmail || "Admin"} (${userRole})`}
          >
            {userInitial}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium leading-none truncate max-w-[120px]">
              {userEmail ? userEmail.split("@")[0] : "Admin"}
            </span>
            <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-0.5 mt-0.5">
              <ShieldCheck className="h-2.5 w-2.5 text-primary" />
              {userRole.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
