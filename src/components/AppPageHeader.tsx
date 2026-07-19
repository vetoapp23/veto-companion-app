import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}

export function AppPageHeader({
  eyebrow = "Espace clinique",
  title,
  description,
  icon: Icon,
  actions,
  className,
}: AppPageHeaderProps) {
  return (
    <div className={cn("app-page-header", className)}>
      <div className="min-w-0">
        <div className="app-page-eyebrow">
          {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
          <span>{eyebrow}</span>
        </div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="app-page-actions">{actions}</div> : null}
    </div>
  );
}
