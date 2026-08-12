import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
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
import { useTranslation } from "react-i18next";
import { isDemoWriteBlocked, DemoReadOnlyError } from "@/lib/demoWriteGuard";

const QR_READER_ID = "medical-share-qr-reader";

export default function ImportMedicalDossier() {
  const { t } = useTranslation("medical");
  const { t: td } = useTranslation("demo");
  const { token: routeToken = "" } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const demoLocked = isDemoWriteBlocked(user?.email);

  const [pasteValue, setPasteValue] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledScanRef = useRef(false);

  const [loading, setLoading] = useState(!!routeToken);
  const [importing, setImporting] = useState(false);
  const [view, setView] = useState<MedicalShareView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        /* already stopped */
      }
      try {
        scanner.clear();
      } catch {
        /* ignore */
      }
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

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
          setError(e?.message || t("import.loadShareFailed"));
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

  const goToToken = async (raw: string) => {
    const token = parseMedicalShareToken(raw);
    if (!token) {
      toast({
        title: t("import.invalidLink"),
        description: t("import.invalidLinkBody"),
        variant: "destructive",
      });
      return;
    }
    await stopCamera();
    navigate(`/import/dossier/${encodeURIComponent(token)}`);
  };

  const startCamera = async () => {
    setScanError(null);
    handledScanRef.current = false;

    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    if (!window.isSecureContext && !isLocal) {
      setScanError(t("import.cameraHttps"));
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError(t("import.cameraUnsupported"));
      return;
    }

    try {
      if (scannerRef.current) {
        await stopCamera();
      }

      setScanning(true);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => setTimeout(r, 80));

      if (!document.getElementById(QR_READER_ID)) {
        throw new Error("Zone de scan introuvable");
      }

      const scanner = new Html5Qrcode(QR_READER_ID, { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (handledScanRef.current) return;
          if (!parseMedicalShareToken(decodedText)) return;
          handledScanRef.current = true;
          void goToToken(decodedText);
        },
        () => {
          /* frame without QR — ignore */
        }
      );
    } catch (e: any) {
      await stopCamera();
      const name = e?.name || "";
      const msg = String(e?.message || e || "");
      if (name === "NotAllowedError" || /permission|denied|notallowed/i.test(msg)) {
        setScanError(t("import.cameraDenied"));
      } else if (name === "NotFoundError" || /not found|no camera|requested device/i.test(msg)) {
        setScanError(t("import.cameraNotFound"));
      } else {
        setScanError(msg || t("import.cameraOpenFailed"));
      }
    }
  };

  const handleImport = async () => {
    if (!routeToken) return;
    if (demoLocked) {
      toast({
        title: td("readOnlyToastTitle"),
        description: td("readOnlyToastBody"),
        variant: "destructive",
      });
      return;
    }
    setImporting(true);
    try {
      const result = await importMedicalShare(routeToken);
      await queryClient.invalidateQueries();
      toast({
        title: t("import.imported"),
        description: [
          result.created_client ? t("import.createdOwner") : t("import.reusedOwner"),
          result.created_animal ? t("import.createdPet") : t("import.reusedPet"),
          `${result.imported.vaccinations} vaccins, ${result.imported.antiparasitics} antiparasitaires, ${result.imported.consultations} consultations.`,
        ].join(" "),
      });
      navigate("/pets", { replace: true });
    } catch (e: any) {
      if (e instanceof DemoReadOnlyError) {
        toast({ title: td("readOnlyToastTitle"), description: td("readOnlyToastBody"), variant: "destructive" });
        return;
      }
      toast({
        title: t("import.importFailed"),
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
        ? t("import.revoked")
        : view.expired
          ? t("import.expired")
          : view.exhausted
            ? t("import.maxImports")
            : t("import.noLongerValid")
      : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <SeoHead
        title={t("import.seoTitle")}
        description={t("import.seoDescription")}
        path={routeToken ? `/import/dossier/${routeToken}` : "/import/dossier"}
        noIndex
      />
      <Card className="w-full max-w-lg shadow-sm border-border bg-card text-card-foreground" data-tour="import-dossier">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <QrCode className="h-5 w-5" />
            {t("import.title")}
          </CardTitle>
          <CardDescription>
            {t("import.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!routeToken ? (
            <>
              <Alert>
                <ClipboardPaste className="h-4 w-4" />
                <AlertTitle>{t("import.howTitle")}</AlertTitle>
                <AlertDescription className="space-y-1 text-sm">
                  <p>{t("import.howStep1")}</p>
                  <p>{t("import.howStep2")}</p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="share-link">{t("import.transferCode")}</Label>
                <Input
                  id="share-link"
                  placeholder={t("import.codePlaceholder")}
                  value={pasteValue}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  className="text-center text-xl sm:text-2xl font-mono tracking-[0.2em] uppercase h-14"
                  onChange={(e) => setPasteValue(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void goToToken(pasteValue);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {t("import.pasteUrlHint")}
                </p>
                <Button className="w-full gap-2" onClick={() => void goToToken(pasteValue)}>
                  <ArrowRight className="h-4 w-4" />
                  {t("import.continue")}
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
                      {t("import.scanQr")}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 w-full"
                      onClick={() => void stopCamera()}
                    >
                      {t("import.stopCamera")}
                    </Button>
                  )}
                </div>
                {scanError && (
                  <p className="text-sm text-amber-700 dark:text-amber-300">{scanError}</p>
                )}
                {/* Always mount when scanning so Html5Qrcode can attach */}
                <div
                  id={QR_READER_ID}
                  className={scanning ? "w-full overflow-hidden rounded-md border bg-black" : "hidden"}
                />
              </div>

              <div className="pt-2 text-center">
                <Button variant="ghost" asChild>
                  <Link to={isAuthenticated ? "/pets" : "/"}>{t("import.back")}</Link>
                </Button>
              </div>
            </>
          ) : loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("import.loadingShare")}
            </div>
          ) : error ? (
            <>
              <Alert variant="destructive">
                <AlertTitle>{t("import.invalidLink")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/import/dossier">{t("import.tryAnother")}</Link>
              </Button>
            </>
          ) : view ? (
            <>
              {invalidReason && (
                <Alert variant="destructive">
                  <AlertTitle>{t("import.unavailable")}</AlertTitle>
                  <AlertDescription>{invalidReason}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3 text-sm text-foreground">
                <div className="flex flex-wrap gap-2">
                  {view.source_clinic_name && (
                    <Badge variant="secondary" className="text-foreground">
                      {t("import.origin", { clinic: view.source_clinic_name })}
                    </Badge>
                  )}
                  {view.expires_at && (
                    <Badge variant="outline" className="border-border text-foreground">
                      {t("import.expiresOn", {
                        date: new Date(view.expires_at).toLocaleDateString(),
                      })}
                    </Badge>
                  )}
                  {view.short_code && (
                    <Badge variant="outline" className="border-border font-mono tracking-wider text-foreground">
                      {view.short_code}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p>
                    <span className="font-semibold">{t("import.animal")}</span>{" "}
                    {summary?.animal_name || "—"}
                    <span className="text-muted-foreground">
                      {" "}
                      ({summary?.species || "—"}
                      {summary?.breed ? ` · ${summary.breed}` : ""})
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">{t("import.owner")}</span>{" "}
                    {summary?.owner_name || "—"}
                  </p>
                  {summary?.microchip_number && (
                    <p>
                      <span className="font-semibold">{t("import.microchip")}</span> {summary.microchip_number}
                    </p>
                  )}
                  <p className="text-muted-foreground pt-1 border-t border-border">
                    {t("import.contentSummary", {
                      vax: summary?.vaccinations_count ?? 0,
                      anti: summary?.antiparasitics_count ?? 0,
                      consult: summary?.consultations_count ?? 0,
                    })}
                  </p>
                </div>
              </div>

              {!isAuthenticated || !user ? (
                <Alert>
                  <LogIn className="h-4 w-4" />
                  <AlertTitle>{t("import.loginRequired")}</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>
                      {t("import.loginRequiredBody")}
                    </p>
                    <Button asChild>
                      <Link to={loginHref}>{t("import.signIn")}</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : view.valid ? (
                <div className="space-y-3">
                  {demoLocked ? (
                    <Alert>
                      <ShieldCheck className="h-4 w-4" />
                      <AlertTitle>{td("readOnlyToastTitle")}</AlertTitle>
                      <AlertDescription>{td("readOnlyToastBody")}</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>{t("import.readyTitle")}</AlertTitle>
                    <AlertDescription>
                      {t("import.readyBody")}
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
                    {t("import.addToClinic")}
                  </Button>
                    </>
                  )}
                </div>
              ) : null}

              <div className="pt-2 text-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/import/dossier">{t("import.tryAnother")}</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to={isAuthenticated ? "/pets" : "/"}>{t("import.back")}</Link>
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
