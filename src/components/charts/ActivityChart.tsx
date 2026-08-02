import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Calendar, Stethoscope, Syringe } from 'lucide-react';
import { useConsultations, useAppointments, useVaccinations, useAntiparasitics } from '@/hooks/useDatabase';
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";

export function ActivityChart() {
  const { data: consultations = [] } = useConsultations();
  const { data: appointments = [] } = useAppointments();
  const { data: vaccinations = [] } = useVaccinations();
  const { data: antiparasitics = [] } = useAntiparasitics();
  const { t } = useTranslation("app");
  const { bcp47 } = useAppLocale();

  // Générer les données des 7 derniers jours
  const generateActivityData = () => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const consultationsCount = consultations.filter(c => 
        new Date(c.consultation_date).toISOString().split('T')[0] === dateString
      ).length;
      const appointmentsCount = appointments.filter(a => 
        new Date(a.appointment_date).toISOString().split('T')[0] === dateString
      ).length;
      const vaccinationsCount = vaccinations.filter(v => 
        new Date(v.vaccination_date).toISOString().split('T')[0] === dateString
      ).length;
      const antiparasiticsCount = antiparasitics.filter(a => 
        new Date(a.treatment_date).toISOString().split('T')[0] === dateString
      ).length;
      
      data.push({
        day: date.toLocaleDateString(bcp47, { weekday: 'short' }),
        date: dateString,
        consultations: consultationsCount,
        appointments: appointmentsCount,
        vaccinations: vaccinationsCount,
        antiparasitics: antiparasiticsCount,
        total: consultationsCount + appointmentsCount + vaccinationsCount + antiparasiticsCount
      });
    }
    
    return data;
  };

  const data = generateActivityData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{t("charts.activity.title")}</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'consultations' ? t("charts.activity.consultations") : 
                  name === 'appointments' ? t("charts.activity.appointments") :
                  name === 'vaccinations' ? t("charts.activity.vaccinations") :
                  name === 'antiparasitics' ? t("charts.activity.antiparasitics") : t("charts.activity.total")
                ]}
              />
              <Bar dataKey="consultations" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="vaccinations" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="antiparasitics" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">{t("charts.activity.consultations")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">{t("charts.activity.appointments")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-muted-foreground">{t("charts.activity.vaccinations")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-muted-foreground">{t("charts.activity.antiparasitics")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
