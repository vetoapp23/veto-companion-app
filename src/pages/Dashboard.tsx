// @ts-nocheck
import { HeroSection } from "@/components/HeroSection";
import { DashboardStats } from "@/components/DashboardStats";
import { ClientsOverview } from "@/components/ClientsOverview";
import { PetsOverview } from "@/components/PetsOverview";
import { ConsultationsOverview } from "@/components/ConsultationsOverview";
import { DashboardAlerts } from "@/components/DashboardAlerts";
import { RealTimeKPIs } from "@/components/charts/RealTimeKPIs";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { StockChart } from "@/components/charts/StockChart";
import { ClientGrowthChart } from "@/components/charts/ClientGrowthChart";
import { AppointmentStatusChart } from "@/components/charts/AppointmentStatusChart";
import { ConsultationTrendsChart } from "@/components/charts/ConsultationTrendsChart";
import { PetSpeciesChart } from "@/components/charts/PetSpeciesChart";
import { AdminOnly } from "@/components/RoleGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Heart,
  Stethoscope,
  BarChart3,
  Shield,
  Activity,
  PieChart,
  AlertTriangle,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 max-w-7xl">
      <HeroSection />

      <div className="mt-6 sm:mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs lg:text-sm">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs lg:text-sm">Analyses</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs lg:text-sm">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="animals" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs lg:text-sm">Animaux</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs lg:text-sm">Consultations</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs lg:text-sm">Graphiques</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <Tabs defaultValue="kpis" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 h-auto p-1">
                <TabsTrigger value="kpis" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>KPIs</span>
                </TabsTrigger>
                <TabsTrigger value="activities" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Activités</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
                  <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Statistiques</span>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Alertes</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="kpis" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                <section>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Indicateurs Clés de Performance</h2>
                  <RealTimeKPIs />
                </section>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                <section>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Activités Récentes</h2>
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                    <div className="w-full"><ClientsOverview /></div>
                    <div className="w-full"><PetsOverview /></div>
                    <div className="w-full"><ConsultationsOverview /></div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="statistics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                <section>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Statistiques Détaillées</h2>
                  <DashboardStats />
                </section>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                <section>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Alertes</h2>
                  <DashboardAlerts />
                </section>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <section>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Analyses et Tendances</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <AdminOnly>
                  <RevenueChart />
                </AdminOnly>
                <ActivityChart />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <section>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Gestion des Clients</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ClientsOverview />
                <ClientGrowthChart />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="animals" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <section>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Gestion des Animaux</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <PetsOverview />
                <PetSpeciesChart />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="consultations" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <section>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Activité Récente</h2>
              <ConsultationsOverview />
            </section>
            <section>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Rendez-vous</h2>
              <AppointmentStatusChart />
            </section>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <section>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 px-1">Graphiques Détaillés</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ConsultationTrendsChart />
                <AppointmentStatusChart />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <PetSpeciesChart />
                <StockChart />
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <AdminOnly>
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold">Administration</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <RevenueChart />
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">Fonctionnalités Admin</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Section réservée aux administrateurs pour la gestion avancée du système.
              </p>
            </div>
          </div>
        </div>
      </AdminOnly>
    </div>
  );
};

export default Dashboard;
