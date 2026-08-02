import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  QrCode,
  ShieldCheck,
  ArrowRight,
  LogIn,
  Camera,
  ClipboardPaste,
} from "lucide-react";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getMedicalShare,
  importMedicalShare,
  parseMedicalShareToken,
  type MedicalShareView,
} from "@/lib/medicalShare";
import { useQueryClient } from "@tanstack/react-query";

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats: string[] }) => BarcodeDetectorLike;
  }
}

export default function ImportMedicalDossier() {
  const { token: routeToken = "" } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [pasteValue, setPasteValue] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(!!routeToken);
  const [importing, setImporting] = useState(false);
  const [view, setView] = useState<MedicalShareView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current != null) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    if (!routeToken) {
      setLoading(false);
      setView(null);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMedicalShare(routeToken);
        if (cancelled) return;
        if (!data.ok) {
          setError(data.error || "Lien invalide");
          setView(null);
        } else {
          setView(data);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Impossible de charger le partage");
          setView(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routeToken]);

  const goToToken = (raw: string) => {
    const token = parseMedicalShareToken(raw);
    if (!token) {
      toast({
        title: "Lien invalide",
        description: "Collez l’URL du QR (…/import/dossier/…) ou le jeton.",
        variant: "destructive",
      });
      return;
    }
    stopCamera();
    navigate(`/import/dossier/${encodeURIComponent(token)}`);
  };

  const startCamera = async () => {
    setScanError(null);
    if (!window.BarcodeDetector) {
      setScanError(
        "Le scan caméra n’est pas supporté sur ce navigateur. Collez le lien affiché sous le QR, ou scannez avec l’appareil photo du téléphone."
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setScanning(true);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const video = videoRef.current;
      if (!video) throw new Error("Caméra indisponible");
      video.srcObject = stream;
      await video.play();

      const detector = new window.BarcodeDetector!({ formats: ["qr_code"] });
      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const codes = await detector.detect(videoRef.current);
          const value = codes.find((c) => c.rawValue)?.rawValue;
          if (value && parseMedicalShareToken(value)) {
            goToToken(value);
          }
        } catch {
          /* ignore frame errors */
        }
      }, 450);
    } catch (e: any) {
      setScanning(false);
      setScanError(
        e?.message?.includes("Permission") || e?.name === "NotAllowedError"
          ? "Autorisez l’accès à la caméra, ou collez le lien manuellement."
          : e?.message || "Impossible d’ouvrir la caméra."
      );
    }
  };

  const handleImport = async () => {
    if (!routeToken) return;
    setImporting(true);
    try {
      const result = await importMedicalShare(routeToken);
      await queryClient.invalidateQueries();
      toast({
        title: "Dossier importé",
        description: [
          result.created_client ? "Nouveau propriétaire créé." : "Propriétaire existant réutilisé.",
          result.created_animal ? "Nouvel animal créé." : "Animal existant (puce) réutilisé.",
          `${result.imported.vaccinations} vaccins, ${result.imported.antiparasitics} antiparasitaires, ${result.imported.consultations} consultations.`,
        ].join(" "),
      });
      navigate("/pets", { replace: true });
    } catch (e: any) {
      toast({
        title: "Import impossible",
        description: e?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const loginHref = `/login?redirect=${encodeURIComponent(
    routeToken ? `/import/dossier/${routeToken}` : "/import/dossier"
  )}`;
  const summary = view?.summary;
  const invalidReason =
    view && !view.valid
      ? view.revoked
        ? "Ce lien a été révoqué."
        : view.expired
          ? "Ce lien a expiré."
          : view.exhausted
            ? "Ce lien a atteint le nombre maximal d’imports."
            : "Ce lien n’est plus valide."
      : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <SeoHead
        title="Importer un dossier médical"
        description="Importer un dossier animal partagé via QR VetoCrm"
        path={routeToken ? `/import/dossier/${routeToken}` : "/import/dossier"}
        noIndex
      />
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <QrCode className="h-5 w-5" />
            Import dossier médical
          </CardTitle>
          <CardDescription>
            Transfert sécurisé entre cliniques VetoCrm (copie, pas de lien live).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!routeToken ? (
            <>
              <Alert>
                <ClipboardPaste className="h-4 w-4" />
                <AlertTitle>Comment importer ?</AlertTitle>
                <AlertDescription className="space-y-1 text-sm">
                  <p>1. Collez le lien sous le QR du PDF, ou</p>
                  <p>2. Scannez le QR avec la caméra ci-dessous, ou</p>
                  <p>3. Scannez avec l’appareil photo du téléphone (ouvre cette page).</p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="share-link">Lien ou jeton du partage</Label>
                <Input
                  id="share-link"
                  placeholder="https://…/import/dossier/… ou jeton"
                  value={pasteValue}
                  onChange={(e) => setPasteValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goToToken(pasteValue);
                  }}
                />
                <Button className="w-full gap-2" onClick={() => goToToken(pasteValue)}>
                  <ArrowRight className="h-4 w-4" />
                  Continuer
                </Button>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex gap-2">
                  {!scanning ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 w-full"
                      onClick={() => void startCamera()}
                    >
                      <Camera className="h-4 w-4" />
                      Scanner le QR (caméra)
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 w-full"
                      onClick={stopCamera}
                    >
                      Arrêter la caméra
                    </Button>
                  )}
                </div>
                {scanError && (
                  <p className="text-sm text-amber-700 dark:text-amber-300">{scanError}</p>
                )}
                {scanning && (
                  <video
                    ref={videoRef}
                    className="w-full rounded-md border bg-black aspect-square object-cover"
                    muted
                    playsInline
                  />
                )}
              </div>

              <div className="pt-2 text-center">
                <Button variant="ghost" asChild>
                  <Link to={isAuthenticated ? "/pets" : "/"}>Retour</Link>
                </Button>
              </div>
            </>
          ) : loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Chargement du partage…
            </div>
          ) : error ? (
            <>
              <Alert variant="destructive">
                <AlertTitle>Lien invalide</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/import/dossier">Essayer un autre lien</Link>
              </Button>
            </>
          ) : view ? (
            <>
              {invalidReason && (
                <Alert variant="destructive">
                  <AlertTitle>Import indisponible</AlertTitle>
                  <AlertDescription>{invalidReason}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border bg-white p-4 space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  {view.source_clinic_name && (
                    <Badge variant="secondary">Origine : {view.source_clinic_name}</Badge>
                  )}
                  {view.expires_at && (
                    <Badge variant="outline">
                      Expire le {new Date(view.expires_at).toLocaleDateString("fr-FR")}
                    </Badge>
                  )}
                </div>
                <p>
                  <strong>Animal :</strong> {summary?.animal_name || "—"}{" "}
                  <span className="text-muted-foreground">
                    ({summary?.species || "—"}
                    {summary?.breed ? ` · ${summary.breed}` : ""})
                  </span>
                </p>
                <p>
                  <strong>Propriétaire :</strong> {summary?.owner_name || "—"}
                </p>
                {summary?.microchip_number && (
                  <p>
                    <strong>Puce :</strong> {summary.microchip_number}
                  </p>
                )}
                <p className="text-muted-foreground">
                  Contenu : {summary?.vaccinations_count ?? 0} vaccins ·{" "}
                  {summary?.antiparasitics_count ?? 0} antiparasitaires ·{" "}
                  {summary?.consultations_count ?? 0} consultations
                </p>
              </div>

              {!isAuthenticated || !user ? (
                <Alert>
                  <LogIn className="h-4 w-4" />
                  <AlertTitle>Connexion requise</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>
                      Connectez-vous à la clinique destinataire pour importer ce dossier.
                    </p>
                    <Button asChild>
                      <Link to={loginHref}>Se connecter</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : view.valid ? (
                <div className="space-y-3">
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Prêt à importer</AlertTitle>
                    <AlertDescription>
                      Les données seront copiées dans votre clinique. Un animal déjà présent
                      (même n° de puce) sera réutilisé ; l’historique manquant sera ajouté.
                    </AlertDescription>
                  </Alert>
                  <Button
                    className="w-full gap-2"
                    onClick={() => void handleImport()}
                    disabled={importing}
                  >
                    {importing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    Ajouter à ma clinique
                  </Button>
                </div>
              ) : null}

              <div className="pt-2 text-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/import/dossier">Autre lien</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to={isAuthenticated ? "/pets" : "/"}>Retour</Link>
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
