import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Filter } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface DashboardFiltersProps {
  timePeriod: string;
  onTimePeriodChange: (period: string) => void;
}

export function DashboardFilters({ timePeriod, onTimePeriodChange }: DashboardFiltersProps) {
  const { t } = useTranslation("app");

  const timePeriods = useMemo(
    () => [
      { value: '7d', label: t("dashboard.filters.last7d") },
      { value: '30d', label: t("dashboard.filters.last30d") },
      { value: '3m', label: t("dashboard.filters.last3m") },
      { value: '6m', label: t("dashboard.filters.last6m") },
      { value: '1y', label: t("dashboard.filters.last1y") },
      { value: 'all', label: t("dashboard.filters.all") },
    ],
    [t]
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {t("dashboard.filters.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">{t("dashboard.filters.period")}</label>
            <Select value={timePeriod} onValueChange={onTimePeriodChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("dashboard.filters.selectPeriod")} />
              </SelectTrigger>
              <SelectContent>
                {timePeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {period.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
