"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { PieLabelRenderProps } from "recharts";

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

interface ChartTooltipPayload {
  name: string;
  value: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<ChartTooltipPayload>;
}

function renderCustomizedLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelRenderProps) {
  const p = Number(percent) || 0;
  if (p < 0.05) return null; // hide very small slices
  const rInner = Number(innerRadius) || 0;
  const rOuter = Number(outerRadius) || 0;
  const radius = rInner + (rOuter - rInner) * 0.5;
  const angle = Number(midAngle) || 0;
  const x = Number(cx) + radius * Math.cos(-angle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-angle * RADIAN);

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

const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
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
