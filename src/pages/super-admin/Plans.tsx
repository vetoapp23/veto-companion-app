import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllPlans } from "@/hooks/useSuperAdminData";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, PLATFORM_FEATURE_KEYS, type PlatformFeatureKey } from "@/lib/superAdmin";
import {
  buildPlanMarketingBullets,
  emptyNotes,
  parsePlanFeatures,
  serializePlanFeatures,
  type AppLang,
  type PlanNotesI18n,
} from "@/lib/planMarketing";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";

const CURRENCIES = ["MAD", "EUR", "USD"] as const;
const CYCLES = ["monthly", "yearly"] as const;

const CORE_ON_BY_DEFAULT: PlatformFeatureKey[] = [
  "consultations",
  "visits",
  "appointments",
  "vaccinations",
  "antiparasites",
  "clients",
  "animals",
];

function emptyPrices() {
  const p: any = { monthly: {}, yearly: {} };
  CURRENCIES.forEach((c) => {
    p.monthly[c] = 0;
    p.yearly[c] = 0;
  });
  return p;
}

function defaultLimitFlags(limits: Record<string, boolean> = {}) {
  const flags: Record<string, boolean> = {};
  PLATFORM_FEATURE_KEYS.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(limits, k)) flags[k] = !!limits[k];
    else flags[k] = CORE_ON_BY_DEFAULT.includes(k);
  });
  return flags;
}

function notesToText(notes: string[]) {
  return (notes || []).join("\n");
}

function textToNotes(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function SuperAdminPlans() {
  const { t } = useTranslation("settings");
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
              features: serializePlanFeatures({ notes: emptyNotes() }),
              prices: emptyPrices(),
              limits: {},
            })
          }
        >
          <Plus className="h-4 w-4 mr-1" /> {t("superAdmin.plans.newPlan")}
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
                <tr>
                  <td colSpan={9} className="p-6 text-center text-muted-foreground">
                    {t("superAdmin.plans.loading")}
                  </td>
                </tr>
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
            toast({ title: t("superAdmin.plans.saved") });
          }}
        />
      )}
    </div>
  );
}

function PlanDialog({ plan, onClose, onSaved }: any) {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { t: tm } = useTranslation("marketing");
  const { toast } = useToast();
  const isNew = !plan.id;
  const limits = plan.limits && typeof plan.limits === "object" ? plan.limits : {};
  const pricesIn = plan.prices && typeof plan.prices === "object" ? plan.prices : emptyPrices();
  const parsed = parsePlanFeatures(plan.features);

  const [form, setForm] = useState({
    code: plan.code ?? "",
    name: plan.name ?? "",
    display_order: plan.display_order ?? 99,
    is_active: plan.is_active ?? true,
    is_highlighted: plan.is_highlighted ?? false,
    storage_mb: plan.storage_mb ?? 0,
    max_users: plan.max_users ?? 1,
    max_clients: plan.max_clients ?? "",
    max_animals: plan.max_animals ?? "",
    moduleFlags: defaultLimitFlags(limits),
    notesText: {
      fr: notesToText(parsed.notes.fr),
      en: notesToText(parsed.notes.en),
      es: notesToText(parsed.notes.es),
    },
    tagline: {
      fr: parsed.tagline.fr || plan.tagline || "",
      en: parsed.tagline.en || "",
      es: parsed.tagline.es || "",
    },
    nameI18n: {
      fr: parsed.name.fr || plan.name || "",
      en: parsed.name.en || "",
      es: parsed.name.es || "",
    },
    prices: {
      monthly: { ...emptyPrices().monthly, ...(pricesIn.monthly || {}) },
      yearly: { ...emptyPrices().yearly, ...(pricesIn.yearly || {}) },
    },
  });
  const [saving, setSaving] = useState(false);
  const [previewLang, setPreviewLang] = useState<AppLang>("fr");

  const setPrice = (cycle: string, cur: string, val: string) => {
    setForm((f) => ({
      ...f,
      prices: {
        ...f.prices,
        [cycle]: { ...f.prices[cycle], [cur]: Number(val) || 0 },
      },
    }));
  };

  const previewBullets = useMemo(() => {
    const notes: PlanNotesI18n = {
      fr: textToNotes(form.notesText.fr),
      en: textToNotes(form.notesText.en),
      es: textToNotes(form.notesText.es),
    };
    return buildPlanMarketingBullets(
      {
        name: form.name,
        features: serializePlanFeatures({ notes, tagline: form.tagline, name: form.nameI18n }),
        limits: form.moduleFlags,
        max_users: Number(form.max_users) || 1,
        max_clients: form.max_clients === "" ? null : Number(form.max_clients),
        max_animals: form.max_animals === "" ? null : Number(form.max_animals),
        storage_mb: Number(form.storage_mb) || 0,
      },
      previewLang,
      tm,
    );
  }, [form, previewLang, tm]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const limitsPayload: Record<string, boolean> = {};
      PLATFORM_FEATURE_KEYS.forEach((k) => {
        limitsPayload[k] = !!form.moduleFlags?.[k];
      });
      const notes: PlanNotesI18n = {
        fr: textToNotes(form.notesText.fr),
        en: textToNotes(form.notesText.en),
        es: textToNotes(form.notesText.es),
      };
      const featuresPayload = serializePlanFeatures({
        notes,
        tagline: form.tagline,
        name: form.nameI18n,
      });
      const displayName = form.nameI18n.fr.trim() || form.name.trim();
      const payload: any = {
        code: form.code.trim(),
        name: displayName,
        tagline: form.tagline.fr.trim() || null,
        description: buildPlanMarketingBullets(
          {
            features: featuresPayload,
            limits: limitsPayload,
            max_users: Number(form.max_users) || 1,
            max_clients: form.max_clients === "" ? null : Number(form.max_clients),
            max_animals: form.max_animals === "" ? null : Number(form.max_animals),
            storage_mb: Number(form.storage_mb) || 0,
          },
          "fr",
          tm,
        ).join(" · "),
        display_order: Number(form.display_order) || 0,
        is_active: !!form.is_active,
        is_highlighted: !!form.is_highlighted,
        storage_mb: Number(form.storage_mb) || 0,
        max_users: Number(form.max_users) || 1,
        max_clients: form.max_clients === "" ? null : Number(form.max_clients),
        max_animals: form.max_animals === "" ? null : Number(form.max_animals),
        limits: limitsPayload,
        features: featuresPayload,
        prices: form.prices,
      };
      if (isNew) {
        const { error } = await supabase.from("subscription_plans").insert(payload);
        if (error) throw error;
        await logAdminAction({
          action: "plan.create",
          resourceType: "subscription_plan",
          resourceId: payload.code,
          after: payload,
        });
      } else {
        const { error } = await supabase.from("subscription_plans").update(payload).eq("id", plan.id);
        if (error) throw error;
        await logAdminAction({
          action: "plan.update",
          resourceType: "subscription_plan",
          resourceId: plan.id,
          before: plan,
          after: payload,
        });
      }
      // Propagate catalog storage_mb to orgs on this plan (keeps custom quotas intact).
      const { error: syncErr } = await supabase.rpc("sync_plan_storage_to_orgs" as any, {
        p_plan_code: payload.code,
      });
      if (syncErr) console.warn("sync_plan_storage_to_orgs", syncErr);
      onSaved();
    } catch (e: any) {
      toast({ title: tc("error"), description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("superAdmin.plans.confirmDeleteNamed", { code: plan.code }))) return;
    const { error } = await supabase.from("subscription_plans").delete().eq("id", plan.id);
    if (error) toast({ title: tc("error"), description: error.message, variant: "destructive" });
    else {
      await logAdminAction({
        action: "plan.delete",
        resourceType: "subscription_plan",
        resourceId: plan.id,
        before: plan,
      });
      onSaved();
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? t("superAdmin.plans.newPlan") : t("superAdmin.plans.editPlan", { name: plan.name })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                disabled={!isNew}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <Label>Ordre</Label>
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: e.target.value as any })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            <div>
              <Label>{t("superAdmin.plans.nameFr")}</Label>
              <Input
                value={form.nameI18n.fr}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nameI18n: { ...form.nameI18n, fr: e.target.value },
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>{t("superAdmin.plans.nameEn")}</Label>
              <Input
                value={form.nameI18n.en}
                onChange={(e) => setForm({ ...form, nameI18n: { ...form.nameI18n, en: e.target.value } })}
              />
            </div>
            <div>
              <Label>{t("superAdmin.plans.nameEs")}</Label>
              <Input
                value={form.nameI18n.es}
                onChange={(e) => setForm({ ...form, nameI18n: { ...form.nameI18n, es: e.target.value } })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            <div>
              <Label>{t("superAdmin.plans.taglineFr")}</Label>
              <Input
                value={form.tagline.fr}
                onChange={(e) => setForm({ ...form, tagline: { ...form.tagline, fr: e.target.value } })}
              />
            </div>
            <div>
              <Label>{t("superAdmin.plans.taglineEn")}</Label>
              <Input
                value={form.tagline.en}
                onChange={(e) => setForm({ ...form, tagline: { ...form.tagline, en: e.target.value } })}
              />
            </div>
            <div>
              <Label>{t("superAdmin.plans.taglineEs")}</Label>
              <Input
                value={form.tagline.es}
                onChange={(e) => setForm({ ...form, tagline: { ...form.tagline, es: e.target.value } })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <Label>Stockage Mo</Label>
              <Input
                type="number"
                value={form.storage_mb}
                onChange={(e) => setForm({ ...form, storage_mb: e.target.value as any })}
              />
            </div>
            <div>
              <Label>Max users</Label>
              <Input
                type="number"
                value={form.max_users}
                onChange={(e) => setForm({ ...form, max_users: e.target.value as any })}
              />
            </div>
            <div>
              <Label>Max clients</Label>
              <Input
                type="number"
                value={form.max_clients}
                placeholder="∞"
                onChange={(e) => setForm({ ...form, max_clients: e.target.value })}
              />
            </div>
            <div>
              <Label>Max animaux</Label>
              <Input
                type="number"
                value={form.max_animals}
                placeholder="∞"
                onChange={(e) => setForm({ ...form, max_animals: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-end gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} /> Actif
              (landing / tarifs)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.is_highlighted}
                onCheckedChange={(c) => setForm({ ...form, is_highlighted: c })}
              />{" "}
              Mis en avant
            </label>
          </div>

          <div className="rounded border p-3 space-y-2">
            <Label className="text-sm">{t("superAdmin.plans.modulesTitle")}</Label>
            <p className="text-xs text-muted-foreground">{t("superAdmin.plans.modulesHint")}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {PLATFORM_FEATURE_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={!!form.moduleFlags?.[key]}
                    onCheckedChange={(c) =>
                      setForm({
                        ...form,
                        moduleFlags: { ...form.moduleFlags, [key]: c },
                      })
                    }
                  />
                  {t(`superAdmin.features.keys.${key}`)}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded border p-3 space-y-3">
            <div>
              <Label className="text-sm">{t("superAdmin.plans.notesTitle")}</Label>
              <p className="text-xs text-muted-foreground mt-1">{t("superAdmin.plans.notesHint")}</p>
            </div>
            <Tabs defaultValue="fr">
              <TabsList>
                <TabsTrigger value="fr">FR</TabsTrigger>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="es">ES</TabsTrigger>
              </TabsList>
              {(["fr", "en", "es"] as AppLang[]).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-2">
                  <Label>
                    {lang === "fr"
                      ? t("superAdmin.plans.notesFr")
                      : lang === "en"
                        ? t("superAdmin.plans.notesEn")
                        : t("superAdmin.plans.notesEs")}
                  </Label>
                  <Textarea
                    rows={5}
                    placeholder={"Support 24/7\nRelances RDV par email"}
                    value={form.notesText[lang]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notesText: { ...form.notesText, [lang]: e.target.value },
                      })
                    }
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="rounded border p-3 space-y-2 bg-muted/20">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label className="text-sm">{t("superAdmin.plans.previewTitle")}</Label>
              <div className="flex gap-1">
                {(["fr", "en", "es"] as AppLang[]).map((lang) => (
                  <Button
                    key={lang}
                    type="button"
                    size="sm"
                    variant={previewLang === lang ? "default" : "outline"}
                    className="h-7 px-2 uppercase"
                    onClick={() => setPreviewLang(lang)}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>
            <ul className="text-sm space-y-1 list-disc pl-5">
              {previewBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div>
            <Label className="mb-2 block">Tarifs</Label>
            <div className="rounded border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-2 text-left">Cycle</th>
                    {CURRENCIES.map((c) => (
                      <th key={c} className="p-2">
                        {c}
                      </th>
                    ))}
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
        </div>
        <DialogFooter className="gap-2">
          {!isNew && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>
            {tc("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "…" : tc("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
