import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAllOrganizations,
  useAllPlans,
  formatLimitUsage,
  limitPercent,
} from "@/hooks/useSuperAdminData";
import { Search, RefreshCw, AlertTriangle, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { planBadge, statusBadge } from "./Overview";

const SUB_STATUSES = ["active", "trialing", "past_due", "canceled", "suspended"];
const PAGE_SIZE = 25;

export default function SuperAdminOrganizations() {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { data: orgs = [], isLoading, refetch } = useAllOrganizations();
  const { data: plans = [] } = useAllPlans();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return orgs.filter((o) => {
      const s = search.toLowerCase();
      const matchesSearch =
        !s ||
        o.name.toLowerCase().includes(s) ||
        o.clinic_name?.toLowerCase().includes(s) ||
        o.invitation_code?.toLowerCase().includes(s);
      const plan = o.subscription?.plan_code ?? "free";
      const stat = o.subscription?.status ?? "active";
      return (
        matchesSearch &&
        (planFilter === "all" || plan === planFilter) &&
        (statusFilter === "all" || stat === statusFilter)
      );
    });
  }, [orgs, search, planFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("superAdmin.organizations.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <Select
          value={planFilter}
          onValueChange={(v) => {
            setPlanFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("superAdmin.organizations.plan")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("superAdmin.organizations.allPlans")}</SelectItem>
            {plans.map((p: any) => (
              <SelectItem key={p.code} value={p.code}>
                {p.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("superAdmin.organizations.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("superAdmin.organizations.allStatuses")}</SelectItem>
            {SUB_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            qc.invalidateQueries({ queryKey: ["super-admin"] });
            refetch();
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="p-3">{t("superAdmin.organizations.clinic")}</th>
                <th className="p-3">{t("superAdmin.organizations.plan")}</th>
                <th className="p-3">{t("superAdmin.organizations.status")}</th>
                <th className="p-3">{t("superAdmin.organizations.users")}</th>
                <th className="p-3">{t("superAdmin.organizations.clients")}</th>
                <th className="p-3">{t("superAdmin.organizations.animals")}</th>
                <th className="p-3">{t("superAdmin.organizations.storage")}</th>
                <th className="p-3">{t("superAdmin.organizations.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    {t("superAdmin.organizations.loading")}
                  </td>
                </tr>
              )}
              {!isLoading && slice.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    {t("superAdmin.organizations.empty")}
                  </td>
                </tr>
              )}
              {slice.map((o) => {
                const quota = (o.subscription?.storage_quota_mb ?? 200) + (o.subscription?.storage_addon_mb ?? 0);
                const pct = quota > 0 ? Math.round((o.storage_used_mb / quota) * 100) : 0;
                const clientPct = limitPercent(o.clients_count, o.plan_limits?.max_clients);
                const clientFull =
                  o.plan_limits?.max_clients != null && o.clients_count >= o.plan_limits.max_clients;
                return (
                  <tr key={o.id} className="border-b hover:bg-muted/20">
                    <td className="p-3">
                      <div className="font-medium">{o.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.invitation_code || o.clinic_name || "—"}
                      </div>
                    </td>
                    <td className="p-3">{planBadge(o.subscription?.plan_code ?? "free")}</td>
                    <td className="p-3">{statusBadge(o.subscription?.status ?? "active")}</td>
                    <td className="p-3">{o.users_count}</td>
                    <td className="p-3">
                      <div className={`text-xs flex items-center gap-1 ${clientFull ? "text-destructive font-medium" : ""}`}>
                        {clientFull && <AlertTriangle className="h-3 w-3" />}
                        {formatLimitUsage(o.clients_count, o.plan_limits?.max_clients)}
                      </div>
                      {o.plan_limits?.max_clients != null && (
                        <div className="h-1.5 w-20 rounded bg-muted overflow-hidden mt-1">
                          <div
                            className={`h-full ${clientPct >= 100 ? "bg-red-500" : "bg-primary"}`}
                            style={{ width: `${clientPct}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-xs">{formatLimitUsage(o.animals_count, o.plan_limits?.max_animals)}</td>
                    <td className="p-3">
                      <div className="text-xs">
                        {o.storage_used_mb} / {quota} {t("superAdmin.organizations.mb")}
                      </div>
                      <div className="h-1.5 w-24 rounded bg-muted overflow-hidden mt-1">
                        <div
                          className={`h-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-primary"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" className="rounded-full" asChild>
                        <Link to={`/super-admin/organizations/${o.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> {t("superAdmin.organizations.view")}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("superAdmin.organizations.pagination", {
            count: filtered.length,
            page: page + 1,
            pageCount,
          })}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            {tc("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            {tc("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
