import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSuperAdminStats } from "@/hooks/useSuperAdminData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBillingOverview, formatMad } from "@/lib/superAdmin";
import {
  Building2,
  Users,
  PawPrint,
  Package,
  AlertTriangle,
  UserCheck,
  CreditCard,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export function planBadge(code: string) {
  return <Badge variant="secondary" className="font-mono text-xs">{code}</Badge>;
}

export function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    trialing: "bg-sky-100 text-sky-800",
    past_due: "bg-amber-100 text-amber-900",
    canceled: "bg-muted text-muted-foreground",
    suspended: "bg-red-100 text-red-800",
    approved: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-900",
    rejected: "bg-red-100 text-red-800",
  };
  return <Badge className={map[status] ?? "bg-muted"}>{status}</Badge>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  warn,
}: {
  icon: any;
  label: string;
  value: any;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <Card className={warn ? "border-destructive/40" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold font-display ${warn ? "text-destructive" : ""}`}>{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function SuperAdminOverview() {
  const stats = useSuperAdminStats();
  const billing = useQuery({
    queryKey: ["super-admin", "billing"],
    queryFn: fetchBillingOverview,
    staleTime: 60_000,
  });
  const qc = useQueryClient();
  const { t } = useTranslation("settings");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-2"
          onClick={() => qc.invalidateQueries({ queryKey: ["super-admin"] })}
        >
          <RefreshCw className="h-3.5 w-3.5" /> {t("superAdmin.overview.refresh")}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={Building2}
          label={t("superAdmin.overview.clinics")}
          value={stats.totalOrgs}
          sub={t("superAdmin.overview.clinicsSub", { paid: stats.paidOrgs, free: stats.freeOrgs })}
        />
        <StatCard
          icon={Users}
          label={t("superAdmin.overview.users")}
          value={stats.totalUsers}
          sub={t("superAdmin.overview.usersSub", { pending: stats.pendingUsers })}
        />
        <StatCard icon={UserCheck} label={t("superAdmin.overview.clientsTotal")} value={stats.totalClients} />
        <StatCard icon={PawPrint} label={t("superAdmin.overview.animals")} value={stats.totalAnimals} />
        <StatCard icon={Package} label={t("superAdmin.overview.storage")} value={`${stats.totalStorageMb} Mo`} />
        <StatCard
          icon={AlertTriangle}
          label={t("superAdmin.overview.clientLimits")}
          value={stats.orgsAtClientLimit}
          sub={t("superAdmin.overview.clientLimitsSub")}
          warn={stats.orgsAtClientLimit > 0}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> {t("superAdmin.overview.estimatedMrr")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">
              {billing.isLoading ? "…" : formatMad(Number(billing.data?.estimated_mrr_mad ?? 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("superAdmin.overview.mrrHint")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("superAdmin.overview.pastDue")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-amber-600">
              {billing.data?.past_due_count ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("superAdmin.overview.trialsEnding")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{billing.data?.trials_ending_7d ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {stats.byPlan.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("superAdmin.overview.planDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {stats.byPlan.map((p) => (
                <div key={p.code} className="rounded-xl border p-3 text-sm bg-muted/30">
                  <div className="flex items-center justify-between gap-2">
                    {planBadge(p.code)}
                    <span className="font-bold">{p.orgs}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {p.max_clients ?? "∞"} clients · {p.max_users} users
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/super-admin/organizations">
            {t("superAdmin.overview.manageClinics")} <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/super-admin/users">
            {t("superAdmin.overview.approveUsers")} <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/super-admin/billing">
            {t("superAdmin.nav.billing")} <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
