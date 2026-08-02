import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchPlatformSettings, upsertPlatformSetting } from "@/lib/superAdmin";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Wrench, Flag, Mail } from "lucide-react";

export default function SuperAdminSystem() {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { toast } = useToast();
  const qc = useQueryClient();
  const settings = useQuery({
    queryKey: ["super-admin", "platform-settings"],
    queryFn: fetchPlatformSettings,
  });

  const [maintEnabled, setMaintEnabled] = useState(false);
  const [maintMessage, setMaintMessage] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [supportEmail, setSupportEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings.data) return;
    const m = settings.data.maintenance_mode ?? {};
    setMaintEnabled(!!m.enabled);
    setMaintMessage(m.message ?? "");
    setFlags(settings.data.feature_flags ?? {});
    setSupportEmail(settings.data.support_email?.email ?? "");
  }, [settings.data]);

  const health = useQuery({
    queryKey: ["super-admin", "health"],
    queryFn: async () => {
      const checks: { name: string; ok: boolean; detail?: string }[] = [];
      try {
        const { error } = await supabase.from("organizations").select("id", { count: "exact", head: true });
        checks.push({ name: "DB organizations", ok: !error, detail: error?.message });
      } catch (e: any) {
        checks.push({ name: "DB organizations", ok: false, detail: e.message });
      }
      try {
        const { error } = await supabase.rpc("get_access_status" as any);
        checks.push({ name: "RPC get_access_status", ok: !error, detail: error?.message });
      } catch (e: any) {
        checks.push({ name: "RPC get_access_status", ok: false, detail: e.message });
      }
      try {
        const { error } = await supabase.rpc("get_all_orgs_usage_stats" as any);
        checks.push({ name: "RPC usage stats", ok: !error, detail: error?.message });
      } catch (e: any) {
        checks.push({ name: "RPC usage stats", ok: false, detail: e.message });
      }
      try {
        const { error } = await supabase.from("platform_settings" as any).select("key").limit(1);
        checks.push({ name: "platform_settings", ok: !error, detail: error?.message });
      } catch (e: any) {
        checks.push({ name: "platform_settings", ok: false, detail: e.message });
      }
      return checks;
    },
    staleTime: 30_000,
  });

  const save = async () => {
    setSaving(true);
    try {
      await upsertPlatformSetting("maintenance_mode", {
        enabled: maintEnabled,
        message: maintMessage || t("superAdmin.system.defaultMaintenanceMsg"),
      });
      await upsertPlatformSetting("feature_flags", flags);
      await upsertPlatformSetting("support_email", { email: supportEmail });
      toast({ title: t("superAdmin.system.saved") });
      qc.invalidateQueries({ queryKey: ["super-admin", "platform-settings"] });
      qc.invalidateQueries({ queryKey: ["access-status"] });
    } catch (e: any) {
      toast({ title: tc("error"), description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> {t("superAdmin.system.health")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2">
          {(health.data ?? []).map((c) => (
            <div
              key={c.name}
              className={`rounded-lg border p-3 text-sm ${c.ok ? "border-emerald-500/30" : "border-destructive/40"}`}
            >
              <div className="flex justify-between">
                <span className="font-medium">{c.name}</span>
                <span className={c.ok ? "text-emerald-600" : "text-destructive"}>{c.ok ? "OK" : "KO"}</span>
              </div>
              {!c.ok && c.detail && <p className="text-xs text-muted-foreground mt-1">{c.detail}</p>}
            </div>
          ))}
          {health.isLoading && <p className="text-sm text-muted-foreground">{t("superAdmin.system.checking")}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" /> {t("superAdmin.system.maintenance")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded border p-3">
            <Label>{t("superAdmin.system.enableMaintenance")}</Label>
            <Switch checked={maintEnabled} onCheckedChange={setMaintEnabled} />
          </div>
          <div>
            <Label>{t("superAdmin.system.message")}</Label>
            <Textarea rows={2} value={maintMessage} onChange={(e) => setMaintMessage(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flag className="h-4 w-4" /> {t("superAdmin.system.featureFlags")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(
            [
              ["force_read_only", t("superAdmin.system.forceReadOnly")],
              ["block_registrations", t("superAdmin.system.blockRegistrations")],
              ["new_billing_ui", t("superAdmin.system.newBillingUi")],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded border p-3">
              <Label>{label}</Label>
              <Switch
                checked={!!flags[key]}
                onCheckedChange={(c) => setFlags((f) => ({ ...f, [key]: c }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> {t("superAdmin.system.support")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>{t("superAdmin.system.supportEmail")}</Label>
            <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("superAdmin.system.supportEmailHint")}
          </p>
        </CardContent>
      </Card>

      <Button className="rounded-full" onClick={save} disabled={saving}>
        {saving ? t("superAdmin.system.saving") : t("superAdmin.system.saveSystem")}
      </Button>
    </div>
  );
}
