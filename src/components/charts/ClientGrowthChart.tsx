import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Users, TrendingUp } from 'lucide-react';
import { useClients, useAnimals } from '@/hooks/useDatabase';
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";

export function ClientGrowthChart() {
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { t } = useTranslation("app");
  const { bcp47 } = useAppLocale();

  // Générer les données de croissance des 6 derniers mois
  const generateGrowthData = () => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Compter les nouveaux clients de ce mois
      const newClients = clients.filter(client => {
        const clientDate = new Date(client.created_at);
        return clientDate >= monthStart && clientDate <= monthEnd;
      }).length;
      
      // Compter les nouveaux animaux de ce mois
      const newPets = pets.filter(pet => {
        const petDate = new Date(pet.created_at);
        return petDate >= monthStart && petDate <= monthEnd;
      }).length;
      
      // Calculer le total cumulé
      const totalClientsAtMonth = clients.filter(client => {
        const clientDate = new Date(client.created_at);
        return clientDate <= monthEnd;
      }).length;
      
      const totalPetsAtMonth = pets.filter(pet => {
        const petDate = new Date(pet.created_at);
        return petDate <= monthEnd;
      }).length;
      
      data.push({
        month: date.toLocaleDateString(bcp47, { month: 'short' }),
        newClients,
        newPets,
        totalClients: totalClientsAtMonth,
        totalPets: totalPetsAtMonth
      });
    }
    
    return data;
  };

  const data = generateGrowthData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{t("charts.clientGrowth.title")}</CardTitle>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
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
                  value,
                  name === 'newClients' ? t("charts.clientGrowth.newClients") : 
                  name === 'newPets' ? t("charts.clientGrowth.newPets") :
                  name === 'totalClients' ? t("charts.clientGrowth.totalClients") : t("charts.clientGrowth.totalPets")
                ]}
              />
              <Area
                type="monotone"
                dataKey="newClients"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="newPets"
                stackId="2"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">{t("charts.clientGrowth.newClients")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-muted-foreground">{t("charts.clientGrowth.newPets")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
