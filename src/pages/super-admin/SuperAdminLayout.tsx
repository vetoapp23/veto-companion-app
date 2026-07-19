import { NavLink, Outlet } from "react-router-dom";
import { AppPageHeader } from "@/components/AppPageHeader";
import {
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  Package,
  CreditCard,
  ScrollText,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/super-admin", end: true, label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/super-admin/organizations", label: "Cliniques", icon: Building2 },
  { to: "/super-admin/users", label: "Utilisateurs", icon: Users },
  { to: "/super-admin/plans", label: "Plans", icon: Package },
  { to: "/super-admin/billing", label: "Billing", icon: CreditCard },
  { to: "/super-admin/audit", label: "Audit", icon: ScrollText },
  { to: "/super-admin/system", label: "Système", icon: Settings2 },
];

export default function SuperAdminLayout() {
  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 max-w-7xl">
      <AppPageHeader
        icon={Shield}
        eyebrow="Plateforme"
        title="Console Super Admin"
        description="Pilotage multi-tenant : cliniques, abonnements, support, audit et santé système."
      />

      <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm font-display font-medium transition-colors border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card/80 text-muted-foreground border-border hover:text-foreground hover:bg-muted/60"
              )
            }
          >
            <l.icon className="h-3.5 w-3.5" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
