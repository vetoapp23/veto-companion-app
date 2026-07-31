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

const mainTabs: {
  icon: typeof Home;
  label: string;
  path: string;
  permission?: PermissionKey | null;
}[] = [
  { icon: Home, label: "Accueil", path: "/dashboard", permission: null },
  { icon: Users, label: "Clients", path: "/clients", permission: "can_manage_clients" },
  { icon: Calendar, label: "RDV", path: "/appointments", permission: "can_manage_appointments" },
  { icon: Heart, label: "Animaux", path: "/pets", permission: "can_manage_animals" },
];

const moreItems: {
  icon: typeof Home;
  label: string;
  path: string;
  permission?: PermissionKey | null;
  planFeature?: "farm" | "accounting" | "stock";
  adminOnly?: boolean;
}[] = [
  { icon: ClipboardList, label: "Visites", path: "/visites", permission: "can_manage_visits" },
  { icon: FileText, label: "Consultations", path: "/consultations", permission: "can_create_consultations" },
  { icon: Syringe, label: "Vaccinations", path: "/vaccinations", permission: "can_manage_vaccinations" },
  { icon: Bug, label: "Antiparasites", path: "/antiparasites", permission: "can_manage_antiparasites" },
  { icon: BarChart3, label: "Historiques", path: "/history", permission: "can_view_history" },
  { icon: Building2, label: "Fermes", path: "/farms", planFeature: "farm", permission: "can_manage_farms" },
  { icon: Package, label: "Stock", path: "/stock", planFeature: "stock", permission: "can_manage_stock" },
  {
    icon: Euro,
    label: "Comptabilité",
    path: "/accounting",
    planFeature: "accounting",
    permission: "can_manage_accounting",
  },
  { icon: UsersIcon, label: "Équipe", path: "/admin/team", adminOnly: true },
  { icon: Cog, label: "Paramètres", path: "/settings", permission: "can_manage_settings" },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { hasFarmManagement, hasAccounting, hasStock } = usePlanLimits();
  const [open, setOpen] = useState(false);
  const isAdmin =
    user?.profile?.role === "admin" || user?.profile?.role === "super_admin";

  const planAllows = (f?: "farm" | "accounting" | "stock") =>
    !f ||
    (f === "farm" && hasFarmManagement) ||
    (f === "accounting" && hasAccounting) ||
    (f === "stock" && hasStock);

  const itemAllowed = (i: (typeof moreItems)[number] | (typeof mainTabs)[number]) => {
    if ("adminOnly" in i && i.adminOnly) return isAdmin;
    return userHasPermission(user, i.permission ?? null);
  };

  const visibleMain = mainTabs.filter((i) => itemAllowed(i));
  const visibleMore = moreItems.filter((i) => itemAllowed(i) && planAllows(i.planFeature));

  if (!user) return null;

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 app-bottom-nav"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
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
                <span className="text-[10px] font-semibold tracking-tight">{tab.label}</span>
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
                <span className="text-[10px] font-semibold tracking-tight">Plus</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto border-t border-border">
              <SheetHeader>
                <SheetTitle className="font-display">Toutes les sections</SheetTitle>
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
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      {/* Spacer to avoid content overlap */}
      <div className="lg:hidden h-16" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </>
  );
}
