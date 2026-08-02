import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAppointments } from '@/hooks/useDatabase';
import { useTranslation } from "react-i18next";

export function AppointmentStatusChart() {
  const { data: appointments = [] } = useAppointments();
  const { t } = useTranslation("app");

  // Calculer les données des statuts de rendez-vous
  const statusData = React.useMemo(() => {
    const statusCounts = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusLabels = {
      scheduled: t("charts.appointmentStatus.scheduled"),
      confirmed: t("charts.appointmentStatus.confirmed"),
      completed: t("charts.appointmentStatus.completed"),
      cancelled: t("charts.appointmentStatus.cancelled"),
      'no-show': t("charts.appointmentStatus.noShow")
    };

    const statusColors = {
      scheduled: '#3b82f6',
      confirmed: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
      'no-show': '#f59e0b'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status as keyof typeof statusLabels] || status,
      value: count,
      color: statusColors[status as keyof typeof statusColors] || '#6b7280'
    }));
  }, [appointments, t]);

  // Calculer les statistiques
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

  const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
  const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{t("charts.appointmentStatus.title")}</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [value, t("charts.appointmentStatus.tooltip")]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">{t("charts.appointmentStatus.completed")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{cancellationRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">{t("charts.appointmentStatus.cancelled")}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{t("charts.appointmentStatus.completed")}</span>
              </div>
              <span className="font-medium">{completedAppointments}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>{t("charts.appointmentStatus.scheduled")}</span>
              </div>
              <span className="font-medium">{upcomingAppointments}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>{t("charts.appointmentStatus.cancelled")}</span>
              </div>
              <span className="font-medium">{cancelledAppointments}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
