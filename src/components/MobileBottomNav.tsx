import { Link, useLocation } from "react-router-dom";
import { Home, Users, Heart, Calendar, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FileText,
  Syringe,
  Bug,
  BarChart3,
  Building2,
  Package,
  Euro,
  Cog,
  Users as UsersIcon,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { cn } from "@/lib/utils";
import { type PermissionKey, userHasPermission } from "@/lib/permissions";
import { useTranslation } from "react-i18next";

const mainTabs: {
  icon: typeof Home;
  labelKey: string;
  path: string;
  permission?: PermissionKey | null;
  planFeature?: "clients" | "animals" | "appointments";
}[] = [
  { icon: Home, labelKey: "home", path: "/dashboard", permission: null },
  { icon: Users, labelKey: "clients", path: "/clients", permission: "can_manage_clients", planFeature: "clients" },
  { icon: Calendar, labelKey: "appointmentsShort", path: "/appointments", permission: "can_manage_appointments", planFeature: "appointments" },
  { icon: Heart, labelKey: "pets", path: "/pets", permission: "can_manage_animals", planFeature: "animals" },
];

const moreItems: {
  icon: typeof Home;
  labelKey: string;
  path: string;
  permission?: PermissionKey | null;
  planFeature?:
    | "farm"
    | "accounting"
    | "stock"
    | "visits"
    | "consultations"
    | "vaccinations"
    | "antiparasites"
    | "clients"
    | "animals"
    | "appointments";
  adminOnly?: boolean;
}[] = [
  { icon: ClipboardList, labelKey: "visits", path: "/visites", permission: "can_manage_visits", planFeature: "visits" },
  { icon: FileText, labelKey: "consultations", path: "/consultations", permission: "can_create_consultations", planFeature: "consultations" },
  { icon: Syringe, labelKey: "vaccinations", path: "/vaccinations", permission: "can_manage_vaccinations", planFeature: "vaccinations" },
  { icon: Bug, labelKey: "antiparasites", path: "/antiparasites", permission: "can_manage_antiparasites", planFeature: "antiparasites" },
  { icon: BarChart3, labelKey: "history", path: "/history", permission: "can_view_history" },
  { icon: Building2, labelKey: "farms", path: "/farms", planFeature: "farm", permission: "can_manage_farms" },
  { icon: Package, labelKey: "stock", path: "/stock", planFeature: "stock", permission: "can_manage_stock" },
  {
    icon: Euro,
    labelKey: "accounting",
    path: "/accounting",
    planFeature: "accounting",
    permission: "can_manage_accounting",
  },
  { icon: UsersIcon, labelKey: "team", path: "/admin/team", adminOnly: true },
  { icon: Cog, labelKey: "settings", path: "/settings", permission: "can_manage_settings" },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const plan = usePlanLimits();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("nav");
  const isAdmin =
    user?.profile?.role === "admin" || user?.profile?.role === "super_admin";

  const planAllows = (f?: string) => {
    if (!f) return true;
    const map: Record<string, boolean> = {
      farm: plan.hasFarmManagement,
      accounting: plan.hasAccounting,
      stock: plan.hasStock,
      consultations: plan.hasConsultations,
      visits: plan.hasVisits,
      appointments: plan.hasAppointments,
      vaccinations: plan.hasVaccinations,
      antiparasites: plan.hasAntiparasites,
      clients: plan.hasClients,
      animals: plan.hasAnimals,
    };
    return map[f] !== false;
  };

  const itemAllowed = (i: (typeof moreItems)[number] | (typeof mainTabs)[number]) => {
    if ("adminOnly" in i && i.adminOnly) return isAdmin;
    return userHasPermission(user, i.permission ?? null);
  };

  const visibleMain = mainTabs.filter(
    (i) => itemAllowed(i) && planAllows((i as any).planFeature),
  );
  const visibleMore = moreItems.filter((i) => itemAllowed(i) && planAllows(i.planFeature));

  if (!user) return null;

  // Hide on marketing / auth surfaces so bottom nav doesn't overlay landing/login
  const marketingPaths = [
    "/",
    "/login",
    "/register",
    "/pricing",
    "/reset-password",
    "/privacy",
    "/terms",
    "/legal",
    "/cookies",
    "/refund",
    "/contact",
    "/monde-veto",
  ];
  const isMarketing =
    marketingPaths.includes(pathname) ||
    pathname.startsWith("/import/") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/monde-veto");
  if (isMarketing) return null;

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 app-bottom-nav"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label={t("mainNavigation")}
      >
        <div
          className="grid h-16"
          style={{
            gridTemplateColumns: `repeat(${Math.min(visibleMain.length, 4) + 1}, minmax(0, 1fr))`,
          }}
        >
          {visibleMain.slice(0, 4).map((tab) => {
            const active = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs transition-colors font-display",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className={cn("h-5 w-5", active && "scale-110")} />
                <span className="text-[10px] font-semibold tracking-tight">{t(tab.labelKey)}</span>
              </Link>
            );
          })}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs transition-colors font-display",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-semibold tracking-tight">{t("more")}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto border-t border-border">
              <SheetHeader>
                <SheetTitle className="font-display">{t("allSections")}</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-3 mt-4 pb-6">
                {visibleMore.map((item) => {
                  const active = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 hover:bg-muted border-transparent"
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="text-xs font-semibold text-center leading-tight font-display">
                        {t(item.labelKey)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      <div className="lg:hidden h-16" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </>
  );
}
