import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Users,
  Heart,
  Calendar,
  FileText,
  BarChart3,
  Tractor,
  Home,
  Syringe,
  Bug,
  Package,
  Cog,
  Calculator,
  Menu,
  X,
  Shield,
  Building2,
  Euro
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";

// Navigation principale (accessible to all authenticated users - admins and assistants)
const primaryNavItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard", permission: null },
  { icon: Users, label: "Clients", path: "/clients", permission: null },
  { icon: Heart, label: "Animaux", path: "/pets", permission: null },
  { icon: Calendar, label: "RDV", path: "/appointments", permission: null },
  { icon: FileText, label: "Consultations", path: "/consultations", permission: null },
  { icon: Syringe, label: "Vaccinations", path: "/vaccinations", permission: null },
  { icon: Bug, label: "Antiparasites", path: "/antiparasites", permission: null },
  { icon: BarChart3, label: "Historiques", path: "/history", permission: null }
];

// Navigation secondaire (restricted items - farms, stock, accounting = admin only)
const secondaryNavItems = [
  { icon: Building2, label: "Fermes", path: "/farms", permission: null, planFeature: "farm" as const },
  { icon: Package, label: "Stock", path: "/stock", permission: null, planFeature: "stock" as const },
  { icon: Euro, label: "Comptabilité", path: "/accounting", permission: null, adminOnly: true, planFeature: "accounting" as const },
  { icon: Users, label: "Équipe", path: "/admin/team", permission: null, adminOnly: true },
  { icon: Shield, label: "Super Admin", path: "/super-admin", permission: null, superAdminOnly: true },
  { icon: Cog, label: "Paramètres", path: "/settings", permission: null }
];

// Function to check if user has permission for a nav item
const hasPermission = (user: any, item: any) => {
  const isSuper = (user?.profile?.role as string) === 'super_admin';
  // Super-admin-only items
  if (item.superAdminOnly) return isSuper;
  // Super admin sees everything else too
  if (isSuper) return true;
  // Admin has access to everything (except super-admin-only handled above)
  if (user?.profile?.role === 'admin') return true;
  // Admin-only items - only admins can access
  if (item.adminOnly && user?.profile?.role !== 'admin') return false;
  // Items without permission requirements
  if (!item.permission) return true;
  if (!user?.profile?.permissions) return false;
  return user?.profile?.permissions[item.permission] === true;
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

  // Debug logging for permissions
  console.log('🔍 Navigation Debug - Full User Object:', user);
  console.log('🔍 Navigation Debug - Profile:', user?.profile);
  console.log('🔍 Navigation Debug:', {
    role: user?.profile?.role,
    permissions: user?.profile?.permissions,
    hasPermissionsObject: !!user?.profile?.permissions,
    userExists: !!user,
    profileExists: !!user?.profile
  });
  
  console.log('📋 Primary Nav Items to check:', primaryNavItems.map(i => i.label));
  console.log('📋 Secondary Nav Items to check:', secondaryNavItems.map(i => i.label));

  // Filter navigation items based on user permissions
  const filteredPrimaryNavItems = primaryNavItems.filter(item => {
    const allowed = hasPermission(user, item);
    console.log(`  PRIMARY - ${item.label}: ${allowed ? '✅' : '❌'} (permission: ${item.permission || 'none'}, returns: ${allowed})`);
    if (allowed) {
      console.log(`    ✓ Adding to filtered list: ${item.label}`);
    }
    return allowed;
  });
  
  console.log('✅ Filtered Primary Items:', filteredPrimaryNavItems.map(i => i.label));
  
  const filteredSecondaryNavItems = secondaryNavItems.filter(item => {
    const allowed = hasPermission(user, item) && planAllows((item as any).planFeature);
    console.log(`  SECONDARY - ${item.label}: ${allowed ? '✅' : '❌'} (permission: ${item.permission || 'none'}, adminOnly: ${item.adminOnly || false}, planFeature: ${(item as any).planFeature || 'none'})`);
    return allowed;
  });
  
  console.log('✅ Filtered Secondary Items:', filteredSecondaryNavItems.map(i => i.label));
  
  const allNavItems = [...filteredPrimaryNavItems, ...filteredSecondaryNavItems];
  
  console.log(`📊 Filtered Navigation: ${filteredPrimaryNavItems.length} primary, ${filteredSecondaryNavItems.length} secondary, ${allNavItems.length} total`);

  return (
    <nav className="bg-card border-b shadow-card">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo et Toggle Thème */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center gap-1 sm:gap-2">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold gradient-primary bg-clip-text text-transparent hidden sm:block">
                VetoCrm.com
              </h1>
              <h1 className="text-base sm:text-lg font-bold gradient-primary bg-clip-text text-transparent sm:hidden">
                VetoCrm.com
              </h1>
            </Link>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation principale - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {filteredPrimaryNavItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                size="sm"
                className="gap-1 px-3 transition-all hover:medical-glow"
                asChild
              >
                <Link to={item.path}>
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              </Button>
            ))}
            
            {/* Menu déroulant pour les éléments secondaires */}
            {filteredSecondaryNavItems.length > 0 && (
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 px-3 transition-all hover:medical-glow"
                >
                  <Menu className="h-4 w-4" />
                  <span className="hidden xl:inline">Plus</span>
                </Button>
                
                {/* Menu déroulant */}
                <div className="absolute right-0 top-full mt-1 w-40 bg-card border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    {filteredSecondaryNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted ${
                          location.pathname === item.path ? 'bg-primary text-primary-foreground' : ''
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Bouton de déconnexion - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <LogoutButton />
          </div>

          {/* Menu mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
            <LogoutButton />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="gap-1 p-2"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 pt-2 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {allNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 justify-start text-xs sm:text-sm"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to={item.path}>
                    <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
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