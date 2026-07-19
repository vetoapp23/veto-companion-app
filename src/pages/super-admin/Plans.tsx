import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAllPlans } from "@/hooks/useSuperAdminData";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/superAdmin";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";

const CURRENCIES = ["MAD", "EUR", "USD"] as const;
const CYCLES = ["monthly", "yearly"] as const;

function emptyPrices() {
  const p: any = { monthly: {}, yearly: {} };
  CURRENCIES.forEach((c) => {
    p.monthly[c] = 0;
    p.yearly[c] = 0;
  });
  return p;
}

export default function SuperAdminPlans() {
  const { data: plans = [], isLoading, refetch } = useAllPlans();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="rounded-full"
          onClick={() =>
            setEditing({
              code: "",
              name: "",
              display_order: 99,
              is_active: true,
              storage_mb: 200,
              max_users: 1,
              max_clients: "",
              max_animals: "",
              features: [],
              prices: emptyPrices(),
              limits: {},
            })
          }
        >
          <Plus className="h-4 w-4 mr-1" /> Nouveau plan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Nom</th>
                <th className="p-3">Stockage</th>
                <th className="p-3">Users</th>
                <th className="p-3">Clients</th>
                <th className="p-3">Animaux</th>
                <th className="p-3">Prix MAD/mois</th>
                <th className="p-3">Actif</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>
              )}
              {plans.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-muted/20">
                  <td className="p-3 font-mono">{p.code}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.storage_mb} Mo</td>
                  <td className="p-3">{p.max_users}</td>
                  <td className="p-3">{p.max_clients ?? "∞"}</td>
                  <td className="p-3">{p.max_animals ?? "∞"}</td>
                  <td className="p-3">{p.prices?.monthly?.MAD ?? 0}</td>
                  <td className="p-3">{p.is_active ? "✓" : "—"}</td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditing(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {editing && (
        <PlanDialog
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ["super-admin"] });
            qc.invalidateQueries({ queryKey: ["plan-quota"] });
            refetch();
            toast({ title: "Plan enregistré" });
          }}
        />
      )}
    </div>
  );
}

function PlanDialog({ plan, onClose, onSaved }: any) {
  const { toast } = useToast();
  const isNew = !plan.id;
  const limits = plan.limits && typeof plan.limits === "object" ? plan.limits : {};
  const pricesIn = plan.prices && typeof plan.prices === "object" ? plan.prices : emptyPrices();

  const [form, setForm] = useState<any>({
    code: plan.code ?? "",
    name: plan.name ?? "",
    tagline: plan.tagline ?? "",
    description: plan.description ?? "",
    display_order: plan.display_order ?? 99,
    is_active: plan.is_active ?? true,
    is_highlighted: plan.is_highlighted ?? false,
    storage_mb: plan.storage_mb ?? 0,
    max_users: plan.max_users ?? 1,
    max_clients: plan.max_clients ?? "",
    max_animals: plan.max_animals ?? "",
    limit_farm: !!limits.farm,
    limit_stock: !!limits.stock,
    limit_accounting: !!limits.accounting,
    features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
    prices: {
      monthly: { ...emptyPrices().monthly, ...(pricesIn.monthly || {}) },
      yearly: { ...emptyPrices().yearly, ...(pricesIn.yearly || {}) },
    },
  });
  const [saving, setSaving] = useState(false);

  const setPrice = (cycle: string, cur: string, val: string) => {
    setForm((f: any) => ({
      ...f,
      prices: {
        ...f.prices,
        [cycle]: { ...f.prices[cycle], [cur]: Number(val) || 0 },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        code: form.code.trim(),
        name: form.name.trim(),
        tagline: form.tagline || null,
        description: form.description || null,
        display_order: Number(form.display_order) || 0,
        is_active: !!form.is_active,
        is_highlighted: !!form.is_highlighted,
        storage_mb: Number(form.storage_mb) || 0,
        max_users: Number(form.max_users) || 1,
        max_clients: form.max_clients === "" ? null : Number(form.max_clients),
        max_animals: form.max_animals === "" ? null : Number(form.max_animals),
        limits: {
          farm: !!form.limit_farm,
          stock: !!form.limit_stock,
          accounting: !!form.limit_accounting,
        },
        features: form.features.split("\n").map((l: string) => l.trim()).filter(Boolean),
        prices: form.prices,
      };
      if (isNew) {
        const { error } = await supabase.from("subscription_plans").insert(payload);
        if (error) throw error;
        await logAdminAction({ action: "plan.create", resourceType: "subscription_plan", resourceId: payload.code, after: payload });
      } else {
        const { error } = await supabase.from("subscription_plans").update(payload).eq("id", plan.id);
        if (error) throw error;
        await logAdminAction({ action: "plan.update", resourceType: "subscription_plan", resourceId: plan.id, before: plan, after: payload });
      }
      onSaved();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer le plan ${plan.code} ?`)) return;
    const { error } = await supabase.from("subscription_plans").delete().eq("id", plan.id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else {
      await logAdminAction({ action: "plan.delete", resourceType: "subscription_plan", resourceId: plan.id, before: plan });
      onSaved();
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nouveau plan" : `Éditer ${plan.name}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Code</Label><Input value={form.code} disabled={!isNew} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <div><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-4 gap-2">
            <div><Label>Ordre</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} /></div>
            <div><Label>Stockage Mo</Label><Input type="number" value={form.storage_mb} onChange={(e) => setForm({ ...form, storage_mb: e.target.value })} /></div>
            <div><Label>Max users</Label><Input type="number" value={form.max_users} onChange={(e) => setForm({ ...form, max_users: e.target.value })} /></div>
            <div><Label>Max clients</Label><Input type="number" value={form.max_clients} placeholder="∞" onChange={(e) => setForm({ ...form, max_clients: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Max animaux</Label><Input type="number" value={form.max_animals} placeholder="∞" onChange={(e) => setForm({ ...form, max_animals: e.target.value })} /></div>
            <div className="flex items-end gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} /> Actif</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_highlighted} onCheckedChange={(c) => setForm({ ...form, is_highlighted: c })} /> Mis en avant</label>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 rounded border p-3">
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.limit_farm} onCheckedChange={(c) => setForm({ ...form, limit_farm: c })} /> Fermes</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.limit_stock} onCheckedChange={(c) => setForm({ ...form, limit_stock: c })} /> Stock</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.limit_accounting} onCheckedChange={(c) => setForm({ ...form, limit_accounting: c })} /> Comptabilité</label>
          </div>

          <div>
            <Label className="mb-2 block">Tarifs</Label>
            <div className="rounded border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-2 text-left">Cycle</th>
                    {CURRENCIES.map((c) => <th key={c} className="p-2">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {CYCLES.map((cycle) => (
                    <tr key={cycle} className="border-t">
                      <td className="p-2 font-medium">{cycle === "monthly" ? "Mensuel" : "Annuel"}</td>
                      {CURRENCIES.map((c) => (
                        <td key={c} className="p-2">
                          <Input
                            type="number"
                            className="h-8"
                            value={form.prices[cycle][c] ?? 0}
                            onChange={(e) => setPrice(cycle, c, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <Label>Fonctionnalités (une par ligne)</Label>
            <Textarea rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          {!isNew && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "…" : "Enregistrer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
