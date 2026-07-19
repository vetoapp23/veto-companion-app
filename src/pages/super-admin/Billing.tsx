import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBillingOverview, formatMad } from "@/lib/superAdmin";
import { useAllOrganizations } from "@/hooks/useSuperAdminData";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertTriangle, Clock } from "lucide-react";

export default function SuperAdminBilling() {
  const billing = useQuery({
    queryKey: ["super-admin", "billing"],
    queryFn: fetchBillingOverview,
  });
  const { data: orgs = [] } = useAllOrganizations();

  const pastDue = orgs.filter((o) => o.subscription?.status === "past_due");
  const trials = orgs.filter((o) => o.subscription?.status === "trialing");
  const withStripe = orgs.filter(
    (o) => o.subscription?.stripe_customer_id || o.subscription?.stripe_subscription_id
  );

  const d = billing.data;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> MRR estimé (MAD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">
              {billing.isLoading ? "…" : formatMad(Number(d?.estimated_mrr_mad ?? 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Calculé depuis les prix des plans (pas encore sync Stripe live)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Past due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{d?.past_due_count ?? pastDue.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Clock className="h-4 w-4" /> Trials ≤ 7 j
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{d?.trials_ending_7d ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Liés Stripe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{d?.with_stripe ?? withStripe.length}</div>
            <p className="text-xs text-muted-foreground mt-1">customer ou subscription id renseigné</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Par plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(d?.by_plan ?? []).map((p: any) => (
              <div key={p.plan_code} className="rounded-xl border p-3 text-sm">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="font-mono">{p.plan_code}</Badge>
                  <span className="font-bold">{p.orgs} orgs</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 grid grid-cols-2 gap-1">
                  <span>active: {p.active}</span>
                  <span>trial: {p.trialing}</span>
                  <span>past_due: {p.past_due}</span>
                  <span>churn: {p.churned}</span>
                </div>
              </div>
            ))}
            {!d?.by_plan?.length && (
              <p className="text-sm text-muted-foreground">Aucune donnée billing</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cliniques past_due / trial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...pastDue, ...trials].length === 0 && (
            <p className="text-sm text-muted-foreground">Rien à signaler</p>
          )}
          {[...pastDue, ...trials].map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-2 rounded-lg border p-2 text-sm">
              <div>
                <div className="font-medium">{o.name}</div>
                <div className="text-xs text-muted-foreground">
                  {o.subscription?.plan_code} · {o.subscription?.status}
                  {o.subscription?.stripe_customer_id
                    ? ` · ${o.subscription.stripe_customer_id}`
                    : " · pas de Stripe ID"}
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-full" asChild>
                <Link to={`/super-admin/organizations/${o.id}`}>Ouvrir</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Stripe ops (phase suivante) :</strong> webhooks checkout,
          Customer Portal, sync `stripe_customer_id` / `stripe_subscription_id`, remboursements.
          Les colonnes DB sont prêtes ; branchez la clé Stripe + edge function webhook pour activer le live.
        </CardContent>
      </Card>
    </div>
  );
}
