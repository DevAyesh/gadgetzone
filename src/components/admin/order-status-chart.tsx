"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface OrderStatusDataPoint {
  name: string;
  value: number;
  color: string;
}

interface OrderStatusChartProps {
  data: OrderStatusDataPoint[];
  total: number;
}

const RADIAN = Math.PI / 180;

function renderCustomizedLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  if (percent < 0.05) return null; // hide very small slices
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-card border border-border/50 rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold capitalize">{name}</p>
        <p className="text-muted-foreground">{value} orders</p>
      </div>
    );
  }
  return null;
};

export function OrderStatusChart({ data, total }: OrderStatusChartProps) {
  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No order data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs capitalize text-foreground">{value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
