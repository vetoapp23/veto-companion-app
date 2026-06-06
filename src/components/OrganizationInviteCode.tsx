// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const OrganizationInviteCode = () => {
  const { toast } = useToast();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

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

  const copyCode = () => {
    if (!invitationCode) return;
    
    navigator.clipboard.writeText(invitationCode);
    setCopied(true);
    toast({
      title: "Code copié!",
      description: "Le code d'invitation a été copié dans le presse-papier",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

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
              Code d'Invitation
            </CardTitle>
            <CardDescription className="text-sm">
              Partagez ce code avec vos assistants vétérinaires
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4 border">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Votre Code</div>
            <div className="text-2xl font-bold tracking-wider text-green-600 dark:text-green-400 font-mono select-all">
              {invitationCode}
            </div>
          </div>
          <Button
            onClick={copyCode}
            size="sm"
            variant={copied ? "secondary" : "default"}
            className="h-14 w-14"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              {instructionsOpen ? 'Masquer les instructions' : 'Comment inviter un assistant ?'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-muted/30 rounded-lg p-4 border space-y-3 text-sm">
              <div className="space-y-2">
                {[
                  { step: 1, text: "Partagez le code d'invitation avec votre assistant" },
                  { step: 2, text: "L'assistant se rend sur la page d'inscription" },
                  { step: 3, text: 'Coche "Je rejoins une clinique existante"' },
                  { step: 4, text: "Entre le code et complète l'inscription" },
                  { step: 5, text: "Confirme son email pour activer le compte" }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {item.step}
                    </div>
                    <p className="text-xs text-muted-foreground pt-0.5">
                      {item.text}
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