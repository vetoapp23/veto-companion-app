import React, { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronRight, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Activity,
  Package,
  Stethoscope,
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  count?: number;
  color: string;
  items: {
    id: string;
    title: string;
    description: string;
  }[];
}

interface DashboardNavigationProps {
  onSectionChange: (sectionId: string) => void;
  activeSection: string;
}

export function DashboardNavigation({ onSectionChange, activeSection }: DashboardNavigationProps) {
  const { t } = useTranslation("app");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const sections: Section[] = useMemo(() => [
    {
      id: 'overview',
      title: t('dashboard.nav.overview'),
      icon: BarChart3,
      color: 'text-blue-600',
      items: [
        { id: 'kpis', title: t('dashboard.nav.kpis'), description: t('dashboard.nav.kpisDesc') },
        { id: 'stats', title: t('dashboard.nav.stats'), description: t('dashboard.nav.statsDesc') },
        { id: 'alerts', title: t('dashboard.nav.alerts'), description: t('dashboard.nav.alertsDesc') }
      ]
    },
    {
      id: 'analytics',
      title: t('dashboard.nav.analytics'),
      icon: TrendingUp,
      color: 'text-green-600',
      items: [
        { id: 'revenue', title: t('dashboard.nav.revenue'), description: t('dashboard.nav.revenueDesc') },
        { id: 'activity', title: t('dashboard.nav.activity'), description: t('dashboard.nav.activityDesc') },
        { id: 'consultations', title: t('dashboard.nav.consultations'), description: t('dashboard.nav.consultationsDesc') }
      ]
    },
    {
      id: 'clients',
      title: t('dashboard.nav.clientsPets'),
      icon: Users,
      color: 'text-purple-600',
      items: [
        { id: 'clients-overview', title: t('dashboard.nav.clients'), description: t('dashboard.nav.clientsDesc') },
        { id: 'pets-overview', title: t('dashboard.nav.pets'), description: t('dashboard.nav.petsDesc') },
        { id: 'client-growth', title: t('dashboard.nav.growth'), description: t('dashboard.nav.growthDesc') }
      ]
    },
    {
      id: 'appointments',
      title: t('dashboard.nav.appointments'),
      icon: Calendar,
      color: 'text-orange-600',
      items: [
        { id: 'appointments-status', title: t('dashboard.nav.apptsStatus'), description: t('dashboard.nav.apptsStatusDesc') },
        { id: 'appointments-upcoming', title: t('dashboard.nav.apptsUpcoming'), description: t('dashboard.nav.apptsUpcomingDesc') }
      ]
    },
    {
      id: 'medical',
      title: t('dashboard.nav.medical'),
      icon: Stethoscope,
      color: 'text-red-600',
      items: [
        { id: 'consultations-recent', title: t('dashboard.nav.consultationsRecent'), description: t('dashboard.nav.consultationsRecentDesc') },
        { id: 'medical-stats', title: t('dashboard.nav.medicalStats'), description: t('dashboard.nav.medicalStatsDesc') }
      ]
    },
    {
      id: 'inventory',
      title: t('dashboard.nav.inventory'),
      icon: Package,
      color: 'text-indigo-600',
      items: [
        { id: 'stock-status', title: t('dashboard.nav.stockStatus'), description: t('dashboard.nav.stockStatusDesc') },
        { id: 'stock-alerts', title: t('dashboard.nav.stockAlerts'), description: t('dashboard.nav.stockAlertsDesc') }
      ]
    }
  ], [t]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
  };

  return (
    <Card className="w-full md:w-80 h-fit">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('dashboard.nav.title')}
          </h3>
          
          {sections.map((section) => (
            <div key={section.id} className="border rounded-lg">
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <section.icon className={`h-4 w-4 ${section.color}`} />
                  <span className="font-medium">{section.title}</span>
                  {section.count && (
                    <Badge variant="secondary" className="text-xs">
                      {section.count}
                    </Badge>
                  )}
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              
              {expandedSections.has(section.id) && (
                <div className="border-t">
                  {section.items.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "secondary" : "ghost"}
                      className="w-full justify-start p-3 h-auto text-left"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="ml-7">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
