import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrgDetail,
  adminUpsertSubscription,
  addSupportNote,
} from "@/lib/superAdmin";
import { useAllPlans } from "@/hooks/useSuperAdminData";
import { useImpersonation } from "@/components/ImpersonationBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, Save, Download } from "lucide-react";
import { planBadge, statusBadge } from "./Overview";

const SUB_STATUSES = ["active", "trialing", "past_due", "canceled", "suspended"];

export default function SuperAdminOrgDetail() {
  const { orgId } = useParams<{ orgId: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: plans = [] } = useAllPlans();
  const { start } = useImpersonation();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState("Support client");

  const detail = useQuery({
    queryKey: ["super-admin", "org", orgId],
    enabled: !!orgId,
    queryFn: () => fetchOrgDetail(orgId!),
  });

  const org = detail.data?.organization;
  const sub = detail.data?.subscription;
  const usage = detail.data?.usage;
  const users = detail.data?.users ?? [];
  const notes = detail.data?.notes ?? [];
  const audit = detail.data?.recent_audit ?? [];

  const [form, setForm] = useState<any>(null);
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
  };

  if (detail.isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement de la fiche…</div>;
  }
  if (!org) {
    return (
      <div className="p-8 text-center space-y-3">
        <p>Clinique introuvable</p>
        <Button asChild variant="outline">
          <Link to="/super-admin/organizations">Retour</Link>
        </Button>
      </div>
    );
  }

  const f = form ?? formReady;

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
      });
      toast({ title: "Abonnement mis à jour" });
      qc.invalidateQueries({ queryKey: ["super-admin"] });
      detail.refetch();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const submitNote = async () => {
    if (!note.trim()) return;
    try {
      await addSupportNote(org.id, note.trim());
      setNote("");
      toast({ title: "Note ajoutée" });
      detail.refetch();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/super-admin/organizations">
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
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
          ["Users", usage?.users],
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
            <CardTitle className="text-base">Abonnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 text-sm">
              {planBadge(sub?.plan_code ?? "free")}
              {statusBadge(sub?.status ?? "active")}
              {sub?.stripe_customer_id && (
                <span className="text-xs text-muted-foreground">Stripe: {sub.stripe_customer_id}</span>
              )}
            </div>
            <div>
              <Label>Plan</Label>
              <Select
                value={f.plan_code}
                onValueChange={(v) => {
                  const plan = plans.find((p: any) => p.code === v);
                  setForm({
                    ...f,
                    plan_code: v,
                    storage_quota_mb: plan?.storage_mb ?? f.storage_quota_mb,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p: any) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut (enforced)</Label>
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
              <p className="text-xs text-muted-foreground mt-1">
                suspended/canceled = accès coupé · past_due = lecture seule
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
              <Label>Annuler en fin de période</Label>
              <Switch
                checked={!!f.cancel_at_period_end}
                onCheckedChange={(c) => setForm({ ...f, cancel_at_period_end: c })}
              />
            </div>
            <Button onClick={saveSub} disabled={saving} className="rounded-full gap-1">
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement…" : "Enregistrer l'abonnement"}
            </Button>
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
            <div className="space-y-2 max-h-64 overflow-y-auto">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilisateurs ({users.length})</CardTitle>
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
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">{statusBadge(u.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audit récent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {audit.length === 0 && <p className="text-xs text-muted-foreground">Aucun événement</p>}
            {audit.map((a: any) => (
              <div key={a.id} className="text-xs border rounded-lg p-2">
                <div className="font-medium">{a.action}</div>
                <div className="text-muted-foreground">
                  {a.actor_email} · {new Date(a.created_at).toLocaleString("fr-FR")}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
