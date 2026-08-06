import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchBillingOverview,
  formatMad,
  formatMoney,
  adminListSubscriptionPayments,
  adminRecordSubscriptionPayment,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/superAdmin";
import { useAllOrganizations } from "@/hooks/useSuperAdminData";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, AlertTriangle, Clock, Banknote, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function SuperAdminBilling() {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paying, setPaying] = useState(false);

  const billing = useQuery({
    queryKey: ["super-admin", "billing"],
    queryFn: fetchBillingOverview,
  });
  const paymentsQ = useQuery({
    queryKey: ["super-admin", "payments", "all"],
    queryFn: () => adminListSubscriptionPayments(null, 200),
  });
  const { data: orgs = [] } = useAllOrganizations();

  const pastDue = orgs.filter((o) => o.subscription?.status === "past_due");
  const trials = orgs.filter((o) => o.subscription?.status === "trialing");
  const withStripe = orgs.filter(
    (o) => o.subscription?.stripe_customer_id || o.subscription?.stripe_subscription_id,
  );

  const d = billing.data;
  const payments = useMemo(() => {
    let list = paymentsQ.data ?? [];
    if (methodFilter !== "all") list = list.filter((p: any) => p.method === methodFilter);
    if (statusFilter !== "all") list = list.filter((p: any) => p.status === statusFilter);
    return list;
  }, [paymentsQ.data, methodFilter, statusFilter]);

  const [payForm, setPayForm] = useState({
    organizationId: "",
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

  const submitPayment = async () => {
    const amount = Number(payForm.amount);
    if (!payForm.organizationId || !amount || amount < 0) {
      toast({
        title: tc("error"),
        description: t("superAdmin.payments.invalidAmount"),
        variant: "destructive",
      });
      return;
    }
    setPaying(true);
    try {
      const org = orgs.find((o) => o.id === payForm.organizationId);
      await adminRecordSubscriptionPayment({
        organizationId: payForm.organizationId,
        amount,
        currency: payForm.currency,
        method: payForm.method,
        reference: payForm.reference || null,
        paidAt: payForm.paid_at ? new Date(payForm.paid_at).toISOString() : null,
        periodStart: payForm.period_start ? new Date(payForm.period_start).toISOString() : null,
        periodEnd: payForm.period_end ? new Date(payForm.period_end).toISOString() : null,
        notes: payForm.notes || null,
        planCode: org?.subscription?.plan_code ?? null,
        activate: payForm.activate && payForm.status === "received",
        status: payForm.status,
      });
      toast({ title: t("superAdmin.payments.recorded") });
      setOpen(false);
      paymentsQ.refetch();
      billing.refetch();
      qc.invalidateQueries({ queryKey: ["super-admin"] });
    } catch (e: any) {
      toast({ title: tc("error"), description: e.message, variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-1">
              <Plus className="h-4 w-4" />
              {t("superAdmin.payments.recordCta")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("superAdmin.payments.recordTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t("superAdmin.payments.organization")}</Label>
                <Select
                  value={payForm.organizationId}
                  onValueChange={(v) => setPayForm({ ...payForm, organizationId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Clinique…" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{t("superAdmin.payments.amount")}</Label>
                  <Input
                    type="number"
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
              <Textarea
                rows={2}
                value={payForm.notes}
                onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                placeholder={t("superAdmin.payments.notes")}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="act"
                  checked={payForm.activate}
                  onCheckedChange={(c) => setPayForm({ ...payForm, activate: !!c })}
                />
                <Label htmlFor="act" className="font-normal text-sm">
                  {t("superAdmin.payments.activateAccess")}
                </Label>
              </div>
              <Button onClick={submitPayment} disabled={paying} className="w-full rounded-full gap-1">
                <Banknote className="h-4 w-4" />
                {paying ? t("superAdmin.payments.saving") : t("superAdmin.payments.save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> {t("superAdmin.billing.mrr")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">
              {billing.isLoading ? "…" : formatMad(Number(d?.estimated_mrr_mad ?? 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("superAdmin.billing.mrrHelp")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-600" /> {t("superAdmin.billing.receivedMonth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMad(Number(d?.payments_received_month ?? 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {d?.payments_count_month ?? 0} {t("superAdmin.billing.payments")}
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
            <p className="text-xs text-muted-foreground mt-1">
              {t("superAdmin.billing.pending")}: {formatMad(Number(d?.payments_pending ?? 0))}
            </p>
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
            <p className="text-xs text-muted-foreground mt-1">
              Stripe: {d?.with_stripe ?? withStripe.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">{t("superAdmin.payments.ledgerTitle")}</CardTitle>
          <div className="flex gap-2">
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="h-8 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("superAdmin.payments.allMethods")}</SelectItem>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {t(`superAdmin.payments.methods.${m}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("superAdmin.payments.allStatuses")}</SelectItem>
                {["received", "pending", "refunded"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`superAdmin.payments.statuses.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-2">{t("superAdmin.payments.paidAt")}</th>
                <th className="p-2">{t("superAdmin.payments.organization")}</th>
                <th className="p-2">{t("superAdmin.payments.amount")}</th>
                <th className="p-2">{t("superAdmin.payments.method")}</th>
                <th className="p-2">{t("superAdmin.payments.status")}</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-muted-foreground text-sm">
                    {t("superAdmin.payments.empty")}
                  </td>
                </tr>
              )}
              {payments.map((p: any) => (
                <tr key={p.id} className="border-b">
                  <td className="p-2 text-xs">{new Date(p.paid_at).toLocaleDateString("fr-FR")}</td>
                  <td className="p-2">
                    <div className="font-medium">{p.organization_name}</div>
                    {p.reference ? (
                      <div className="text-xs text-muted-foreground">{p.reference}</div>
                    ) : null}
                  </td>
                  <td className="p-2 font-medium">{formatMoney(Number(p.amount), p.currency)}</td>
                  <td className="p-2 text-xs">{t(`superAdmin.payments.methods.${p.method}`)}</td>
                  <td className="p-2 text-xs">{t(`superAdmin.payments.statuses.${p.status}`)}</td>
                  <td className="p-2">
                    <Button size="sm" variant="ghost" className="rounded-full h-7" asChild>
                      <Link to={`/super-admin/organizations/${p.organization_id}`}>Ouvrir</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

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
            <div
              key={o.id}
              className="flex items-center justify-between gap-2 rounded-lg border p-2 text-sm"
            >
              <div>
                <div className="font-medium">{o.name}</div>
                <div className="text-xs text-muted-foreground">
                  {o.subscription?.plan_code} · {o.subscription?.status}
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-full" asChild>
                <Link to={`/super-admin/organizations/${o.id}`}>Ouvrir</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
