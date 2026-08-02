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
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { cn } from "@/lib/utils";
import { type PermissionKey, userHasPermission } from "@/lib/permissions";
import { useTranslation } from "react-i18next";

const primaryNavItems: {
  icon: typeof Home;
  labelKey: string;
  path: string;
  permission: PermissionKey | null;
}[] = [
  { icon: Home, labelKey: "dashboard", path: "/dashboard", permission: null },
  { icon: Users, labelKey: "clients", path: "/clients", permission: "can_manage_clients" },
  { icon: Heart, labelKey: "pets", path: "/pets", permission: "can_manage_animals" },
  { icon: Calendar, labelKey: "appointmentsShort", path: "/appointments", permission: "can_manage_appointments" },
  { icon: ClipboardList, labelKey: "visits", path: "/visites", permission: "can_manage_visits" },
  { icon: FileText, labelKey: "consultations", path: "/consultations", permission: "can_create_consultations" },
  { icon: Syringe, labelKey: "vaccinations", path: "/vaccinations", permission: "can_manage_vaccinations" },
  { icon: Bug, labelKey: "antiparasites", path: "/antiparasites", permission: "can_manage_antiparasites" },
  { icon: BarChart3, labelKey: "history", path: "/history", permission: "can_view_history" },
];

const secondaryNavItems: {
  icon: typeof Home;
  labelKey: string;
  path: string;
  permission: PermissionKey | null;
  planFeature?: "farm" | "stock" | "accounting";
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}[] = [
  { icon: Building2, labelKey: "farms", path: "/farms", permission: "can_manage_farms", planFeature: "farm" },
  { icon: Package, labelKey: "stock", path: "/stock", permission: "can_manage_stock", planFeature: "stock" },
  {
    icon: Euro,
    labelKey: "accounting",
    path: "/accounting",
    permission: "can_manage_accounting",
    planFeature: "accounting",
  },
  { icon: Users, labelKey: "team", path: "/admin/team", permission: null, adminOnly: true },
  { icon: Shield, labelKey: "superAdmin", path: "/super-admin", permission: null, superAdminOnly: true },
  { icon: Cog, labelKey: "settings", path: "/settings", permission: "can_manage_settings" },
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
  const { t } = useTranslation("nav");

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
    <nav className="app-nav" aria-label={t("mainNavigation")}>
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
            <div className="hidden sm:flex items-center gap-1.5">
              <ThemeToggle />
              <LanguageSwitcher variant="compact" />
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
                    <span className="hidden xl:inline">{t(item.labelKey)}</span>
                  </Link>
                </Button>
              );
            })}

            {filteredSecondaryNavItems.length > 0 && (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="app-nav-link gap-1.5 px-2.5">
                  <Menu className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{t("more")}</span>
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
                          {t(item.labelKey)}
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
            <div className="sm:hidden flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher variant="compact" />
            </div>
            <LogoutButton />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full"
              aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
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
                    <span className="truncate">{t(item.labelKey)}</span>
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
