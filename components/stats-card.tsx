import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  iconColor?: string;
  iconBgColor?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Reusable stats card component for displaying metrics
 */
export function StatsCard({
  icon: Icon,
  value,
  label,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  onClick,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        onClick && "cursor-pointer min-h-[52px]",
        className
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              iconBgColor
            )}
          >
            <Icon className={cn("size-5", iconColor)} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Grid container for stats cards
 */
export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}
