import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAllOrganizations, useAllUsers, useAllPlans } from "@/hooks/useSuperAdminData";
import { Search, RefreshCw, Building2, Users, Package, Shield, Trash2, Pencil, Plus } from "lucide-react";

const PLAN_CODES = ["free", "pro", "pro_plus", "duo", "clinic"];
const SUB_STATUSES = ["active", "trialing", "past_due", "canceled", "suspended"];
const USER_STATUSES = ["pending", "approved", "rejected", "suspended"];
const USER_ROLES = ["assistant", "admin", "super_admin"];

function planBadge(code: string) {
  const colors: Record<string, string> = {
    free: "bg-muted text-foreground",
    pro: "bg-blue-100 text-blue-800",
    pro_plus: "bg-indigo-100 text-indigo-800",
    duo: "bg-purple-100 text-purple-800",
    clinic: "bg-emerald-100 text-emerald-800",
  };
  return <Badge className={colors[code] ?? "bg-muted"}>{code}</Badge>;
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    trialing: "bg-blue-100 text-blue-800",
    past_due: "bg-amber-100 text-amber-800",
    canceled: "bg-gray-200 text-gray-800",
    suspended: "bg-red-100 text-red-800",
    approved: "bg-green-100 text-green-800",
    pending: "bg-amber-100 text-amber-800",
    rejected: "bg-red-100 text-red-800",
  };
  return <Badge className={colors[status] ?? "bg-muted"}>{status}</Badge>;
}

/* ---------------- Organisations Tab ---------------- */
function OrgsTab() {
  const { data: orgs = [], isLoading, refetch } = useAllOrganizations();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<any | null>(null);

  const filtered = useMemo(() => {
    return orgs.filter((o) => {
      const s = search.toLowerCase();
      const matchesSearch =
        !s ||
        o.name.toLowerCase().includes(s) ||
        o.code?.toLowerCase().includes(s);
      const plan = o.subscription?.plan_code ?? "free";
      const stat = o.subscription?.status ?? "active";
      return (
        matchesSearch &&
        (planFilter === "all" || plan === planFilter) &&
        (statusFilter === "all" || stat === statusFilter)
      );
    });
  }, [orgs, search, planFilter, statusFilter]);

  const refreshAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["super-admin"] }),
    ]);
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher (nom / code)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Plan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les plans</SelectItem>
            {PLAN_CODES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {SUB_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={refreshAll}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Clinique</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Utilisateurs</th>
                <th className="p-3">Stockage</th>
                <th className="p-3">Période</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Aucune organisation</td></tr>
              )}
              {filtered.map((o) => {
                const quota = (o.subscription?.storage_quota_mb ?? 200) + (o.subscription?.storage_addon_mb ?? 0);
                const pct = quota > 0 ? Math.round((o.storage_used_mb / quota) * 100) : 0;
                return (
                  <tr key={o.id} className="border-b hover:bg-muted/20">
                    <td className="p-3">
                      <div className="font-medium">{o.name}</div>
                      <div className="text-xs text-muted-foreground">{o.code}</div>
                    </td>
                    <td className="p-3">{planBadge(o.subscription?.plan_code ?? "free")}</td>
                    <td className="p-3">{statusBadge(o.subscription?.status ?? "active")}</td>
                    <td className="p-3">{o.users_count}</td>
                    <td className="p-3">
                      <div className="text-xs">{o.storage_used_mb} / {quota} Mo</div>
                      <div className="h-1.5 w-24 rounded bg-muted overflow-hidden mt-1">
                        <div
                          className={`h-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-primary"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3 text-xs">
                      {o.subscription?.current_period_end
                        ? `→ ${new Date(o.subscription.current_period_end).toLocaleDateString()}`
                        : "—"}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" onClick={() => setEditing(o)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Gérer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {editing && (
        <OrgEditDialog
          org={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refreshAll(); toast({ title: "Organisation mise à jour" }); }}
        />
      )}
    </div>
  );
}

function OrgEditDialog({ org, onClose, onSaved }: any) {
  const { toast } = useToast();
  const sub = org.subscription;
  const [form, setForm] = useState({
    plan_code: sub?.plan_code ?? "free",
    status: sub?.status ?? "active",
    storage_quota_mb: sub?.storage_quota_mb ?? 200,
    storage_addon_mb: sub?.storage_addon_mb ?? 0,
    extra_users: sub?.extra_users ?? 0,
    current_period_end: sub?.current_period_end?.slice(0, 10) ?? "",
    cancel_at_period_end: sub?.cancel_at_period_end ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        plan_code: form.plan_code,
        status: form.status,
        storage_quota_mb: Number(form.storage_quota_mb) || 0,
        storage_addon_mb: Number(form.storage_addon_mb) || 0,
        extra_users: Number(form.extra_users) || 0,
        cancel_at_period_end: form.cancel_at_period_end,
        current_period_end: form.current_period_end ? new Date(form.current_period_end).toISOString() : null,
      };
      if (sub?.id) {
        const { error } = await supabase
          .from("organization_subscriptions")
          .update(payload)
          .eq("id", sub.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("organization_subscriptions").insert({
          ...payload,
          organization_id: org.id,
          current_period_start: new Date().toISOString(),
        });
        if (error) throw error;
      }
      onSaved();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gérer l'abonnement — {org.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Plan</Label>
            <Select value={form.plan_code} onValueChange={(v) => setForm({ ...form, plan_code: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PLAN_CODES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Statut</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SUB_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Quota (Mo)</Label>
              <Input type="number" value={form.storage_quota_mb}
                onChange={(e) => setForm({ ...form, storage_quota_mb: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Addon (Mo)</Label>
              <Input type="number" value={form.storage_addon_mb}
                onChange={(e) => setForm({ ...form, storage_addon_mb: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Extra users</Label>
              <Input type="number" value={form.extra_users}
                onChange={(e) => setForm({ ...form, extra_users: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Fin de période</Label>
            <Input type="date" value={form.current_period_end}
              onChange={(e) => setForm({ ...form, current_period_end: e.target.value })} />
          </div>
          <div className="flex items-center justify-between rounded border p-2">
            <Label>Annuler à la fin de période</Label>
            <Switch
              checked={form.cancel_at_period_end}
              onCheckedChange={(c) => setForm({ ...form, cancel_at_period_end: c })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Users Tab ---------------- */
function UsersTab() {
  const { data: users = [], isLoading, refetch } = useAllUsers();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return users.filter((u: any) =>
      (!s ||
        u.email?.toLowerCase().includes(s) ||
        u.full_name?.toLowerCase().includes(s) ||
        u.organization?.name?.toLowerCase().includes(s)) &&
      (statusFilter === "all" || u.status === statusFilter) &&
      (roleFilter === "all" || u.role === roleFilter)
    );
  }, [users, search, statusFilter, roleFilter]);

  const update = async (id: string, patch: any, label: string) => {
    const { error } = await supabase.from("user_profiles").update(patch).eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else {
      toast({ title: label });
      qc.invalidateQueries({ queryKey: ["super-admin"] });
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher (email / nom / clinique)"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {USER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Rôle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {USER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Clinique</th>
                <th className="p-3">Rôle</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun utilisateur</td></tr>}
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-b hover:bg-muted/20">
                  <td className="p-3">
                    <div className="font-medium">{u.full_name || u.username}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="p-3 text-xs">{u.organization?.name ?? "—"}</td>
                  <td className="p-3">
                    <Select value={u.role} onValueChange={(v) => update(u.id, { role: v }, "Rôle mis à jour")}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{USER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">{statusBadge(u.status)}</td>
                  <td className="p-3 space-x-1">
                    {u.status !== "approved" && (
                      <Button size="sm" variant="outline" onClick={() => update(u.id, { status: "approved", approved_at: new Date().toISOString() }, "Approuvé")}>Approuver</Button>
                    )}
                    {u.status !== "suspended" && (
                      <Button size="sm" variant="outline" onClick={() => update(u.id, { status: "suspended" }, "Suspendu")}>Suspendre</Button>
                    )}
                    {u.status !== "rejected" && (
                      <Button size="sm" variant="outline" onClick={() => update(u.id, { status: "rejected" }, "Rejeté")}>Rejeter</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Plans Tab ---------------- */
function PlansTab() {
  const { data: plans = [], isLoading, refetch } = useAllPlans();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({ code: "", name: "", display_order: 99, is_active: true, storage_mb: 0, max_users: 1, max_clients: null, max_animals: null, features: [], prices: {}, limits: {} })}>
          <Plus className="h-4 w-4 mr-1" /> Nouveau plan
        </Button>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Code</th>
                <th className="p-3">Nom</th>
                <th className="p-3">Stockage</th>
                <th className="p-3">Max users</th>
                <th className="p-3">Max clients</th>
                <th className="p-3">Actif</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>}
              {plans.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-muted/20">
                  <td className="p-3 font-mono">{p.code}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.storage_mb} Mo</td>
                  <td className="p-3">{p.max_users}</td>
                  <td className="p-3">{p.max_clients ?? "∞"}</td>
                  <td className="p-3">{p.is_active ? "✓" : "—"}</td>
                  <td className="p-3 space-x-1">
                    <Button size="sm" variant="outline" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {editing && (
        <PlanEditDialog
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["super-admin"] }); refetch(); toast({ title: "Plan enregistré" }); }}
        />
      )}
    </div>
  );
}

function PlanEditDialog({ plan, onClose, onSaved }: any) {
  const { toast } = useToast();
  const isNew = !plan.id;
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
    features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
    prices: JSON.stringify(plan.prices ?? {}, null, 2),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      let prices: any = {};
      try { prices = JSON.parse(form.prices || "{}"); } catch { throw new Error("Prix : JSON invalide"); }
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
        features: form.features.split("\n").map((l: string) => l.trim()).filter(Boolean),
        prices,
      };
      if (isNew) {
        const { error } = await supabase.from("subscription_plans").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscription_plans").update(payload).eq("id", plan.id);
        if (error) throw error;
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
    else onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? "Nouveau plan" : `Éditer ${plan.name}`}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={!isNew} /></div>
            <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <div><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-4 gap-2">
            <div><Label>Ordre</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} /></div>
            <div><Label>Stockage Mo</Label><Input type="number" value={form.storage_mb} onChange={(e) => setForm({ ...form, storage_mb: e.target.value })} /></div>
            <div><Label>Max users</Label><Input type="number" value={form.max_users} onChange={(e) => setForm({ ...form, max_users: e.target.value })} /></div>
            <div><Label>Max clients</Label><Input type="number" value={form.max_clients} onChange={(e) => setForm({ ...form, max_clients: e.target.value })} placeholder="∞" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Max animaux</Label><Input type="number" value={form.max_animals} onChange={(e) => setForm({ ...form, max_animals: e.target.value })} placeholder="∞" /></div>
            <div className="flex items-end gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} /><Label>Actif</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_highlighted} onCheckedChange={(c) => setForm({ ...form, is_highlighted: c })} /><Label>Mis en avant</Label></div>
            </div>
          </div>
          <div><Label>Fonctionnalités (une par ligne)</Label><Textarea rows={5} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></div>
          <div><Label>Prix (JSON)</Label><Textarea rows={4} className="font-mono text-xs" value={form.prices} onChange={(e) => setForm({ ...form, prices: e.target.value })} /></div>
        </div>
        <DialogFooter className="gap-2">
          {!isNew && <Button variant="destructive" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-1" />Supprimer</Button>}
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Page ---------------- */
export default function SuperAdmin() {
  const { data: orgs = [] } = useAllOrganizations();
  const { data: users = [] } = useAllUsers();
  const totalUsage = orgs.reduce((s, o) => s + o.storage_used_mb, 0);
  const paidOrgs = orgs.filter((o) => (o.subscription?.plan_code ?? "free") !== "free").length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Console Super Admin</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-2"><Building2 className="h-4 w-4" />Cliniques</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{orgs.length}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-2"><Package className="h-4 w-4" />Payantes</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{paidOrgs}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Utilisateurs</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{users.length}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Stockage total</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{Math.round(totalUsage)} Mo</CardContent></Card>
      </div>

      <Tabs defaultValue="orgs">
        <TabsList>
          <TabsTrigger value="orgs">Organisations</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="orgs"><OrgsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="plans"><PlansTab /></TabsContent>
      </Tabs>
    </div>
  );
}
