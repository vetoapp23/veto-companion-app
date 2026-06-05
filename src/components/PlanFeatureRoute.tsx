import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  feature: "farm" | "accounting" | "stock";
  children: ReactNode;
}

export function PlanFeatureRoute({ feature, children }: Props) {
  const { hasFarmManagement, hasAccounting, hasStock, isLoading, planCode } = usePlanLimits();
  if (isLoading) return null;

  const allowed =
    feature === "farm" ? hasFarmManagement :
    feature === "accounting" ? hasAccounting :
    hasStock;

  if (allowed) return <>{children}</>;

  const labels = {
    farm: "la Gestion de fermes",
    accounting: "la Comptabilité",
    stock: "la Gestion de stock",
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Fonctionnalité non incluse dans votre pack
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {labels[feature]} n'est pas disponible avec votre pack actuel ({planCode}).
            Passez à un pack supérieur (Pro Plus, Duo ou Clinique) pour y accéder.
          </p>
          <Button asChild>
            <Link to="/pricing">Voir les packs</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
