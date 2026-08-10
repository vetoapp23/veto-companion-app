// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, UserPlus, Link2, Crown, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import { getAppOrigin } from "@/lib/appUrl";

type InviteRole = "assistant" | "admin";

type Props = {
  /** Duo / Clinic: allow inviting another veterinarian (admin) */
  allowInviteVet?: boolean;
};

export const OrganizationInviteCode = ({ allowInviteVet = false }: Props) => {
  const { toast } = useToast();
  const { t } = useTranslation("settings");
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [loading, setLoading] = useState(true);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<InviteRole>("assistant");

  useEffect(() => {
    loadInvitationCode();
  }, []);

  const loadInvitationCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data: org } = await supabase
        .from('organizations')
        .select('invitation_code')
        .eq('id', profile.organization_id)
        .single();

      setInvitationCode(org?.invitation_code || null);
    } catch (error) {
      console.error('Error loading invitation code:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinPath =
    inviteRole === "admin"
      ? `/register?mode=vet&code=${encodeURIComponent(invitationCode || "")}`
      : `/register?mode=assistant&code=${encodeURIComponent(invitationCode || "")}`;

  const copyCode = () => {
    if (!invitationCode) return;
    navigator.clipboard.writeText(invitationCode);
    setCopied("code");
    toast({
      title: t("inviteCode.copied"),
      description: t("inviteCode.copiedBody"),
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = () => {
    if (!invitationCode) return;
    const url = `${getAppOrigin()}${joinPath}`;
    navigator.clipboard.writeText(url);
    setCopied("link");
    toast({
      title: t("inviteCode.linkCopied"),
      description:
        inviteRole === "admin"
          ? t("inviteCode.linkCopiedVetBody")
          : t("inviteCode.linkCopiedAssistantBody"),
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = ["1", "2", "3", "4", "5"] as const;
  const stepNs = allowInviteVet ? "inviteCode.stepsMulti" : "inviteCode.steps";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!invitationCode) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              {t("inviteCode.title")}
            </CardTitle>
            <CardDescription className="text-sm">
              {allowInviteVet
                ? t("inviteCode.descriptionMulti")
                : t("inviteCode.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {allowInviteVet && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("inviteCode.inviteAs")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={inviteRole === "admin" ? "default" : "outline"}
                className="justify-start gap-2 h-auto py-2.5"
                onClick={() => setInviteRole("admin")}
              >
                <Crown className="h-4 w-4 shrink-0" />
                <span className="text-left">
                  <span className="block text-sm font-medium">{t("inviteCode.roleVet")}</span>
                  <span className="block text-[11px] font-normal opacity-80">
                    {t("inviteCode.roleVetHint")}
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                variant={inviteRole === "assistant" ? "default" : "outline"}
                className="justify-start gap-2 h-auto py-2.5"
                onClick={() => setInviteRole("assistant")}
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span className="text-left">
                  <span className="block text-sm font-medium">{t("inviteCode.roleAssistant")}</span>
                  <span className="block text-[11px] font-normal opacity-80">
                    {t("inviteCode.roleAssistantHint")}
                  </span>
                </span>
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4 border">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-1">{t("inviteCode.yourCode")}</div>
            <div className="text-2xl font-bold tracking-wider text-green-600 dark:text-green-400 font-mono select-all truncate">
              {invitationCode}
            </div>
          </div>
          <Button
            onClick={copyCode}
            size="sm"
            variant={copied === "code" ? "secondary" : "default"}
            className="h-14 w-14 shrink-0"
            title={t("inviteCode.copyCode")}
          >
            {copied === "code" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={copyLink}
        >
          {copied === "link" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {inviteRole === "admin"
            ? t("inviteCode.copyVetLink")
            : t("inviteCode.copyAssistantLink")}
        </Button>

        <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              {instructionsOpen
                ? t("inviteCode.hideInstructions")
                : allowInviteVet
                  ? t("inviteCode.howToInviteMulti")
                  : t("inviteCode.howToInvite")}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-muted/30 rounded-lg p-4 border space-y-3 text-sm">
              <div className="space-y-2">
                {steps.map((step) => (
                  <div key={step} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {step}
                    </div>
                    <p className="text-xs text-muted-foreground pt-0.5">
                      {t(`${stepNs}.${step}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
