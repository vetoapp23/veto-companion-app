import { Suspense, lazy, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AnalyticsGate, CookieConsentBanner } from "@/components/CookieConsent";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ClientProvider } from "@/contexts/ClientContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute, PermissionRoute } from "@/components/AdminRoute";
import { PlanFeatureRoute } from "@/components/PlanFeatureRoute";
import { SuperAdminRoute } from "@/components/SuperAdminRoute";
import { AuthRedirect } from "@/components/AuthRedirect";
import { PendingCheckoutRedirect } from "@/components/PendingCheckoutRedirect";
import { HashAuthRedirect } from "@/components/HashAuthRedirect";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { DemoTourProvider, DemoTourBootstrap } from "@/contexts/DemoTourContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "@/lib/queryClient";

// Marketing home stays eager for fastest first paint
import Landing from "./pages/Landing";

const LoginForm = lazy(() =>
  import("@/components/LoginForm").then((m) => ({ default: m.LoginForm })),
);
const VetNavigation = lazy(() =>
  import("@/components/VetNavigation").then((m) => ({ default: m.VetNavigation })),
);
const MobileBottomNav = lazy(() =>
  import("@/components/MobileBottomNav").then((m) => ({ default: m.MobileBottomNav })),
);
const DemoTourOverlay = lazy(() =>
  import("@/components/demo/DemoTourOverlay").then((m) => ({ default: m.DemoTourOverlay })),
);

const Register = lazy(() => import("./pages/Register"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const LegalPage = lazy(() =>
  import("./pages/LegalPage").then((m) => ({ default: m.LegalPage })),
);
const ContactPage = lazy(() => import("./pages/ContactPage"));
const MondeVetoPage = lazy(() => import("./pages/MondeVetoPage"));
const MondeVetoArticlePage = lazy(() => import("./pages/MondeVetoArticlePage"));
const PressPage = lazy(() => import("./pages/PressPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const Pets = lazy(() => import("./pages/Pets"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Visits = lazy(() => import("./pages/Visits"));
const VisitWorkspace = lazy(() => import("./pages/VisitWorkspace"));
const Consultations = lazy(() => import("./pages/Consultations"));
const History = lazy(() => import("./pages/History"));
const Farm = lazy(() => import("./pages/Farm"));
const Vaccinations = lazy(() => import("./pages/Vaccinations"));
const Antiparasites = lazy(() => import("./pages/Antiparasites"));
const Stock = lazy(() => import("./pages/Stock"));
const AccountingNew = lazy(() => import("./pages/AccountingNew"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));
const BillingSettings = lazy(() => import("./pages/BillingSettings"));
const Profile = lazy(() => import("./pages/Profile"));
const AuthSettings = lazy(() => import("./pages/AuthSettings"));
const ResetPassword = lazy(() =>
  import("./pages/ResetPassword").then((m) => ({ default: m.ResetPassword })),
);
const ImportMedicalDossier = lazy(() => import("./pages/ImportMedicalDossier"));

const SuperAdminLayout = lazy(() => import("./pages/super-admin/SuperAdminLayout"));
const SuperAdminOverview = lazy(() => import("./pages/super-admin/Overview"));
const SuperAdminOrganizations = lazy(() => import("./pages/super-admin/Organizations"));
const SuperAdminOrgDetail = lazy(() => import("./pages/super-admin/OrgDetail"));
const SuperAdminUsers = lazy(() => import("./pages/super-admin/Users"));
const SuperAdminPlans = lazy(() => import("./pages/super-admin/Plans"));
const SuperAdminBilling = lazy(() => import("./pages/super-admin/Billing"));
const SuperAdminAudit = lazy(() => import("./pages/super-admin/Audit"));
const SuperAdminSystem = lazy(() => import("./pages/super-admin/System"));

function RouteFallback() {
  return (
    <div
      className="min-h-[40vh] flex items-center justify-center"
      style={{ color: "#0f766e" }}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="text-sm font-medium tracking-wide">VetoCrm…</span>
    </div>
  );
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnalyticsGate>
          <Analytics />
        </AnalyticsGate>
        <AuthProvider>
          <ClientProvider>
            <SettingsProvider>
              <ThemeProvider>
                <BrowserRouter>
                  <DemoTourProvider>
                  <HashAuthRedirect />
                  <PendingCheckoutRedirect />
                  <CookieConsentBanner />
                  <div className="min-h-screen bg-background w-full text-foreground overflow-x-hidden app-shell">
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route
                        path="/login"
                        element={
                          <LazyRoute>
                            <AuthRedirect>
                              <LoginForm />
                            </AuthRedirect>
                          </LazyRoute>
                        }
                      />
                      <Route path="/register" element={<LazyRoute><Register /></LazyRoute>} />
                      <Route path="/auth/callback" element={<LazyRoute><AuthCallback /></LazyRoute>} />
                      <Route path="/onboarding" element={<LazyRoute><Onboarding /></LazyRoute>} />
                      <Route path="/pricing" element={<LazyRoute><Pricing /></LazyRoute>} />
                      <Route path="/privacy" element={<LazyRoute><LegalPage docId="privacy" /></LazyRoute>} />
                      <Route path="/terms" element={<LazyRoute><LegalPage docId="terms" /></LazyRoute>} />
                      <Route path="/legal" element={<LazyRoute><LegalPage docId="legal" /></LazyRoute>} />
                      <Route path="/cookies" element={<LazyRoute><LegalPage docId="cookies" /></LazyRoute>} />
                      <Route path="/refund" element={<LazyRoute><LegalPage docId="refund" /></LazyRoute>} />
                      <Route path="/contact" element={<LazyRoute><ContactPage /></LazyRoute>} />
                      <Route path="/press" element={<LazyRoute><PressPage /></LazyRoute>} />
                      <Route path="/monde-veto" element={<LazyRoute><MondeVetoPage /></LazyRoute>} />
                      <Route path="/monde-veto/:slug" element={<LazyRoute><MondeVetoArticlePage /></LazyRoute>} />
                      <Route path="/import/dossier" element={<LazyRoute><ImportMedicalDossier /></LazyRoute>} />
                      <Route path="/import/dossier/:token" element={<LazyRoute><ImportMedicalDossier /></LazyRoute>} />
                      <Route
                        path="/dashboard"
                        element={
                          <LazyRoute>
                            <ProtectedRoute>
                              <VetNavigation />
                              <Dashboard />
                            </ProtectedRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/clients"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_clients">
                              <VetNavigation />
                              <PlanFeatureRoute feature="clients"><Clients /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/pets"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_animals">
                              <VetNavigation />
                              <PlanFeatureRoute feature="animals"><Pets /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/appointments"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_appointments">
                              <VetNavigation />
                              <PlanFeatureRoute feature="appointments"><Appointments /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/visites"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_visits">
                              <VetNavigation />
                              <PlanFeatureRoute feature="visits"><Visits /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/visites/:id"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_visits">
                              <VetNavigation />
                              <PlanFeatureRoute feature="visits"><VisitWorkspace /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/consultations"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_create_consultations">
                              <VetNavigation />
                              <PlanFeatureRoute feature="consultations"><Consultations /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/history"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_view_history">
                              <VetNavigation />
                              <History />
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/farm"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_farms">
                              <VetNavigation />
                              <PlanFeatureRoute feature="farm"><Farm /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/vaccinations"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_vaccinations">
                              <VetNavigation />
                              <PlanFeatureRoute feature="vaccinations"><Vaccinations /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/antiparasites"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_antiparasites">
                              <VetNavigation />
                              <PlanFeatureRoute feature="antiparasites"><Antiparasites /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/accounting"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_accounting">
                              <VetNavigation />
                              <PlanFeatureRoute feature="accounting"><AccountingNew /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/farms"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_farms">
                              <VetNavigation />
                              <PlanFeatureRoute feature="farm"><Farm /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/stock"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_stock">
                              <VetNavigation />
                              <PlanFeatureRoute feature="stock"><Stock /></PlanFeatureRoute>
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/admin/team"
                        element={
                          <LazyRoute>
                            <AdminRoute>
                              <VetNavigation />
                              <TeamManagement />
                            </AdminRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_settings">
                              <VetNavigation />
                              <Settings />
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/settings/billing"
                        element={
                          <LazyRoute>
                            <PermissionRoute permission="can_manage_settings">
                              <VetNavigation />
                              <BillingSettings />
                            </PermissionRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <LazyRoute>
                            <ProtectedRoute>
                              <VetNavigation />
                              <Profile />
                            </ProtectedRoute>
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="/auth-settings"
                        element={
                          <LazyRoute>
                            <ProtectedRoute>
                              <VetNavigation />
                              <AuthSettings />
                            </ProtectedRoute>
                          </LazyRoute>
                        }
                      />

                      <Route
                        path="/super-admin"
                        element={
                          <LazyRoute>
                            <SuperAdminRoute>
                              <VetNavigation />
                              <SuperAdminLayout />
                            </SuperAdminRoute>
                          </LazyRoute>
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
                      <Route path="/reset-password" element={<LazyRoute><ResetPassword /></LazyRoute>} />

                      <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
                    </Routes>
                    <Suspense fallback={null}>
                      <MobileBottomNav />
                      <DemoTourBootstrap />
                      <DemoTourOverlay />
                    </Suspense>
                  </div>
                  </DemoTourProvider>
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
