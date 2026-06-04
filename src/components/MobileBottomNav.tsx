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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const mainTabs = [
  { icon: Home, label: "Accueil", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Calendar, label: "RDV", path: "/appointments" },
  { icon: Heart, label: "Animaux", path: "/pets" },
];

const moreItems = [
  { icon: FileText, label: "Consultations", path: "/consultations" },
  { icon: Syringe, label: "Vaccinations", path: "/vaccinations" },
  { icon: Bug, label: "Antiparasites", path: "/antiparasites" },
  { icon: BarChart3, label: "Historiques", path: "/history" },
  { icon: Building2, label: "Fermes", path: "/farms" },
  { icon: Package, label: "Stock", path: "/stock" },
  { icon: Euro, label: "Comptabilité", path: "/accounting", adminOnly: true },
  { icon: UsersIcon, label: "Équipe", path: "/admin/team", adminOnly: true },
  { icon: Cog, label: "Paramètres", path: "/settings" },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.profile?.role === "admin";

  const visibleMore = moreItems.filter((i) => !i.adminOnly || isAdmin);

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5 h-16">
          {mainTabs.map((tab) => {
            const active = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className={cn("h-5 w-5", active && "scale-110")} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium">Plus</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Toutes les sections</SheetTitle>
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
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 hover:bg-muted border-transparent"
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="text-xs font-medium text-center leading-tight">
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
