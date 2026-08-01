"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Package,
  Layers,
  Award,
  Warehouse,
  Truck,
  FileText,
  BarChart3,
  History,
  Bell,
  Activity,
  TrendingUp,
  ImageIcon,
  Star,
  Ticket,
  ChevronRight,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Future: badge count for unread notifications, low-stock alerts, etc. */
  badge?: number;
  /** Marks the route as not yet built — renders as coming-soon style */
  soon?: boolean;
}

interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

// ─── Navigation structure ────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Catalog",
    icon: Package,
    items: [
      { href: "/admin/products",    label: "Products",    icon: ShoppingBag },
      { href: "/admin/categories",  label: "Categories",  icon: Tags },
      { href: "/admin/brands",      label: "Brands",      icon: Award,      soon: true },
      { href: "/admin/collections", label: "Collections", icon: Layers },
    ],
  },
  {
    title: "Inventory",
    icon: Warehouse,
    items: [
      { href: "/admin/inventory",                    label: "Inventory",       icon: BarChart3, soon: true },
      { href: "/admin/inventory/stock-history",      label: "Stock History",   icon: History,   soon: true },
      { href: "/admin/inventory/suppliers",          label: "Suppliers",       icon: Truck,     soon: true },
      { href: "/admin/inventory/purchase-orders",    label: "Purchase Orders", icon: FileText,  soon: true },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    items: [
      { href: "/admin/orders",             label: "Orders",    icon: ShoppingCart },
      { href: "/admin/customers",          label: "Customers", icon: Users },
      { href: "/admin/marketing/coupons",  label: "Coupons",   icon: Ticket, soon: true },
    ],
  },
  {
    title: "Content",
    icon: ImageIcon,
    items: [
      { href: "/admin/content/banners", label: "Banners", icon: ImageIcon, soon: true },
      { href: "/admin/content/reviews", label: "Reviews", icon: Star,      soon: true },
    ],
  },
  {
    title: "Reports",
    icon: TrendingUp,
    items: [
      { href: "/admin/reports/sales",      label: "Sales Reports",      icon: TrendingUp, soon: true },
      { href: "/admin/reports/inventory",  label: "Inventory Reports",  icon: BarChart3,  soon: true },
      { href: "/admin/reports/customers",  label: "Customer Reports",   icon: Users,      soon: true },
    ],
  },
  {
    title: "System",
    icon: Settings,
    items: [
      { href: "/admin/system/notifications", label: "Notifications", icon: Bell,     soon: true },
      { href: "/admin/system/audit-logs",    label: "Audit Logs",    icon: Activity, soon: true },
      { href: "/admin/settings",             label: "Settings",       icon: Settings },
    ],
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function getDefaultOpenGroups(pathname: string): Set<string> {
  const open = new Set<string>();
  for (const group of NAV_GROUPS) {
    if (group.items.some((item) => pathname.startsWith(item.href))) {
      open.add(group.title);
    }
  }
  // Always open at least the first group if nothing matches
  if (open.size === 0) open.add("Catalog");
  return open;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavGroupSection({
  group,
  isOpen,
  onToggle,
  pathname,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  const GroupIcon = group.icon;
  const hasActiveItem = group.items.some((item) => pathname.startsWith(item.href));

  return (
    <div className="space-y-0.5">
      {/* Group Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
          hasActiveItem
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          <GroupIcon className="h-3.5 w-3.5" />
          {group.title}
        </div>
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
      </button>

      {/* Group Items */}
      {isOpen && (
        <div className="ml-1 space-y-0.5 pl-3 border-l border-border/40">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.soon ? "#" : item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : item.soon
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                tabIndex={item.soon ? -1 : 0}
                onClick={item.soon ? (e) => e.preventDefault() : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                  {item.soon && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground/60 font-medium uppercase tracking-wide">
                      soon
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  logoutAction: () => Promise<void>;
  userInitial: string;
  userEmail?: string;
}

export function AdminSidebar({
  logoutAction,
  userInitial,
  userEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(() =>
    getDefaultOpenGroups(pathname)
  );

  // Re-sync open groups when the route changes (e.g. navigating to a new section)
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      for (const group of NAV_GROUPS) {
        if (group.items.some((item) => pathname.startsWith(item.href))) {
          next.add(group.title);
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const isDashboard = pathname === "/admin";

  return (
    <aside className="w-64 border-r border-border/50 glass hidden md:flex flex-col">
      {/* Brand */}
      <div className="h-14 flex items-center px-5 border-b border-border/50 flex-shrink-0">
        <Link
          href="/admin"
          className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 tracking-tight"
        >
          GadgetZone Admin
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        {/* Dashboard — standalone link */}
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-2",
            isDashboard
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          Dashboard
        </Link>

        {/* Divider */}
        <div className="h-px bg-border/50 my-3" />

        {/* Grouped nav sections */}
        <div className="space-y-1">
          {NAV_GROUPS.map((group) => (
            <NavGroupSection
              key={group.title}
              group={group}
              isOpen={openGroups.has(group.title)}
              onToggle={() => toggleGroup(group.title)}
              pathname={pathname}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 p-3 flex-shrink-0 space-y-1">
        {/* Store link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Store className="h-4 w-4" />
          View Store
        </Link>

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>

        {/* User + version */}
        <div className="px-3 pt-2 flex items-center gap-2 border-t border-border/50 mt-1">
          <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0">
            {userEmail && (
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            )}
            <p className="text-[10px] text-muted-foreground/50">v2.0 · 2026</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
