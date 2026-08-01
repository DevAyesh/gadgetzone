import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  /** Percentage change vs previous period. Positive = growth, negative = decline. */
  trend?: number;
  trendLabel?: string;
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
  className,
  iconClassName,
}: StatCardProps) {
  const hasTrend = trend !== undefined && trend !== null;
  const isPositive = (trend ?? 0) > 0;
  const isNeutral = trend === 0;

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral
    ? "text-muted-foreground"
    : isPositive
    ? "text-emerald-500 dark:text-emerald-400"
    : "text-red-500 dark:text-red-400";

  return (
    <div
      className={cn(
        "glass-card rounded-xl border border-border/50 p-5 flex flex-col gap-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div
          className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center bg-primary/8 dark:bg-primary/10",
            iconClassName
          )}
        >
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold tracking-tight">{value}</div>

        <div className="flex items-center gap-2">
          {hasTrend && (
            <div className={cn("flex items-center gap-0.5 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend!).toFixed(1)}%</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {hasTrend && trendLabel && (
            <p className="text-xs text-muted-foreground">{trendLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
