"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, Store, Truck, Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { savePlatformSettings } from "@/app/admin/settings/actions";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const [settings, setSettings] = useState({
    store_name: initialSettings.store_name || "GadgetZone",
    support_email: initialSettings.support_email || "support@gadgetzone.com",
    support_phone: initialSettings.support_phone || "+94 (11) 234-5678",
    currency_symbol: initialSettings.currency_symbol || "Rs.",
    low_stock_threshold: initialSettings.low_stock_threshold || "10",
    standard_shipping_fee: initialSettings.standard_shipping_fee || "500.00",
    free_shipping_minimum: initialSettings.free_shipping_minimum || "15000.00",
    enable_cod: initialSettings.enable_cod || "true",
    maintenance_mode: initialSettings.maintenance_mode || "false",
    announcement_bar: initialSettings.announcement_bar || "Free islandwide delivery on orders over Rs. 15,000!",
  });

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await savePlatformSettings(settings);
      if (res.success) {
        toast.success("Platform settings saved successfully!");
      } else {
        toast.error("Failed to save settings", {
          description: res.error,
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Store General Identity ─────────────────────────────────────────── */}
      <div className="glass-card rounded-xl border border-border/50 p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Store Identity & Contact</h2>
            <p className="text-xs text-muted-foreground">General branding displayed to buyers across emails and receipts.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="store_name" className="text-xs font-semibold">Store Brand Name</Label>
            <Input
              id="store_name"
              value={settings.store_name}
              onChange={(e) => handleChange("store_name", e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="support_email" className="text-xs font-semibold">Support Contact Email</Label>
            <Input
              id="support_email"
              type="email"
              value={settings.support_email}
              onChange={(e) => handleChange("support_email", e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="support_phone" className="text-xs font-semibold">Customer Helpline Phone</Label>
            <Input
              id="support_phone"
              value={settings.support_phone}
              onChange={(e) => handleChange("support_phone", e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency_symbol" className="text-xs font-semibold">Display Currency Symbol</Label>
            <Input
              id="currency_symbol"
              value={settings.currency_symbol}
              onChange={(e) => handleChange("currency_symbol", e.target.value)}
              className="max-w-[120px] font-mono text-center font-bold"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* ── Inventory Rules ─────────────────────────────────────────────────── */}
      <div className="glass-card rounded-xl border border-border/50 p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Inventory Thresholds</h2>
            <p className="text-xs text-muted-foreground">Automated alert parameters for restock warnings and warehouse shortage flags.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="low_stock_threshold" className="text-xs font-semibold">Low Stock Alert Threshold (units)</Label>
            <Input
              id="low_stock_threshold"
              type="number"
              min={1}
              value={settings.low_stock_threshold}
              onChange={(e) => handleChange("low_stock_threshold", e.target.value)}
              className="max-w-[160px] font-mono"
              disabled={isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Products with stock at or below this level trigger a warning in the dashboard and header.
            </p>
          </div>
        </div>
      </div>

      {/* ── Shipping & Order Delivery ────────────────────────────────────────── */}
      <div className="glass-card rounded-xl border border-border/50 p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Shipping & Checkout Rules</h2>
            <p className="text-xs text-muted-foreground">Standard carrier rates, free shipping incentive threshold, and payment options.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="standard_shipping_fee" className="text-xs font-semibold">Standard Shipping Fee (Rs.)</Label>
            <Input
              id="standard_shipping_fee"
              type="number"
              step="0.01"
              value={settings.standard_shipping_fee}
              onChange={(e) => handleChange("standard_shipping_fee", e.target.value)}
              className="max-w-[160px] font-mono"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="free_shipping_minimum" className="text-xs font-semibold">Free Shipping Threshold (Rs.)</Label>
            <Input
              id="free_shipping_minimum"
              type="number"
              step="0.01"
              value={settings.free_shipping_minimum}
              onChange={(e) => handleChange("free_shipping_minimum", e.target.value)}
              className="max-w-[160px] font-mono"
              disabled={isPending}
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="enable_cod"
              checked={settings.enable_cod === "true"}
              onChange={(e) => handleChange("enable_cod", e.target.checked ? "true" : "false")}
              className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
              disabled={isPending}
            />
            <Label htmlFor="enable_cod" className="text-xs font-medium cursor-pointer">
              Enable Cash on Delivery (COD) as a customer checkout payment option
            </Label>
          </div>
        </div>
      </div>

      {/* ── Storefront Announcement & Maintenance ────────────────────────────── */}
      <div className="glass-card rounded-xl border border-border/50 p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Storefront Announcement</h2>
            <p className="text-xs text-muted-foreground">Banner message visible at the very top of all customer-facing store pages.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="announcement_bar" className="text-xs font-semibold">Top Banner Message</Label>
            <Input
              id="announcement_bar"
              value={settings.announcement_bar}
              onChange={(e) => handleChange("announcement_bar", e.target.value)}
              placeholder="e.g. Free delivery on orders over Rs. 15,000!"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} className="gap-2 px-6">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Configuration...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Platform Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
