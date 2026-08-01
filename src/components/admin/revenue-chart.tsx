"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

export interface RevenueChartDataPoint {
  name: string;   // e.g. "Jan '25"
  revenue: number; // in cents (consistent with how prices are stored)
  orders: number;
}

interface RevenueChartProps {
  data: RevenueChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 rounded-lg p-3 shadow-xl text-xs space-y-1.5">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        Revenue:{" "}
        <span className="text-foreground font-medium">
          {formatPrice(payload[0]?.value ?? 0)}
        </span>
      </p>
      <p className="text-muted-foreground">
        Orders:{" "}
        <span className="text-foreground font-medium">
          {payload[1]?.value ?? 0}
        </span>
      </p>
    </div>
  );
};

export function RevenueChart({ data }: RevenueChartProps) {
  const hasData = data.some((d) => d.revenue > 0 || d.orders > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
        No revenue data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
          opacity={0.5}
        />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={6}
        />
        <YAxis
          yAxisId="revenue"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={60}
          tickFormatter={(v) =>
            v === 0 ? "0" : `Rs.${Math.round(v / 100000)}k`
          }
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* Revenue area */}
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
        />

        {/* Orders area */}
        <Area
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          stroke="#3b82f6"
          strokeWidth={1.5}
          fill="url(#ordersGradient)"
          dot={false}
          activeDot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
          strokeDasharray="4 2"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
