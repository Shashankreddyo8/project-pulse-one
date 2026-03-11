import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: "default" | "signal" | "warning" | "insight";
  href?: string;
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

export function MetricCard({ title, value, subtitle, icon, variant = "default", href }: MetricCardProps) {
  const content = (
    <div className={`rounded-xl border bg-card p-6 ${variantStyles[variant]} transition-all duration-200 animate-fade-in ${href ? 'hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 cursor-pointer' : ''}`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-heading font-medium">{title}</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconContainerStyles[variant]}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-[32px] font-heading font-bold text-foreground leading-none">{value}</p>
        </div>
        {subtitle && <p className="text-[12px] text-muted-foreground mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  if (href) {
    return <Link to={href} className="block">{content}</Link>;
  }

  return content;
}
