import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Heart,
  Calendar,
  Stethoscope,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useClients, useAnimals, useConsultations, useAppointments, useVaccinations, useAntiparasitics, useStockItems } from "@/hooks/useDatabase";
import { useAccounting } from "@/hooks/useAccounting";
import { useSettings } from '@/contexts/SettingsContext';

export function RealTimeKPIs() {
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { data: consultations = [] } = useConsultations();
  const { data: appointments = [] } = useAppointments();
  const { data: vaccinations = [] } = useVaccinations();
  const { data: antiparasitics = [] } = useAntiparasitics();
  const { data: stockItems = [] } = useStockItems();
  const { revenues, expenses } = useAccounting();
  const { settings } = useSettings();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const consultationsToday = consultations.filter(c => (c.consultation_date || '').split('T')[0] === todayStr).length;

  const appointmentsToday = appointments.filter(a => {
    const date = (a.appointment_date || '').split('T')[0];
    return date === todayStr && a.status !== 'cancelled';
  }).length;

  const upcomingThisWeek = appointments.filter(a => {
    if (!a.appointment_date || a.status === 'cancelled' || a.status === 'completed') return false;
    const d = new Date(a.appointment_date);
    return d >= today && d <= weekFromNow;
  }).length;

  const overdueAppointments = appointments.filter(a => {
    if (!a.appointment_date || a.status === 'cancelled' || a.status === 'completed') return false;
    return new Date(a.appointment_date) < new Date(todayStr);
  });

  const lowStockItems = stockItems.filter(item => (item.current_quantity ?? 0) <= (item.minimum_quantity ?? 0)).length;
  const outOfStockItems = stockItems.filter(item => (item.current_quantity ?? 0) === 0).length;

  const monthRevenues = revenues.filter(r => {
    const d = new Date(r.revenue_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const totalRevenue = monthRevenues.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalExpenses = monthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  const newClientsThisMonth = clients.filter(c => {
    const d = new Date(c.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const newPetsThisMonth = pets.filter(p => {
    const d = new Date(p.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const kpis = [
    {
      title: "Consultations Aujourd'hui",
      value: consultationsToday,
      icon: Stethoscope,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: consultationsToday > 0 ? "up" : "neutral",
      description: "Consultations réalisées"
    },
    {
      title: "RDV Aujourd'hui",
      value: appointmentsToday,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: appointmentsToday > 0 ? "up" : "neutral",
      description: "Rendez-vous programmés"
    },
    {
      title: "RDV Cette Semaine",
      value: upcomingThisWeek,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: upcomingThisWeek > 0 ? "up" : "neutral",
      description: "Rendez-vous à venir"
    },
    {
      title: "RDV En Retard",
      value: overdueAppointments.length,
      icon: AlertTriangle,
      color: overdueAppointments.length > 0 ? "text-red-600" : "text-gray-600",
      bgColor: overdueAppointments.length > 0 ? "bg-red-50" : "bg-gray-50",
      trend: overdueAppointments.length > 0 ? "down" : "neutral",
      description: "Rendez-vous en retard"
    },
    {
      title: "Nouveaux Clients",
      value: newClientsThisMonth,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: newClientsThisMonth > 0 ? "up" : "neutral",
      description: "Ce mois"
    },
    {
      title: "Nouveaux Animaux",
      value: newPetsThisMonth,
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      trend: newPetsThisMonth > 0 ? "up" : "neutral",
      description: "Ce mois"
    },
    {
      title: "Revenus du Mois",
      value: `${totalRevenue.toFixed(0)} ${settings.currency || 'MAD'}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: totalRevenue > 0 ? "up" : "neutral",
      description: `Bénéfice: ${netIncome.toFixed(0)} ${settings.currency || 'MAD'}`
    },
    {
      title: "Stock Critique",
      value: lowStockItems,
      icon: Activity,
      color: lowStockItems > 0 ? "text-orange-600" : "text-green-600",
      bgColor: lowStockItems > 0 ? "bg-orange-50" : "bg-green-50",
      trend: lowStockItems > 0 ? "down" : "neutral",
      description: `${outOfStockItems} en rupture`
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1">
                {kpi.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                {kpi.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                {kpi.trend === "neutral" && (
                  <Badge variant="outline" className="text-xs">—</Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
