import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Users,
  Heart,
  Calendar,
  FileText,
  BarChart3,
  Package,
  Cog,
  Menu,
  X,
  Shield,
  Building2,
  Euro,
  Home,
  Syringe,
  Bug,
  ClipboardList,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { cn } from "@/lib/utils";
import { type PermissionKey, userHasPermission } from "@/lib/permissions";

const primaryNavItems: {
  icon: typeof Home;
  label: string;
  path: string;
  permission: PermissionKey | null;
}[] = [
  { icon: Home, label: "Dashboard", path: "/dashboard", permission: null },
  { icon: Users, label: "Clients", path: "/clients", permission: "can_manage_clients" },
  { icon: Heart, label: "Animaux", path: "/pets", permission: "can_manage_animals" },
  { icon: Calendar, label: "RDV", path: "/appointments", permission: "can_manage_appointments" },
  { icon: ClipboardList, label: "Visites", path: "/visites", permission: "can_manage_visits" },
  { icon: FileText, label: "Consultations", path: "/consultations", permission: "can_create_consultations" },
  { icon: Syringe, label: "Vaccinations", path: "/vaccinations", permission: "can_manage_vaccinations" },
  { icon: Bug, label: "Antiparasites", path: "/antiparasites", permission: "can_manage_antiparasites" },
  { icon: BarChart3, label: "Historiques", path: "/history", permission: "can_view_history" },
];

const secondaryNavItems: {
  icon: typeof Home;
  label: string;
  path: string;
  permission: PermissionKey | null;
  planFeature?: "farm" | "stock" | "accounting";
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}[] = [
  { icon: Building2, label: "Fermes", path: "/farms", permission: "can_manage_farms", planFeature: "farm" },
  { icon: Package, label: "Stock", path: "/stock", permission: "can_manage_stock", planFeature: "stock" },
  {
    icon: Euro,
    label: "Comptabilité",
    path: "/accounting",
    permission: "can_manage_accounting",
    planFeature: "accounting",
  },
  { icon: Users, label: "Équipe", path: "/admin/team", permission: null, adminOnly: true },
  { icon: Shield, label: "Super Admin", path: "/super-admin", permission: null, superAdminOnly: true },
  { icon: Cog, label: "Paramètres", path: "/settings", permission: "can_manage_settings" },
];

const navItemAllowed = (user: any, item: any) => {
  const isSuper = (user?.profile?.role as string) === "super_admin";
  if (item.superAdminOnly) return isSuper;
  if (isSuper) return true;
  if (item.adminOnly) {
    return user?.profile?.role === "admin" || isSuper;
  }
  return userHasPermission(user, item.permission);
};

export function VetNavigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { hasFarmManagement, hasAccounting, hasStock } = usePlanLimits();

  const planAllows = (feature?: "farm" | "accounting" | "stock") => {
    if (!feature) return true;
    if (feature === "farm") return hasFarmManagement;
    if (feature === "accounting") return hasAccounting;
    if (feature === "stock") return hasStock;
    return true;
  };

  const filteredPrimaryNavItems = primaryNavItems.filter((item) => navItemAllowed(user, item));
  const filteredSecondaryNavItems = secondaryNavItems.filter(
    (item) => navItemAllowed(user, item) && planAllows(item.planFeature)
  );
  const allNavItems = [...filteredPrimaryNavItems, ...filteredSecondaryNavItems];

  return (
    <nav className="app-nav">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/dashboard" className="app-brand flex items-center gap-2">
              <img
                src="/favicon.svg"
                alt=""
                className="h-8 w-8 rounded-lg"
                width={32}
                height={32}
              />
              <span className="hidden sm:inline">
                Veto<span>Crm</span>
              </span>
              <span className="sm:hidden">
                Veto<span>Crm</span>
              </span>
            </Link>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-0.5">
            {filteredPrimaryNavItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "app-nav-link gap-1.5 px-2.5 xl:px-3",
                    active && "shadow-sm"
                  )}
                  asChild
                >
                  <Link to={item.path}>
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}

            {filteredSecondaryNavItems.length > 0 && (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="app-nav-link gap-1.5 px-2.5">
                  <Menu className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">Plus</span>
                </Button>
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border bg-card/95 backdrop-blur-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                  <div className="py-1.5">
                    {filteredSecondaryNavItems.map((item) => {
                      const active = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center gap-2 px-3.5 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <LogoutButton />
          </div>

          <div className="lg:hidden flex items-center gap-1.5">
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
            <LogoutButton />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 pt-2 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {allNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  className="app-nav-link gap-2 justify-start text-xs sm:text-sm"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to={item.path}>
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
