import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { VetNavigation } from "@/components/VetNavigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ClientProvider } from "@/contexts/ClientContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute, PermissionRoute } from "@/components/AdminRoute";
import { PlanFeatureRoute } from "@/components/PlanFeatureRoute";
import { SuperAdminRoute } from "@/components/SuperAdminRoute";
import SuperAdminLayout from "@/pages/super-admin/SuperAdminLayout";
import SuperAdminOverview from "@/pages/super-admin/Overview";
import SuperAdminOrganizations from "@/pages/super-admin/Organizations";
import SuperAdminOrgDetail from "@/pages/super-admin/OrgDetail";
import SuperAdminUsers from "@/pages/super-admin/Users";
import SuperAdminPlans from "@/pages/super-admin/Plans";
import SuperAdminBilling from "@/pages/super-admin/Billing";
import SuperAdminAudit from "@/pages/super-admin/Audit";
import SuperAdminSystem from "@/pages/super-admin/System";
import { AuthRedirect } from "@/components/AuthRedirect";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Pets from "./pages/Pets";
import Appointments from "./pages/Appointments";
import Visits from "./pages/Visits";
import VisitWorkspace from "./pages/VisitWorkspace";
import Consultations from "./pages/Consultations";
import History from "./pages/History";
import Farm from "./pages/Farm";
import Vaccinations from "./pages/Vaccinations";
import Antiparasites from "./pages/Antiparasites";
import Stock from "./pages/Stock";
import AccountingNew from "./pages/AccountingNew";
import StockManagement from "./pages/StockManagement";
import TeamManagement from "./pages/TeamManagement";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import AuthSettings from "./pages/AuthSettings";
import { ResetPassword } from "./pages/ResetPassword";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "@/lib/queryClient";

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ClientProvider>
            <SettingsProvider>
              <ThemeProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-background w-full text-foreground overflow-x-hidden app-shell">
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route
                        path="/login"
                        element={
                          <AuthRedirect>
                            <LoginForm />
                          </AuthRedirect>
                        }
                      />
                      <Route path="/register" element={<Register />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <VetNavigation />
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/clients"
                        element={
                          <PermissionRoute permission="can_manage_clients">
                            <VetNavigation />
                            <Clients />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/pets"
                        element={
                          <PermissionRoute permission="can_manage_animals">
                            <VetNavigation />
                            <Pets />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/appointments"
                        element={
                          <PermissionRoute permission="can_manage_appointments">
                            <VetNavigation />
                            <Appointments />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/visites"
                        element={
                          <PermissionRoute permission="can_manage_visits">
                            <VetNavigation />
                            <Visits />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/visites/:id"
                        element={
                          <PermissionRoute permission="can_manage_visits">
                            <VetNavigation />
                            <VisitWorkspace />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/consultations"
                        element={
                          <PermissionRoute permission="can_create_consultations">
                            <VetNavigation />
                            <Consultations />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/history"
                        element={
                          <PermissionRoute permission="can_view_history">
                            <VetNavigation />
                            <History />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/farm"
                        element={
                          <PermissionRoute permission="can_manage_farms">
                            <VetNavigation />
                            <PlanFeatureRoute feature="farm"><Farm /></PlanFeatureRoute>
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/vaccinations"
                        element={
                          <PermissionRoute permission="can_manage_vaccinations">
                            <VetNavigation />
                            <Vaccinations />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/antiparasites"
                        element={
                          <PermissionRoute permission="can_manage_antiparasites">
                            <VetNavigation />
                            <Antiparasites />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/accounting"
                        element={
                          <PermissionRoute permission="can_manage_accounting">
                            <VetNavigation />
                            <PlanFeatureRoute feature="accounting"><AccountingNew /></PlanFeatureRoute>
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/farms"
                        element={
                          <PermissionRoute permission="can_manage_farms">
                            <VetNavigation />
                            <PlanFeatureRoute feature="farm"><Farm /></PlanFeatureRoute>
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/stock"
                        element={
                          <PermissionRoute permission="can_manage_stock">
                            <VetNavigation />
                            <PlanFeatureRoute feature="stock"><Stock /></PlanFeatureRoute>
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/admin/team"
                        element={
                          <AdminRoute>
                            <VetNavigation />
                            <TeamManagement />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <PermissionRoute permission="can_manage_settings">
                            <VetNavigation />
                            <Settings />
                          </PermissionRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <VetNavigation />
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auth-settings"
                        element={
                          <ProtectedRoute>
                            <VetNavigation />
                            <AuthSettings />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/super-admin"
                        element={
                          <SuperAdminRoute>
                            <VetNavigation />
                            <SuperAdminLayout />
                          </SuperAdminRoute>
                        }
                      >
                        <Route index element={<SuperAdminOverview />} />
                        <Route path="organizations" element={<SuperAdminOrganizations />} />
                        <Route path="organizations/:orgId" element={<SuperAdminOrgDetail />} />
                        <Route path="users" element={<SuperAdminUsers />} />
                        <Route path="plans" element={<SuperAdminPlans />} />
                        <Route path="billing" element={<SuperAdminBilling />} />
                        <Route path="audit" element={<SuperAdminAudit />} />
                        <Route path="system" element={<SuperAdminSystem />} />
                      </Route>
                      <Route path="/reset-password" element={<ResetPassword />} />

                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <MobileBottomNav />
                  </div>
                </BrowserRouter>
              </ThemeProvider>
            </SettingsProvider>
          </ClientProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;