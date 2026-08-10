// @ts-nocheck
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrganizationInviteCode } from "@/components/OrganizationInviteCode";
import { useTeamMembers, type TeamMember } from "@/hooks/useTeamMembers";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_ASSISTANT_PERMISSIONS,
  PERMISSION_CATALOG,
  getGroupLabel,
  getPermissionCatalog,
  getPermissionPresets,
  getAccessLevelOptions,
  normalizePermissions,
  type AccessLevel,
  type AssistantPermissions,
  type PermissionDefinition,
  type PermissionKey,
} from "@/lib/permissions";
import {
  Loader2,
  UserCircle,
  Crown,
  Shield,
  Users,
  KeyRound,
  UserCheck,
  UserX,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { AppPageHeader } from "@/components/AppPageHeader";
import { useTranslation } from "react-i18next";
import { useQuotaCheck } from "@/hooks/useQuotaCheck";
import { usePlanLimits } from "@/hooks/usePlanLimits";

export default function TeamManagement() {
  const { t, i18n } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { enforce, counts, limitFor } = useQuotaCheck();
  const { quota } = usePlanLimits();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: teamMembers, isLoading, error } = useTeamMembers();

  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [draftPerms, setDraftPerms] = useState<AssistantPermissions>(DEFAULT_ASSISTANT_PERMISSIONS);
  const [permOpen, setPermOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingPerms, setSavingPerms] = useState(false);

  const admins = useMemo(
    () => teamMembers?.filter((m) => m.role === "admin" && m.status !== "pending") || [],
    [teamMembers]
  );
  const assistants = useMemo(
    () => teamMembers?.filter((m) => m.role === "assistant" && m.status !== "pending") || [],
    [teamMembers]
  );
  const pending = useMemo(
    () => teamMembers?.filter((m) => m.status === "pending") || [],
    [teamMembers]
  );

  const maxUsers = limitFor("users");
  const allowInviteVet = maxUsers == null || maxUsers > 1;
  const approvedAdminCount = useMemo(
    () => admins.filter((a) => a.status === "approved").length,
    [admins]
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["teamMembers", user?.organization_id] });

  const openPermissions = (member: TeamMember) => {
    setSelected(member);
    setDraftPerms(normalizePermissions(member.permissions as any));
    setPermOpen(true);
  };

  const permissionPresets = useMemo(() => getPermissionPresets(), [i18n.language]);
  const accessLevelOptions = useMemo(() => getAccessLevelOptions(), [i18n.language]);
  const permissionCatalog = useMemo(() => getPermissionCatalog(), [i18n.language]);

  const applyPreset = (presetId: string) => {
    const preset = permissionPresets.find((p) => p.id === presetId);
    if (preset) setDraftPerms({ ...preset.permissions });
  };

  const setLevel = (key: PermissionKey, level: AccessLevel) => {
    setDraftPerms((p) => {
      const next = { ...p, [key]: level };
      if (key === "can_view_history") next.can_view_reports = level === "edit" ? "view" : level;
      return next;
    });
  };

  const handleApprove = async (member: TeamMember) => {
    if (!user?.id) return;
    if (!(await enforce("users"))) return;
    setBusyId(member.id);
    try {
      const { error: approveErr } = await supabase.rpc("approve_user", {
        user_id_param: member.id,
        approved_by_param: user.id,
      });
      if (approveErr) throw approveErr;

      if (member.role !== "admin") {
        const { error: permErr } = await supabase.rpc("update_user_permissions", {
          user_id_param: member.id,
          permissions_param: DEFAULT_ASSISTANT_PERMISSIONS,
          updated_by_param: user.id,
        });
        if (permErr) console.warn("permissions after approve", permErr);
      }

      toast({
        title: member.role === "admin" ? t("team.approvedVet") : t("team.approved"),
        description:
          member.role === "admin"
            ? t("team.approvedVetBody", { name: member.full_name || member.email })
            : t("team.approvedBody", { name: member.full_name || member.email }),
      });
      await invalidate();
    } catch (e: any) {
      toast({
        title: tc("error"),
        description: e?.message || t("team.cannotApprove"),
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleSetRole = async (member: TeamMember, role: "admin" | "assistant") => {
    if (!user?.id || member.id === user.id) return;
    setBusyId(member.id);
    try {
      const { data, error: roleErr } = await supabase.rpc("set_org_member_role" as any, {
        p_user_id: member.id,
        p_role: role,
      });
      if (roleErr) throw roleErr;
      if (data && (data as any).success === false) {
        throw new Error((data as any).error || t("team.cannotChangeRole"));
      }
      toast({
        title: t("team.roleUpdated"),
        description:
          role === "admin"
            ? t("team.promotedBody", { name: member.full_name || member.email })
            : t("team.demotedBody", { name: member.full_name || member.email }),
      });
      await invalidate();
    } catch (e: any) {
      toast({
        title: tc("error"),
        description: e?.message || t("team.cannotChangeRole"),
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (member: TeamMember) => {
    if (!user?.id) return;
    const reason = window.prompt(t("team.rejectReasonPrompt")) ?? "";
    setBusyId(member.id);
    try {
      const { error: rejectErr } = await supabase.rpc("reject_user", {
        user_id_param: member.id,
        rejected_by_param: user.id,
        reason_param: reason || t("team.unspecified"),
      });
      if (rejectErr) throw rejectErr;
      toast({ title: t("team.rejected") });
      await invalidate();
    } catch (e: any) {
      toast({
        title: tc("error"),
        description: e?.message || t("team.cannotReject"),
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleSavePermissions = async () => {
    if (!user?.id || !selected) return;
    setSavingPerms(true);
    try {
      const { error: saveErr } = await supabase.rpc("update_user_permissions", {
        user_id_param: selected.id,
        permissions_param: draftPerms,
        updated_by_param: user.id,
      });
      if (saveErr) throw saveErr;
      toast({
        title: t("team.permissionsSaved"),
        description: t("team.permissionsSavedBody", {
          name: selected.full_name || selected.email,
        }),
      });
      setPermOpen(false);
      setSelected(null);
      await invalidate();
    } catch (e: any) {
      toast({
        title: tc("error"),
        description: e?.message || t("team.cannotSavePermissions"),
        variant: "destructive",
      });
    } finally {
      setSavingPerms(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge>{t("team.statusActive")}</Badge>;
    if (status === "pending")
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          {t("team.statusPending")}
        </Badge>
      );
    if (status === "suspended") return <Badge variant="outline">{t("team.statusSuspended")}</Badge>;
    if (status === "rejected") return <Badge variant="destructive">{t("team.statusRejected")}</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const enabledCount = (member: TeamMember) => {
    const p = normalizePermissions(member.permissions as any);
    return PERMISSION_CATALOG.filter((d) => d.key !== "can_view_reports" && p[d.key] !== "none").length;
  };

  const editCount = (member: TeamMember) => {
    const p = normalizePermissions(member.permissions as any);
    return PERMISSION_CATALOG.filter((d) => d.key !== "can_view_reports" && p[d.key] === "edit").length;
  };

  const groupedCatalog = useMemo(() => {
    const groups: Record<string, PermissionDefinition[]> = {
      clinique: [],
      elevage: [],
      admin: [],
    };
    for (const d of permissionCatalog) {
      if (d.key === "can_view_reports") continue;
      groups[d.group].push(d);
    }
    return groups;
  }, [permissionCatalog]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
            <CardDescription>Impossible de charger les membres de l'équipe</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <AppPageHeader
        icon={Users}
        title={t("team.title")}
        description={
          limitFor("users") != null
            ? `${allowInviteVet ? t("team.descriptionMulti") : t("team.description")} — ${counts.users}/${limitFor("users")} ${t("team.seats", { defaultValue: "sièges" })} (${quota?.plan_name ?? ""})`
            : allowInviteVet
              ? t("team.descriptionMulti")
              : t("team.description")
        }
      />

      <OrganizationInviteCode allowInviteVet={allowInviteVet} />

      <div className="app-kpi-grid grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("team.total")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("team.vets")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("team.assistants")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("team.pending")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
          </CardContent>
        </Card>
      </div>

      {pending.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-700 dark:text-amber-400">
              <Clock className="mr-2 h-5 w-5" />
              {t("team.pendingRequests")}
            </CardTitle>
            <CardDescription>
              {t("team.pendingRequestsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">{member.full_name || t("team.noName")}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("team.requestedRole", {
                        role: member.role === "admin" ? t("team.roleVet") : t("team.roleAssistant"),
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === member.id}
                    onClick={() => handleApprove(member)}
                  >
                    {busyId === member.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-1" />
                    )}
                    {t("team.approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === member.id}
                    onClick={() => handleReject(member)}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    {t("team.reject")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="mr-2 h-5 w-5 text-yellow-500" />
            {t("team.vetsAdmins")}
          </CardTitle>
          <CardDescription>
            {allowInviteVet ? t("team.adminsHintMulti") : t("team.adminsHint")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center flex-wrap gap-1">
                      {admin.full_name || t("team.noName")}
                      {admin.id === user?.id && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          {t("team.you")}
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                    <Crown className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                  {statusBadge(admin.status)}
                  {allowInviteVet &&
                    admin.id !== user?.id &&
                    admin.status === "approved" &&
                    approvedAdminCount > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === admin.id}
                        onClick={() => handleSetRole(admin, "assistant")}
                      >
                        {busyId === admin.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {t("team.demoteToAssistant")}
                      </Button>
                    )}
                </div>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-muted-foreground text-center py-8">{t("team.empty")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-500" />
            {t("team.assistantsSection")}
          </CardTitle>
          <CardDescription>
            {t("team.assistantsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assistants.map((assistant) => (
              <div
                key={assistant.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{assistant.full_name || t("team.noName")}</p>
                    <p className="text-sm text-muted-foreground">{assistant.email}</p>
                    {assistant.status === "approved" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("team.modulesLabel", { count: enabledCount(assistant) })} · {t("team.editAccessLabel", { count: editCount(assistant) })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                    <Shield className="mr-1 h-3 w-3" />
                    Assistant
                  </Badge>
                  {statusBadge(assistant.status)}
                  {assistant.status === "approved" && (
                    <Button size="sm" variant="outline" onClick={() => openPermissions(assistant)}>
                      <KeyRound className="h-4 w-4 mr-1" />
                      {t("team.permissionsBtn", { defaultValue: "Droits" })}
                    </Button>
                  )}
                  {allowInviteVet && assistant.status === "approved" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === assistant.id}
                      onClick={() => handleSetRole(assistant, "admin")}
                    >
                      {busyId === assistant.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      )}
                      {t("team.promoteToVet")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {assistants.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <p className="text-muted-foreground">{t("team.empty")}</p>
                <p className="text-sm text-muted-foreground">
                  {allowInviteVet ? t("team.emptyInviteHintMulti") : t("team.emptyInviteHint")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={permOpen} onOpenChange={setPermOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("team.permissionsTitle", { name: selected?.full_name || selected?.email })}</DialogTitle>
            <DialogDescription>
              {t("team.permissionsHelpBefore")}{" "}
              <strong>{t("team.permissionsHelpNone")}</strong>,{" "}
              <strong>{t("team.permissionsHelpView")}</strong> {t("team.permissionsHelpViewHint")} {tc("or")}{" "}
              <strong>{t("team.permissionsHelpEdit")}</strong> {t("team.permissionsHelpEditHint")}{" "}
              {t("team.permissionsHelpRefresh")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {permissionPresets.map((preset) => (
                <Button
                  key={preset.id}
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => applyPreset(preset.id)}
                  title={preset.description}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {(["clinique", "elevage", "admin"] as const).map((group) => (
              <div key={group} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {getGroupLabel(group)}
                </p>
                <div className="space-y-2 rounded-lg border p-3">
                  {groupedCatalog[group].map((def) => {
                    const level = draftPerms[def.key] || "none";
                    const options = def.viewOnly
                      ? accessLevelOptions.filter((o) => o.value !== "edit")
                      : accessLevelOptions;
                    return (
                      <div
                        key={def.key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5 border-b last:border-0 border-border/60"
                      >
                        <div className="min-w-0">
                          <Label htmlFor={def.key} className="text-sm font-medium">
                            {def.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{def.description}</p>
                        </div>
                        <select
                          id={def.key}
                          className="flex h-9 w-full sm:w-[160px] shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                          value={level}
                          onChange={(e) => setLevel(def.key, e.target.value as AccessLevel)}
                        >
                          {options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPermOpen(false);
                setSelected(null);
              }}
              disabled={savingPerms}
            >
              {tc("cancel")}
            </Button>
            <Button type="button" onClick={handleSavePermissions} disabled={savingPerms}>
              {savingPerms && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
