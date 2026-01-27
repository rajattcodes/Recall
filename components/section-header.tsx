import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable section header with icon
 */
export function SectionHeader({
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  title,
  description,
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
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
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
