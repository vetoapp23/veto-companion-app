import { ReactNode } from "react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Props {
  feature: "farm" | "accounting" | "stock";
  children: ReactNode;
}

export function PlanFeatureRoute({ feature, children }: Props) {
  const { hasFarmManagement, hasAccounting, hasStock, isLoading, planCode } = usePlanLimits();
  const { t } = useTranslation("settings");

  if (isLoading) return null;

  const allowed =
    feature === "farm" ? hasFarmManagement :
    feature === "accounting" ? hasAccounting :
    hasStock;

  if (allowed) return <>{children}</>;

  const featureLabel = t(`planGate.features.${feature === "farm" ? "farms" : feature}`);

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
            {t("planGate.bodyFeature", { feature: featureLabel, planCode })}
          </p>
          <Button asChild>
            <Link to="/pricing">{t("planGate.seePlans")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
