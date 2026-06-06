// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2, Building2, UserPlus, Check, Sparkles, HardDrive, Users, ArrowLeft, ArrowRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type Currency = "MAD" | "EUR" | "USD";
type Cycle = "monthly" | "yearly";

interface Plan {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  prices: Record<Cycle, Record<Currency, number>>;
  storage_mb: number;
  max_users: number;
  max_clients: number | null;
  max_animals: number | null;
  features: string[];
  is_highlighted: boolean;
  display_order: number;
}

const CURRENCY_SYMBOL: Record<Currency, string> = { MAD: "MAD", EUR: "€", USD: "$" };

function detectCurrency(): Currency {
  if (typeof navigator === "undefined") return "EUR";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.includes("ar") || lang.includes("-ma")) return "MAD";
  if (lang.startsWith("en-us")) return "USD";
  return "EUR";
}

function formatStorage(mb: number) {
  return mb >= 1024 ? `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} Go` : `${mb} Mo`;
}

function formatPrice(amount: number, currency: Currency) {
  if (amount === 0) return "Gratuit";
  const s = CURRENCY_SYMBOL[currency];
  return currency === "MAD" ? `${amount} ${s}` : `${s}${amount}`;
}

type Step = "plan" | "account";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const urlPlan = searchParams.get("plan") ?? "free";
  const urlMode = searchParams.get("mode");

  const [step, setStep] = useState<Step>(urlMode === "assistant" ? "account" : "plan");
  const [selectedPlan, setSelectedPlan] = useState<string>(urlPlan);
  const [currency, setCurrency] = useState<Currency>(detectCurrency());
  const [cycle] = useState<Cycle>("monthly");
  const [isJoiningOrganization, setIsJoiningOrganization] = useState(urlMode === "assistant");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    clinicName: "",
    clinicAddress: "",
    phone: "",
    organizationCode: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("subscription_plans" as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      setPlans((data as unknown as Plan[]) ?? []);
    })();
  }, []);

  const currentPlan = useMemo(
    () => plans.find((p) => p.code === selectedPlan),
    [plans, selectedPlan]
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.fullName || !formData.email || !formData.password)
        throw new Error("Veuillez remplir tous les champs obligatoires");
      if (formData.password !== formData.confirmPassword)
        throw new Error("Les mots de passe ne correspondent pas");
      if (formData.password.length < 8)
        throw new Error("Le mot de passe doit contenir au moins 8 caractères");
      if (isJoiningOrganization && !formData.organizationCode)
        throw new Error("Veuillez entrer le code d'organisation");
      if (!isJoiningOrganization && !formData.clinicName)
        throw new Error("Veuillez entrer le nom de votre clinique");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte");

      const { data: profileData, error: profileError } = await supabase.rpc("create_user_profile", {
        p_user_id: authData.user.id,
        p_full_name: formData.fullName,
        p_email: formData.email,
        p_role: isJoiningOrganization ? "assistant" : "admin",
        p_organization_code: isJoiningOrganization ? formData.organizationCode : null,
        p_clinic_name: !isJoiningOrganization ? formData.clinicName : null,
        p_clinic_address: !isJoiningOrganization ? formData.clinicAddress : null,
        p_phone: !isJoiningOrganization ? formData.phone : null,
      });

      if (profileError) throw new Error(profileError.message);
      if (profileData && !(profileData as any).success)
        throw new Error((profileData as any).error || "Erreur lors de la création du profil");

      // Pour les admins (créateurs d'organisation), pré-enregistrer le pack choisi.
      if (!isJoiningOrganization && (profileData as any)?.organization_id && selectedPlan !== "free") {
        // L'attribution réelle se fera après paiement (Phase 3). Pour l'instant on garde free par défaut.
        // On stocke l'intention via localStorage pour rediriger vers checkout après login.
        localStorage.setItem("pending_plan_upgrade", selectedPlan);
      }

      toast({
        title: "Inscription réussie !",
        description: isJoiningOrganization
          ? "Vérifiez votre email pour confirmer votre compte."
          : `Compte créé avec le pack ${currentPlan?.name ?? selectedPlan}. Vérifiez votre email pour confirmer.`,
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ------- STEP 1 : choix du pack -------
  if (step === "plan" && !isJoiningOrganization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Choisissez votre pack</h1>
            <p className="text-muted-foreground">
              Démarrez gratuitement, évoluez quand vous voulez. Annulation à tout moment.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {(["MAD", "EUR", "USD"] as Currency[]).map((c) => (
                <Button
                  key={c}
                  variant={currency === c ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrency(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          <RadioGroup
            value={selectedPlan}
            onValueChange={setSelectedPlan}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {plans.map((plan) => {
              const price = plan.prices?.[cycle]?.[currency] ?? 0;
              const selected = selectedPlan === plan.code;
              return (
                <label key={plan.id} htmlFor={plan.code} className="cursor-pointer">
                  <RadioGroupItem id={plan.code} value={plan.code} className="sr-only" />
                  <Card
                    className={`h-full transition-all ${
                      selected
                        ? "border-primary ring-2 ring-primary shadow-lg"
                        : "hover:border-primary/50"
                    } ${plan.is_highlighted ? "relative" : ""}`}
                  >
                    {plan.is_highlighted && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Populaire
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.tagline && (
                        <CardDescription className="text-xs">{plan.tagline}</CardDescription>
                      )}
                      <div className="pt-2">
                        <span className="text-3xl font-bold">{formatPrice(price, currency)}</span>
                        {price > 0 && (
                          <span className="text-xs text-muted-foreground">/mois</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span>{formatStorage(plan.storage_mb)} photos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {plan.max_users} utilisateur{plan.max_users > 1 ? "s" : ""}
                        </span>
                      </div>
                      <ul className="space-y-1 pt-2 border-t">
                        {(plan.features || []).slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </label>
              );
            })}
          </RadioGroup>

          <div className="flex items-center justify-between mt-8 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => {
                setIsJoiningOrganization(true);
                setStep("account");
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Je rejoins une clinique existante
            </Button>
            <Button onClick={() => setStep("account")} size="lg">
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ------- STEP 2 : compte -------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {isJoiningOrganization ? (
              <div className="p-3 bg-primary/10 rounded-full">
                <UserPlus className="h-10 w-10 text-primary" />
              </div>
            ) : (
              <div className="p-3 bg-primary/10 rounded-full">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {isJoiningOrganization ? "Rejoindre une clinique" : "Créez votre compte"}
          </CardTitle>
          <CardDescription className="text-base">
            {isJoiningOrganization
              ? "Inscription en tant qu'assistant vétérinaire"
              : currentPlan
              ? `Pack sélectionné : ${currentPlan.name}`
              : "Inscription clinique"}
          </CardDescription>
          {!isJoiningOrganization && (
            <Button
              variant="link"
              size="sm"
              className="mx-auto"
              onClick={() => setStep("plan")}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Changer de pack
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                Informations personnelles
              </h3>
              <div>
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Dr. Jean Dupont"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 caractères"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {isJoiningOrganization && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Code d'organisation
                </h3>
                <div>
                  <Label htmlFor="organizationCode">
                    Code fourni par votre administrateur *
                  </Label>
                  <Input
                    id="organizationCode"
                    value={formData.organizationCode}
                    onChange={(e) =>
                      setFormData({ ...formData, organizationCode: e.target.value })
                    }
                    placeholder="ABC123"
                    required
                  />
                </div>
              </div>
            )}

            {!isJoiningOrganization && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Informations de la clinique
                </h3>
                <div>
                  <Label htmlFor="clinicName">Nom de la clinique *</Label>
                  <Input
                    id="clinicName"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="Clinique Vétérinaire Centrale"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clinicAddress">Adresse</Label>
                  <Input
                    id="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, clinicAddress: e.target.value })
                    }
                    placeholder="123 Rue Example, Ville"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 6 12 34 56 78"
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                <>
                  {isJoiningOrganization ? "Rejoindre la clinique" : "Créer mon compte"}
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-2 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Connectez-vous
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;