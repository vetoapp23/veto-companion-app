import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrgDetail,
  adminUpsertSubscription,
  addSupportNote,
  adminRecordSubscriptionPayment,
  adminListSubscriptionPayments,
  adminSetOrgUser,
  PLATFORM_FEATURE_KEYS,
  PAYMENT_METHODS,
  formatMoney,
  type PlatformFeatureKey,
  type PaymentMethod,
} from "@/lib/superAdmin";
import { useAllPlans } from "@/hooks/useSuperAdminData";
import { useImpersonation } from "@/components/ImpersonationBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, Save, Download, Banknote } from "lucide-react";
import { planBadge, statusBadge } from "./Overview";
import { useTranslation } from "react-i18next";

const SUB_STATUSES = ["active", "trialing", "past_due", "canceled", "suspended"];

const emptyOverrides = (): Partial<Record<PlatformFeatureKey, boolean | null>> => {
  const o: Partial<Record<PlatformFeatureKey, boolean | null>> = {};
  PLATFORM_FEATURE_KEYS.forEach((k) => {
    o[k] = null;
  });
  return o;
};

function overridesFromSub(sub: any): Partial<Record<PlatformFeatureKey, boolean | null>> {
  const base = emptyOverrides();
  const raw = (sub?.feature_overrides ?? {}) as Record<string, boolean>;
  PLATFORM_FEATURE_KEYS.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(raw, k)) base[k] = !!raw[k];
    else base[k] = null;
  });
  return base;
}

function toPayloadOverrides(
  o: Partial<Record<PlatformFeatureKey, boolean | null>>,
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  PLATFORM_FEATURE_KEYS.forEach((k) => {
    if (o[k] === true || o[k] === false) out[k] = o[k] as boolean;
  });
  return out;
}

export default function SuperAdminOrgDetail() {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { orgId } = useParams<{ orgId: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: plans = [] } = useAllPlans();
  const { start } = useImpersonation();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [reason, setReason] = useState("Support client");

  const detail = useQuery({
    queryKey: ["super-admin", "org", orgId],
    enabled: !!orgId,
    queryFn: () => fetchOrgDetail(orgId!),
  });

  const paymentsQ = useQuery({
    queryKey: ["super-admin", "payments", orgId],
    enabled: !!orgId,
    queryFn: () => adminListSubscriptionPayments(orgId!, 50),
  });

  const org = detail.data?.organization;
  const sub = detail.data?.subscription;
  const usage = detail.data?.usage;
  const users = detail.data?.users ?? [];
  const notes = detail.data?.notes ?? [];
  const audit = detail.data?.recent_audit ?? [];
  const payments = paymentsQ.data ?? [];

  const [form, setForm] = useState<any>(null);
  const [overrides, setOverrides] = useState(emptyOverrides());
  const [keepFeatureOverrides, setKeepFeatureOverrides] = useState(false);

  useEffect(() => {
    if (!sub) return;
    setForm(null);
    setOverrides(overridesFromSub(sub));
    setKeepFeatureOverrides(false);
  }, [sub?.id, sub?.updated_at, sub?.plan_code, sub?.custom_price]);

  const formReady = form ?? {
    plan_code: sub?.plan_code ?? "free",
    status: sub?.status ?? "active",
    storage_quota_mb: sub?.storage_quota_mb ?? 200,
    storage_addon_mb: sub?.storage_addon_mb ?? 0,
    extra_users: sub?.extra_users ?? 0,
    current_period_end: sub?.current_period_end?.slice?.(0, 10) ?? "",
    cancel_at_period_end: sub?.cancel_at_period_end ?? false,
    billing_cycle: sub?.billing_cycle ?? "monthly",
    currency: sub?.currency ?? "MAD",
    custom_price: sub?.custom_price ?? "",
  };

  const selectedPlan = useMemo(
    () => plans.find((p: any) => p.code === formReady.plan_code) as any,
    [plans, formReady.plan_code],
  );

  const catalogPrice = useMemo(() => {
    const plan = selectedPlan;
    const cycle = formReady.billing_cycle === "yearly" ? "yearly" : "monthly";
    const cur = formReady.currency || "MAD";
    return plan?.prices?.[cycle]?.[cur] ?? plan?.prices?.monthly?.MAD ?? null;
  }, [selectedPlan, formReady.billing_cycle, formReady.currency]);

  const planPreview = useMemo(() => {
    const lim = (selectedPlan?.limits ?? {}) as Record<string, boolean>;
    const modulesOn = PLATFORM_FEATURE_KEYS.filter((k) => {
      if (Object.prototype.hasOwnProperty.call(lim, k)) return lim[k] === true;
      return !["farm", "stock", "accounting"].includes(k);
    });
    const modulesOff = PLATFORM_FEATURE_KEYS.filter((k) => !modulesOn.includes(k));
    return {
      storage: selectedPlan?.storage_mb ?? "—",
      maxUsers: selectedPlan?.max_users ?? 1,
      maxClients: selectedPlan?.max_clients,
      maxAnimals: selectedPlan?.max_animals,
      modulesOn,
      modulesOff,
    };
  }, [selectedPlan]);

  const applyPlanSelection = (code: string) => {
    const plan = plans.find((p: any) => p.code === code);
    setForm({
      ...formReady,
      plan_code: code,
      storage_quota_mb: plan?.storage_mb ?? formReady.storage_quota_mb,
    });
    if (!keepFeatureOverrides) {
      setOverrides(emptyOverrides());
    }
  };

  const [payForm, setPayForm] = useState({
    amount: "",
    currency: "MAD",
    method: "virement" as PaymentMethod,
    reference: "",
    paid_at: new Date().toISOString().slice(0, 10),
    period_start: new Date().toISOString().slice(0, 10),
    period_end: "",
    notes: "",
    activate: true,
    status: "received" as "received" | "pending" | "refunded",
  });

  if (detail.isLoading) {
    return <div className="p-8 text-center text-muted-foreground">{t("superAdmin.orgDetail.loading")}</div>;
  }
  if (!org) {
    return (
      <div className="p-8 text-center space-y-3">
        <p>{t("superAdmin.orgDetail.notFound")}</p>
        <Button asChild variant="outline">
          <Link to="/super-admin/organizations">{tc("back")}</Link>
        </Button>
      </div>
    );
  }

  const f = form ?? formReady;
  const maxUsers =
    (selectedPlan?.max_users ?? plans.find((p: any) => p.code === f.plan_code)?.max_users ?? 1) +
    (Number(f.extra_users) || 0);
  const planChanged = (sub?.plan_code ?? "free") !== f.plan_code;

  const saveSub = async () => {
    setSaving(true);
    try {
      const plan = plans.find((p: any) => p.code === f.plan_code);
      await adminUpsertSubscription(org.id, {
        ...f,
        storage_quota_mb: Number(f.storage_quota_mb) || plan?.storage_mb || 200,
        storage_addon_mb: Number(f.storage_addon_mb) || 0,
        extra_users: Number(f.extra_users) || 0,
        current_period_end: f.current_period_end
          ? new Date(f.current_period_end).toISOString()
          : null,
        custom_price:
          f.custom_price === "" || f.custom_price === null || f.custom_price === undefined
            ? null
            : Number(f.custom_price),
        feature_overrides: toPayloadOverrides(overrides),
        keep_feature_overrides: keepFeatureOverrides,
      });
      toast({
        title: t("superAdmin.orgDetail.subscriptionUpdated"),
        description: planChanged
          ? t("superAdmin.orgDetail.planAppliedBody", {
              plan: plan?.name ?? f.plan_code,
              storage: Number(f.storage_quota_mb) || plan?.storage_mb || 0,
              users: maxUsers,
            })
          : undefined,
      });
      qc.invalidateQueries({ queryKey: ["super-admin"] });
      qc.invalidateQueries({ queryKey: ["plan-quota"] });
      detail.refetch();
    } catch (e: any) {
      toast({ title: tc("error"), description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async () => {
    const amount = Number(payForm.amount);
    if (!amount || amount < 0) {
      toast({
        title: tc("error"),
        description: t("superAdmin.payments.invalidAmount"),
        variant: "destructive",
      });
      return;
    }
    setPaying(true);
    try {
      await adminRecordSubscriptionPayment({
        organizationId: org.id,
        amount,
        currency: payForm.currency,
        method: payForm.method,
        reference: payForm.reference || null,
        paidAt: payForm.paid_at ? new Date(payForm.paid_at).toISOString() : null,
        periodStart: payForm.period_start ? new Date(payForm.period_start).toISOString() : null,
        periodEnd: payForm.period_end ? new Date(payForm.period_end).toISOString() : null,
        notes: payForm.notes || null,
        planCode: f.plan_code,
        activate: payForm.activate && payForm.status === "received",
        status: payForm.status,
      });
      toast({ title: t("superAdmin.payments.recorded") });
      paymentsQ.refetch();
      detail.refetch();
      qc.invalidateQueries({ queryKey: ["super-admin"] });
    } catch (e: any) {
      toast({ title: tc("error"), description: e.message, variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  const submitNote = async () => {
    if (!note.trim()) return;
    try {
      await addSupportNote(org.id, note.trim());
      setNote("");
      toast({ title: t("superAdmin.orgDetail.noteAdded") });
      detail.refetch();
    } catch (e: any) {
      toast({ title: tc("error"), description: e.message, variant: "destructive" });
    }
  };

  const updateUser = async (
    userId: string,
    patch: { role?: "admin" | "assistant"; status?: string },
  ) => {
    try {
      await adminSetOrgUser(userId, patch);
      toast({ title: t("superAdmin.orgDetail.userUpdated") });
      detail.refetch();
    } catch (e: any) {
      toast({ title: tc("error"), description: e.message, variant: "destructive" });
    }
  };

  const cycleOverride = (key: PlatformFeatureKey) => {
    setOverrides((prev) => {
      const cur = prev[key];
      const next = cur === null ? true : cur === true ? false : null;
      return { ...prev, [key]: next };
    });
  };

  const overrideLabel = (v: boolean | null | undefined) => {
    if (v === true) return t("superAdmin.features.on");
    if (v === false) return t("superAdmin.features.off");
    return t("superAdmin.features.inherit");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/super-admin/organizations">
              <ArrowLeft className="h-4 w-4 mr-1" /> {tc("back")}
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold font-display">{org.name}</h2>
            <p className="text-xs text-muted-foreground">
              {org.invitation_code || org.clinic_name || "—"} · {org.phone || "—"} ·{" "}
              {org.clinic_address || "—"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full gap-1"
            onClick={() => {
              const blob = new Blob([JSON.stringify(detail.data, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `vetocrm-org-export-${org.invitation_code || org.id}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-3.5 w-3.5" /> Export JSON
          </Button>
          <Input
            className="w-48 h-8 text-xs"
            placeholder="Raison support"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            className="rounded-full gap-1"
            size="sm"
            onClick={() => start.mutate({ orgId: org.id, reason })}
            disabled={start.isPending}
          >
            <Eye className="h-3.5 w-3.5" /> Voir comme cette clinique
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        {[
          ["Clients", usage?.clients],
          ["Animaux", usage?.animals],
          ["Users", `${usage?.users ?? 0} / ${maxUsers}`],
          ["Stockage", `${usage?.storage_mb ?? 0} Mo`],
        ].map(([l, v]) => (
          <Card key={String(l)}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="text-xl font-bold font-display">{v ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("superAdmin.orgDetail.subscriptionTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 text-sm flex-wrap">
              {planBadge(sub?.plan_code ?? "free")}
              {statusBadge(sub?.status ?? "active")}
            </div>
            <div>
              <Label>Plan</Label>
              <Select value={f.plan_code} onValueChange={applyPlanSelection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p: any) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name} ({p.code}) — {p.storage_mb} Mo · {p.max_users ?? 1} user
                      {p.max_users > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPlan && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1.5">
                <p className="font-medium text-sm">{t("superAdmin.orgDetail.planPreviewTitle")}</p>
                <p>
                  {t("superAdmin.orgDetail.planPreviewStorage", { mb: planPreview.storage })}
                  {" · "}
                  {t("superAdmin.orgDetail.planPreviewUsers", {
                    n: Number(planPreview.maxUsers) + (Number(f.extra_users) || 0),
                  })}
                  {" · "}
                  {t("superAdmin.orgDetail.planPreviewClients", {
                    n:
                      planPreview.maxClients == null
                        ? t("superAdmin.orgDetail.unlimited")
                        : planPreview.maxClients,
                  })}
                  {" · "}
                  {t("superAdmin.orgDetail.planPreviewAnimals", {
                    n:
                      planPreview.maxAnimals == null
                        ? t("superAdmin.orgDetail.unlimited")
                        : planPreview.maxAnimals,
                  })}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400">
                  {t("superAdmin.orgDetail.modulesOn")}:{" "}
                  {planPreview.modulesOn.map((k) => t(`superAdmin.features.keys.${k}`)).join(", ") || "—"}
                </p>
                {planPreview.modulesOff.length > 0 && (
                  <p className="text-muted-foreground">
                    {t("superAdmin.orgDetail.modulesOff")}:{" "}
                    {planPreview.modulesOff.map((k) => t(`superAdmin.features.keys.${k}`)).join(", ")}
                  </p>
                )}
                {planChanged && (
                  <p className="text-amber-700 dark:text-amber-400">
                    {t("superAdmin.orgDetail.planChangeHint")}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 rounded border p-2">
              <Checkbox
                id="keep-overrides"
                checked={keepFeatureOverrides}
                onCheckedChange={(c) => setKeepFeatureOverrides(c === true)}
              />
              <Label htmlFor="keep-overrides" className="text-sm font-normal cursor-pointer">
                {t("superAdmin.orgDetail.keepFeatureOverrides")}
              </Label>
            </div>
            <div>
              <Label>{t("superAdmin.orgDetail.statusLabel")}</Label>
              <Select value={f.status} onValueChange={(v) => setForm({ ...f, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t("superAdmin.orgDetail.billingCycle")}</Label>
                <Select
                  value={f.billing_cycle}
                  onValueChange={(v) => setForm({ ...f, billing_cycle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">monthly</SelectItem>
                    <SelectItem value="yearly">yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("superAdmin.orgDetail.currency")}</Label>
                <Select value={f.currency} onValueChange={(v) => setForm({ ...f, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["MAD", "EUR", "USD"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("superAdmin.orgDetail.customPrice")}</Label>
              <Input
                type="number"
                step="0.01"
                placeholder={
                  catalogPrice != null
                    ? t("superAdmin.orgDetail.catalogPriceHint", { price: catalogPrice })
                    : t("superAdmin.orgDetail.customPricePlaceholder")
                }
                value={f.custom_price}
                onChange={(e) => setForm({ ...f, custom_price: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("superAdmin.orgDetail.customPriceHelp")}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Quota Mo</Label>
                <Input
                  type="number"
                  value={f.storage_quota_mb}
                  onChange={(e) => setForm({ ...f, storage_quota_mb: e.target.value })}
                />
              </div>
              <div>
                <Label>Addon Mo</Label>
                <Input
                  type="number"
                  value={f.storage_addon_mb}
                  onChange={(e) => setForm({ ...f, storage_addon_mb: e.target.value })}
                />
              </div>
              <div>
                <Label>Extra users</Label>
                <Input
                  type="number"
                  value={f.extra_users}
                  onChange={(e) => setForm({ ...f, extra_users: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Fin de période</Label>
              <Input
                type="date"
                value={f.current_period_end}
                onChange={(e) => setForm({ ...f, current_period_end: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded border p-2">
              <Label>{t("superAdmin.orgDetail.cancelAtPeriodEnd")}</Label>
              <Switch
                checked={!!f.cancel_at_period_end}
                onCheckedChange={(c) => setForm({ ...f, cancel_at_period_end: c })}
              />
            </div>
            <Button onClick={saveSub} disabled={saving} className="rounded-full gap-1">
              <Save className="h-4 w-4" />
              {saving
                ? t("superAdmin.orgDetail.savingSubscription")
                : t("superAdmin.orgDetail.saveSubscription")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("superAdmin.features.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">{t("superAdmin.features.help")}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {PLATFORM_FEATURE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => cycleOverride(key)}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/50 text-left"
                >
                  <span>{t(`superAdmin.features.keys.${key}`)}</span>
                  <span
                    className={
                      overrides[key] === true
                        ? "text-emerald-600 text-xs font-medium"
                        : overrides[key] === false
                          ? "text-destructive text-xs font-medium"
                          : "text-muted-foreground text-xs"
                    }
                  >
                    {overrideLabel(overrides[key])}
                  </span>
                </button>
              ))}
            </div>
            <Button onClick={saveSub} disabled={saving} variant="outline" className="rounded-full gap-1 mt-2">
              <Save className="h-4 w-4" />
              {t("superAdmin.features.save")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              {t("superAdmin.payments.recordTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t("superAdmin.payments.amount")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("superAdmin.payments.method")}</Label>
                <Select
                  value={payForm.method}
                  onValueChange={(v) => setPayForm({ ...payForm, method: v as PaymentMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {t(`superAdmin.payments.methods.${m}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("superAdmin.payments.reference")}</Label>
              <Input
                value={payForm.reference}
                onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
                placeholder="Réf. virement / chèque"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>{t("superAdmin.payments.paidAt")}</Label>
                <Input
                  type="date"
                  value={payForm.paid_at}
                  onChange={(e) => setPayForm({ ...payForm, paid_at: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("superAdmin.payments.periodStart")}</Label>
                <Input
                  type="date"
                  value={payForm.period_start}
                  onChange={(e) => setPayForm({ ...payForm, period_start: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("superAdmin.payments.periodEnd")}</Label>
                <Input
                  type="date"
                  value={payForm.period_end}
                  onChange={(e) => setPayForm({ ...payForm, period_end: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>{t("superAdmin.payments.status")}</Label>
              <Select
                value={payForm.status}
                onValueChange={(v) =>
                  setPayForm({ ...payForm, status: v as "received" | "pending" | "refunded" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">{t("superAdmin.payments.statuses.received")}</SelectItem>
                  <SelectItem value="pending">{t("superAdmin.payments.statuses.pending")}</SelectItem>
                  <SelectItem value="refunded">{t("superAdmin.payments.statuses.refunded")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              rows={2}
              placeholder={t("superAdmin.payments.notes")}
              value={payForm.notes}
              onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="activate"
                checked={payForm.activate}
                onCheckedChange={(c) => setPayForm({ ...payForm, activate: !!c })}
              />
              <Label htmlFor="activate" className="text-sm font-normal cursor-pointer">
                {t("superAdmin.payments.activateAccess")}
              </Label>
            </div>
            <Button onClick={submitPayment} disabled={paying} className="rounded-full gap-1">
              <Banknote className="h-4 w-4" />
              {paying ? t("superAdmin.payments.saving") : t("superAdmin.payments.save")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("superAdmin.payments.historyTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left sticky top-0">
                <tr>
                  <th className="p-2">{t("superAdmin.payments.paidAt")}</th>
                  <th className="p-2">{t("superAdmin.payments.amount")}</th>
                  <th className="p-2">{t("superAdmin.payments.method")}</th>
                  <th className="p-2">{t("superAdmin.payments.status")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-3 text-muted-foreground text-xs">
                      {t("superAdmin.payments.empty")}
                    </td>
                  </tr>
                )}
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2 text-xs">
                      {new Date(p.paid_at).toLocaleDateString("fr-FR")}
                      {p.reference ? (
                        <div className="text-muted-foreground">{p.reference}</div>
                      ) : null}
                    </td>
                    <td className="p-2 font-medium">{formatMoney(Number(p.amount), p.currency)}</td>
                    <td className="p-2 text-xs">{t(`superAdmin.payments.methods.${p.method}`)}</td>
                    <td className="p-2 text-xs">{t(`superAdmin.payments.statuses.${p.status}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("superAdmin.orgDetail.teamTitle")} ({usage?.users ?? users.length} / {maxUsers})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left">
                <tr>
                  <th className="p-2">Nom</th>
                  <th className="p-2">Rôle</th>
                  <th className="p-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">{u.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="p-2">
                      {u.role === "super_admin" ? (
                        u.role
                      ) : (
                        <Select
                          value={u.role === "admin" || u.role === "assistant" ? u.role : "assistant"}
                          onValueChange={(v) =>
                            updateUser(u.id, { role: v as "admin" | "assistant" })
                          }
                        >
                          <SelectTrigger className="h-8 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="assistant">assistant</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="p-2">
                      {u.role === "super_admin" ? (
                        statusBadge(u.status)
                      ) : (
                        <Select
                          value={u.status}
                          onValueChange={(v) => updateUser(u.id, { status: v })}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["approved", "pending", "suspended", "rejected"].map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={3}
              placeholder="Note interne…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button size="sm" className="rounded-full" onClick={submitNote}>
              Ajouter
            </Button>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notes.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucune note</p>
              )}
              {notes.map((n: any) => (
                <div key={n.id} className="rounded-lg border p-2 text-sm">
                  <p>{n.body}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {n.author_email} · {new Date(n.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Audit récent</p>
              {audit.length === 0 && <p className="text-xs text-muted-foreground">Aucun événement</p>}
              {audit.slice(0, 8).map((a: any) => (
                <div key={a.id} className="text-xs border rounded-lg p-2">
                  <div className="font-medium">{a.action}</div>
                  <div className="text-muted-foreground">
                    {a.actor_email} · {new Date(a.created_at).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
