import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: "default" | "signal" | "warning" | "insight";
}

const variantStyles = {
  default: "border-border",
  signal: "border-primary/30",
  warning: "border-warning/30",
  insight: "border-accent/30",
};

const iconContainerStyles = {
  default: "bg-muted text-muted-foreground",
  signal: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  insight: "bg-accent/10 text-accent",
};

export function MetricCard({ title, value, subtitle, icon, variant = "default" }: MetricCardProps) {
  return (
    <div className={`rounded-lg border bg-card p-6 ${variantStyles[variant]} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-heading">{title}</p>
          <p className="text-3xl font-heading font-semibold mt-2 text-foreground">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${iconContainerStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
