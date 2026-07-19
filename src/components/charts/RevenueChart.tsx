import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';
import { useAccounting } from '@/hooks/useAccounting';
import { useSettings } from '@/contexts/SettingsContext';

export function RevenueChart() {
  const { revenues, expenses } = useAccounting();
  const { settings } = useSettings();
  const currency = settings.currency || 'MAD';

  const generateRevenueData = () => {
    const data = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthRevenue = revenues
        .filter((r) => {
          const d = new Date(r.revenue_date);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      const monthExpenses = expenses
        .filter((e) => {
          const d = new Date(e.expense_date);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      data.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: Math.round(monthRevenue),
        expenses: Math.round(monthExpenses),
        profit: Math.round(monthRevenue - monthExpenses),
      });
    }

    return data;
  };

  const data = generateRevenueData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Évolution des Revenus</CardTitle>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <TrendingUp className="h-4 w-4 text-green-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(value) => `${value}${currency}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number, name: string) => [
                  `${value} ${currency}`,
                  name === 'revenue' ? 'Revenus' : name === 'expenses' ? 'Dépenses' : 'Bénéfice',
                ]}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
              <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
