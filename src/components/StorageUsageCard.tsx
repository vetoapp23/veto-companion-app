import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Sparkles, AlertTriangle, ArrowUpRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { recomputeStorageUsage } from "@/lib/photoCompression";
import { useToast } from "@/hooks/use-toast";

export function StorageUsageCard() {
  const { quota, isLoading, storageWarning, storageBlocked, isFree, refetch, isPrivileged } = usePlanLimits();
  const { toast } = useToast();
  const [recomputing, setRecomputing] = useState(false);

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      await recomputeStorageUsage();
      await refetch();
      toast({ title: "✓ Stockage recalculé" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message, variant: "destructive" });
    } finally {
      setRecomputing(false);
    }
  };

  if (isLoading || !quota) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Stockage & abonnement
          </CardTitle>
          <CardDescription>Chargement…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const percent = Math.min(100, quota.percent_used);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Stockage & abonnement
            </CardTitle>
            <CardDescription>
              Pack actuel :{" "}
              <Badge variant={isFree ? "secondary" : "default"} className="ml-1">
                {quota.plan_name}
              </Badge>
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/pricing">
              Changer de pack
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Espace photos utilisé</span>
            <span className="font-medium">
              {quota.storage_used_mb.toFixed(1)} Mo / {quota.storage_total_mb} Mo
            </span>
          </div>
          <Progress value={percent} className={storageBlocked ? "[&>div]:bg-destructive" : storageWarning ? "[&>div]:bg-yellow-500" : ""} />
          <p className="text-xs text-muted-foreground mt-2">
            {percent.toFixed(1)}% utilisé · compression auto activée
          </p>
        </div>

        {storageBlocked && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Quota dépassé</p>
              <p className="text-muted-foreground">
                Les nouveaux uploads de photos sont bloqués. Passez à un pack supérieur ou ajoutez du stockage.
              </p>
            </div>
          </div>
        )}

        {storageWarning && !storageBlocked && (
          <div className="flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Espace presque plein</p>
              <p className="text-muted-foreground">
                Vous avez utilisé plus de 80% de votre quota.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <Stat label="Clients" value={quota.max_clients ? `${quota.max_clients}` : "Illimité"} />
          <Stat label="Animaux" value={quota.max_animals ? `${quota.max_animals}` : "Illimité"} />
          <Stat label="Utilisateurs" value={quota.max_users ? `${quota.max_users}` : "Illimité"} />
        </div>

        {isFree && (
          <Button asChild className="w-full" variant="default">
            <Link to="/pricing">
              <Sparkles className="mr-2 h-4 w-4" />
              Passer à un pack payant
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
