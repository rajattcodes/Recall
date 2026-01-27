import { CanonicalPattern, CustomPattern } from "@/lib/types/api";
import { Badge } from "@/components/ui/badge";
import { Layers, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatternBadgeProps {
  canonicalPattern: CanonicalPattern;
  customPattern?: CustomPattern | null;
  size?: "sm" | "default";
}

export function PatternBadge({
  canonicalPattern,
  customPattern,
  size = "default",
}: PatternBadgeProps) {
  const iconSize = size === "sm" ? "size-3" : "size-3.5";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant="outline"
        className={cn(
          "font-medium",
          size === "sm" && "text-xs px-1.5 py-0"
        )}
      >
        <Layers className={cn(iconSize, "mr-1")} />
        {canonicalPattern.name}
      </Badge>
      {customPattern && (
        <Badge
          variant="secondary"
          className={cn(
            "font-medium bg-primary/10 text-primary border-primary/20",
            size === "sm" && "text-xs px-1.5 py-0"
          )}
        >
          <Tag className={cn(iconSize, "mr-1")} />
          {customPattern.name}
        </Badge>
      )}
    </div>
  );
}
