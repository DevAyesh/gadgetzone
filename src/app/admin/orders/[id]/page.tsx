import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, MapPin, CreditCard, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { OrderStatusUpdate } from "@/components/admin/order-status-update";

interface ProductImageItem {
  image_url: string;
  is_primary?: boolean;
}

interface OrderItemProduct {
  name: string;
  images?: ProductImageItem[];
}

interface OrderLineItem {
  id: string;
  quantity: number;
  price: number;
  products?: OrderItemProduct | null;
}

export default async function AdminOrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const orderId = params.id;

  const supabase = await createAdminClient();

  // Fetch order with user info, items, and address
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles(first_name, last_name, phone),
      shipping_address:addresses!orders_shipping_address_id_fkey(*),
      order_items(
        id,
        quantity,
        price,
        products(
          name,
          images:product_images(image_url, is_primary)
        )
      )
    `)
    .eq("id", orderId)
    .single();

  if (error || !order) {
    console.error("Order fetch error:", error);
    return notFound();
  }

  // Determine shipping address and customer contact details
  let shippingAddress = "No specific shipping address provided.";
  let customerPhone = order.profiles?.phone || "";
  let customerEmail = "";

  if (order.shipping_address) {
    const a = order.shipping_address as {
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
    const parts = [
      a.address_line1,
      a.address_line2,
      a.city,
      a.state,
      a.postal_code,
      a.country,
    ].filter(Boolean);
    if (parts.length > 0) {
      shippingAddress = parts.join(", ");
    }
  }

  if (order.notes) {
    const raw = order.notes;
    const emailMatch = raw.match(/Email:\s*([^\s,;]+)/i);
    if (emailMatch) customerEmail = emailMatch[1].trim();

    const phoneMatch = raw.match(/Phone:\s*([^\s,;]+)/i);
    if (phoneMatch) customerPhone = phoneMatch[1].trim();

    if (!order.shipping_address) {
      // Clean address by stripping Phone and Email portions
      let cleaned = raw.replace(/^Shipping Info:\s*/i, "");
      cleaned = cleaned.replace(/Phone:\s*([^\s,;]+)/i, "");
      cleaned = cleaned.replace(/Email:\s*([^\s,;]+)/i, "");
      cleaned = cleaned.replace(/[,\s]+$/, "").trim();
      if (cleaned) shippingAddress = cleaned;
    }
  }

  const profileName = order.profiles
    ? `${order.profiles.first_name || ""} ${order.profiles.last_name || ""}`.trim()
    : "";

  const customerName = profileName || (customerEmail ? customerEmail.split("@")[0] : "Customer");

  // Format Date (e.g. 10 Jul 2026, 02:56 PM)
  const orderDate = new Date(order.created_at).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Order <span className="text-primary font-mono">{order.order_number}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Placed on {orderDate} · Payment status: <span className="capitalize font-medium text-foreground">{order.status}</span>
          </p>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm" className="bg-muted/50 gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Button>
        </Link>
      </div>

      {/* 3-Column Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
        <div className="glass-card rounded-xl border border-border/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <User className="h-4 w-4 text-primary" />
            Customer Information
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{customerName}</p>
            {customerEmail && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Mail className="h-3 w-3" /> {customerEmail}
              </p>
            )}
            {customerPhone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3 w-3" /> {customerPhone}
              </p>
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl border border-border/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <MapPin className="h-4 w-4 text-primary" />
            Delivery Destination
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed font-medium">
            {shippingAddress}
          </p>
        </div>

        <div className="glass-card rounded-xl border border-border/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <CreditCard className="h-4 w-4 text-primary" />
            Payment Method
          </div>
          <div>
            <p className="font-semibold capitalize text-foreground text-sm">{order.payment_method || "Online Payment"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Order Ref: <span className="font-mono">{order.order_number}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden mt-6">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-sm font-semibold">Ordered Line Items</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 border-b border-border/50">
            <tr className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3 px-5">Product</th>
              <th className="py-3 px-5">Qty</th>
              <th className="py-3 px-5">Unit Price</th>
              <th className="py-3 px-5 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {order.order_items?.map((item: OrderLineItem) => {
              const product = item.products;
              const primaryImage =
                product?.images?.find((img: ProductImageItem) => img.is_primary)?.image_url ||
                product?.images?.[0]?.image_url ||
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&q=80";

              return (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-5 flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded bg-muted overflow-hidden shrink-0">
                      <Image
                        src={primaryImage}
                        alt={product?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium text-sm">{product?.name || "Product Item"}</span>
                  </td>
                  <td className="py-3 px-5 text-muted-foreground font-mono text-sm">{item.quantity}</td>
                  <td className="py-3 px-5 text-muted-foreground text-sm">{formatPrice(item.price)}</td>
                  <td className="py-3 px-5 font-semibold text-right text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Section: Total and Status Update */}
      <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Invoice Amount</span>
          <h2 className="text-2xl font-bold text-primary mt-0.5">
            {formatPrice(order.total_amount)}
          </h2>
        </div>

        <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
  );
}
