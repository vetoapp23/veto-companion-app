import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStockItems } from '@/hooks/useDatabase';
import { useTranslation } from "react-i18next";

export function StockChart() {
  const { data: stockItems = [] } = useStockItems();
  const { t } = useTranslation("app");

  // Calculer les données du stock
  const stockData = React.useMemo(() => {
    const totalItems = stockItems.length;
    const lowStockItems = stockItems.filter(item => 
      item.current_quantity <= item.minimum_quantity && item.current_quantity > 0
    ).length;
    const outOfStockItems = stockItems.filter(item => item.current_quantity === 0).length;
    const normalStockItems = totalItems - lowStockItems - outOfStockItems;

    return [
      { name: t("charts.stock.normal"), value: normalStockItems, color: '#10b981' },
      { name: t("charts.stock.low"), value: lowStockItems, color: '#f59e0b' },
      { name: t("charts.stock.out"), value: outOfStockItems, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [stockItems, t]);

  // Calculer la valeur totale du stock
  const totalStockValue = stockItems.reduce((sum, item) => 
    sum + (item.current_quantity * (item.unit_cost || 0)), 0
  );

  // Top 5 des articles les plus chers
  const topExpensiveItems = stockItems
    .sort((a, b) => 
      (b.current_quantity * (b.unit_cost || 0)) - (a.current_quantity * (a.unit_cost || 0))
    )
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{t("charts.stock.title")}</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [value, t("charts.stock.tooltip")]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("stock.kpi.totalValue")}</span>
            <span className="font-medium">{totalStockValue.toFixed(0)} €</span>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t("charts.stock.tooltip")}</h4>
            {topExpensiveItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <span className="truncate flex-1">{item.name}</span>
                <span className="text-muted-foreground ml-2">
                  {(item.current_quantity * (item.unit_cost || 0)).toFixed(0)} €
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
