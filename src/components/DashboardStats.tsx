import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Calendar, Stethoscope, DollarSign, Activity, Syringe, Shield, Package, AlertTriangle } from "lucide-react";
import { useClients, useAnimals, useConsultations, useAppointments, useVaccinations, useAntiparasitics, useStockItems, useFarms } from "@/hooks/useDatabase";
import { useAccounting } from "@/hooks/useAccounting";
import { useSettings } from "@/contexts/SettingsContext";
import { toLocalDateKey, todayLocalKey } from "@/lib/dateLocal";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export function DashboardStats() {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { data: consultations = [] } = useConsultations();
  const { data: appointments = [] } = useAppointments();
  const { data: vaccinations = [] } = useVaccinations();
  const { data: antiparasitics = [] } = useAntiparasitics();
  const { data: stockItems = [] } = useStockItems();
  const { data: farms = [] } = useFarms();
  const { revenues, expenses } = useAccounting();
  const { settings } = useSettings();

  const totalClients = clients.length;
  const totalPets = pets.length;
  const totalFarms = farms.length;
  const totalVaccinations = vaccinations.length;
  const totalAntiparasitics = antiparasitics.length;
  const totalStockItems = stockItems.length;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const previousMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const previousYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const inMonth = (dateStr: string | undefined, m: number, y: number) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === m && d.getFullYear() === y;
  };

  const consultationsThisMonth = consultations.filter(c => inMonth(c.consultation_date, thisMonth, thisYear)).length;
  const consultationsPreviousMonth = consultations.filter(c => inMonth(c.consultation_date, previousMonth, previousYear)).length;
  const vaccinationsThisMonth = vaccinations.filter(v => inMonth(v.vaccination_date, thisMonth, thisYear)).length;
  const vaccinationsPreviousMonth = vaccinations.filter(v => inMonth(v.vaccination_date, previousMonth, previousYear)).length;
  const antiparasiticsThisMonth = antiparasitics.filter(a => inMonth(a.treatment_date, thisMonth, thisYear)).length;
  const antiparasiticsPreviousMonth = antiparasitics.filter(a => inMonth(a.treatment_date, previousMonth, previousYear)).length;

  const today = todayLocalKey();
  const consultationsToday = consultations.filter(c => toLocalDateKey(c.consultation_date) === today).length;
  const appointmentsToday = appointments.filter(a => {
    return toLocalDateKey(a.appointment_date) === today && a.status !== "cancelled" && a.status !== "completed";
  }).length;

  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const upcomingAppointments = appointments.filter(a => {
    if (!a.appointment_date || a.status === "cancelled" || a.status === "completed") return false;
    const d = new Date(a.appointment_date);
    return d >= new Date(today + "T00:00:00") && d <= weekFromNow;
  });

  const appointmentsThisMonth = appointments.filter(a => inMonth(a.appointment_date, thisMonth, thisYear)).length;
  const appointmentsPreviousMonth = appointments.filter(a => inMonth(a.appointment_date, previousMonth, previousYear)).length;

  const lowStockItems = stockItems.filter(item => (item.current_quantity ?? 0) <= (item.minimum_quantity ?? 0)).length;
  const outOfStockItems = stockItems.filter(item => (item.current_quantity ?? 0) === 0).length;

  const sumAmount = (rows: { amount?: number }[]) => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const realRevenue = sumAmount(revenues.filter(r => inMonth(r.revenue_date, thisMonth, thisYear)));
  const previousRevenue = sumAmount(revenues.filter(r => inMonth(r.revenue_date, previousMonth, previousYear)));
  const realExpenses = sumAmount(expenses.filter(e => inMonth(e.expense_date, thisMonth, thisYear)));
  const netIncome = realRevenue - realExpenses;

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  const newClientsThisMonth = clients.filter(c => inMonth(c.created_at, thisMonth, thisYear)).length;
  const newClientsPreviousMonth = clients.filter(c => inMonth(c.created_at, previousMonth, previousYear)).length;
  const newPetsThisMonth = pets.filter(p => inMonth(p.created_at, thisMonth, thisYear)).length;
  const newPetsPreviousMonth = pets.filter(p => inMonth(p.created_at, previousMonth, previousYear)).length;
  const currency = settings.currency || "MAD";

  const stats = useMemo(() => [
    { title: t("dashboard.stats.totalClients"), value: totalClients.toString(), change: getChangePercentage(newClientsThisMonth, newClientsPreviousMonth), icon: Users, color: "text-blue-600", bgColor: "bg-blue-50", description: t("dashboard.stats.newThisMonth", { count: newClientsThisMonth }) },
    { title: t("dashboard.stats.petsFollowed"), value: totalPets.toString(), change: getChangePercentage(newPetsThisMonth, newPetsPreviousMonth), icon: Heart, color: "text-red-600", bgColor: "bg-red-50", description: t("dashboard.stats.newThisMonth", { count: newPetsThisMonth }) },
    { title: t("dashboard.stats.apptsToday"), value: appointmentsToday.toString(), change: getChangePercentage(appointmentsThisMonth, appointmentsPreviousMonth), icon: Calendar, color: "text-purple-600", bgColor: "bg-purple-50", description: t("dashboard.stats.upcomingWeek", { count: upcomingAppointments.length }) },
    { title: t("dashboard.stats.consultations"), value: consultationsThisMonth.toString(), change: getChangePercentage(consultationsThisMonth, consultationsPreviousMonth), icon: Stethoscope, color: "text-green-600", bgColor: "bg-green-50", description: t("dashboard.stats.todayCount", { count: consultationsToday }) },
    { title: t("dashboard.stats.realRevenue"), value: `${realRevenue.toFixed(0)} ${currency}`, change: getChangePercentage(realRevenue, previousRevenue), icon: DollarSign, color: "text-emerald-600", bgColor: "bg-emerald-50", description: t("dashboard.stats.profit", { amount: netIncome.toFixed(0), currency }) },
    { title: t("dashboard.stats.farmActivity"), value: totalFarms.toString(), change: "—", icon: Activity, color: "text-orange-600", bgColor: "bg-orange-50", description: t("dashboard.stats.activeFarms", { count: totalFarms }) },
    { title: t("dashboard.stats.vaccinations"), value: vaccinationsThisMonth.toString(), change: getChangePercentage(vaccinationsThisMonth, vaccinationsPreviousMonth), icon: Syringe, color: "text-blue-600", bgColor: "bg-blue-50", description: t("dashboard.stats.totalCount", { count: totalVaccinations }) },
    { title: t("dashboard.stats.antiparasitics"), value: antiparasiticsThisMonth.toString(), change: getChangePercentage(antiparasiticsThisMonth, antiparasiticsPreviousMonth), icon: Shield, color: "text-purple-600", bgColor: "bg-purple-50", description: t("dashboard.stats.totalCount", { count: totalAntiparasitics }) },
    { title: t("dashboard.stats.stock"), value: totalStockItems.toString(), change: lowStockItems > 0 ? t("dashboard.stats.stockAlerts", { count: lowStockItems }) : t("dashboard.stats.stockOk"), icon: lowStockItems > 0 ? AlertTriangle : Package, color: lowStockItems > 0 ? "text-red-600" : "text-green-600", bgColor: lowStockItems > 0 ? "bg-red-50" : "bg-green-50", description: t("dashboard.stats.stockLevels", { low: lowStockItems, out: outOfStockItems }) },
  ], [t, totalClients, totalPets, appointmentsToday, consultationsThisMonth, realRevenue, currency, netIncome, totalFarms, vaccinationsThisMonth, antiparasiticsThisMonth, totalStockItems, lowStockItems, outOfStockItems, newClientsThisMonth, newPetsThisMonth, upcomingAppointments.length, consultationsToday, totalVaccinations, totalAntiparasitics, appointmentsThisMonth, appointmentsPreviousMonth, consultationsPreviousMonth, previousRevenue, vaccinationsPreviousMonth, antiparasiticsPreviousMonth, newClientsPreviousMonth, newPetsPreviousMonth]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-secondary font-medium">{stat.change}</span> {tc("vsLastMonth")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
