import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Stethoscope, TrendingUp } from 'lucide-react';
import { useConsultations } from '@/hooks/useDatabase';
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";

export function ConsultationTrendsChart() {
  const { data: consultations = [] } = useConsultations();
  const { t } = useTranslation("app");
  const { bcp47 } = useAppLocale();

  // Générer les données des 12 derniers mois
  const generateTrendsData = () => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Compter les consultations de ce mois
      const monthConsultations = consultations.filter(consultation => {
        const consultationDate = new Date(consultation.consultation_date);
        return consultationDate >= monthStart && consultationDate <= monthEnd;
      });
      
      // Calculer le revenu moyen par consultation
      const totalRevenue = monthConsultations.reduce((sum, c) => sum + (c.cost || 0), 0);
      const averageRevenue = monthConsultations.length > 0 ? totalRevenue / monthConsultations.length : 0;
      
      data.push({
        month: date.toLocaleDateString(bcp47, { month: 'short', year: '2-digit' }),
        consultations: monthConsultations.length,
        revenue: Math.round(totalRevenue),
        averageRevenue: Math.round(averageRevenue)
      });
    }
    
    return data;
  };

  const data = generateTrendsData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{t("charts.consultationTrends.title")}</CardTitle>
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
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
                  name === 'consultations' ? value : `${value} €`,
                  name === 'consultations' ? t("charts.consultationTrends.consultations") : 
                  name === 'revenue' ? t("charts.consultationTrends.revenue") : t("charts.consultationTrends.averageRevenue")
                ]}
              />
              <Area
                type="monotone"
                dataKey="consultations"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">{t("charts.consultationTrends.consultations")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
