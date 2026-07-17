import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ShoppingCart, Activity } from "lucide-react";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch actual data
  const [
    { count: usersCount },
    { count: productsCount },
    { data: ordersData },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select(`
      id,
      order_number,
      total_amount,
      status,
      created_at,
      profiles(first_name, last_name)
    `).order("created_at", { ascending: false }),
  ]);

  const orders = ordersData || [];
  
  // Calculate Total Revenue from non-cancelled orders
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // Formatting helpers
  function formatPriceAdmin(price: number) {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price).replace('LKR', 'Rs. ');
  };

  const formatDateWithTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'processing': return 'bg-blue-500/10 text-blue-500';
      case 'shipped': return 'bg-purple-500/10 text-purple-500';
      case 'delivered': return 'bg-green-500/10 text-green-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPriceAdmin(totalRevenue / 100)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">Placed all time</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Products in catalog</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Notifications Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-4 glass-card border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 flex-1 min-h-[300px]">
            <RevenueChart />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3 glass-card border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Orders Notifications</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
            <div className="space-y-6">
              {orders.length > 0 ? (
                orders.slice(0, 10).map((order) => {
                  // @ts-ignore
                  const customerName = order.profiles 
                    // @ts-ignore
                    ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || 'Unknown Customer'
                    : 'Guest User';

                  return (
                    <div key={order.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {customerName} <span className="text-muted-foreground font-normal">placed</span> {order.order_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateWithTime(order.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-medium">{formatPriceAdmin(order.total_amount / 100)}</div>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-transparent ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm space-y-2 py-8">
                  <ShoppingCart className="h-8 w-8 opacity-20" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
