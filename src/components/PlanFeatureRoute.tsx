import { ReactNode } from "react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export type PlanFeatureKey =
  | "farm"
  | "accounting"
  | "stock"
  | "consultations"
  | "visits"
  | "appointments"
  | "vaccinations"
  | "antiparasites"
  | "clients"
  | "animals";

interface Props {
  feature: PlanFeatureKey;
  children: ReactNode;
}

export function PlanFeatureRoute({ feature, children }: Props) {
  const limits = usePlanLimits();
  const { t } = useTranslation("settings");

  if (limits.isLoading) return null;

  const map: Record<PlanFeatureKey, boolean> = {
    farm: limits.hasFarmManagement,
    accounting: limits.hasAccounting,
    stock: limits.hasStock,
    consultations: limits.hasConsultations,
    visits: limits.hasVisits,
    appointments: limits.hasAppointments,
    vaccinations: limits.hasVaccinations,
    antiparasites: limits.hasAntiparasites,
    clients: limits.hasClients,
    animals: limits.hasAnimals,
  };

  const allowed = map[feature];
  if (allowed) return <>{children}</>;

  const featureLabel = t(`planGate.features.${feature}`, {
    defaultValue: feature,
  });

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            {t("planGate.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t("planGate.bodyFeature", { feature: featureLabel, planCode: limits.planCode })}
          </p>
          <Button asChild>
            <Link to="/pricing">{t("planGate.seePlans")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
