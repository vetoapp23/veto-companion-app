import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar, FileText, Stethoscope, Syringe, AlertCircle, Activity,
  Plus, Heart, User, Award, Printer, ClipboardList, CalendarPlus
} from "lucide-react";
import { calculateAge } from "@/lib/utils";
import {
  useConsultationsByAnimal,
  useVaccinationsByAnimal,
  useAntiparasiticsByAnimal,
  usePrescriptionsByAnimal,
} from "@/hooks/useDatabase";
import { PedigreeSection } from "@/components/pedigree/PedigreeSection";
import { PrintMedicalRecordModal } from "@/components/modals/PrintMedicalRecordModal";
import { CertificateVaccinationPrintDynamic } from "@/components/CertificateVaccinationPrintDynamic";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import NewVaccinationModal from "@/components/forms/NewVaccinationModalDynamic";
import NewAntiparasiticModalDynamic from "@/components/forms/NewAntiparasiticModalDynamic";
import { NewPrescriptionModal } from "@/components/forms/NewPrescriptionModal";
import { NewAppointmentModal } from "@/components/forms/NewAppointmentModal";
import { ConsultationDetailModal } from "@/components/modals/ConsultationDetailModal";
import { ImageIcon } from "lucide-react";
import { useAppLocale } from "@/i18n/useAppLocale";
import { useTranslation } from "react-i18next";

interface PetUI {
  id: number;
  name: string;
  type: string;
  breed?: string;
  gender?: "male" | "female";
  birthDate?: string;
  weight?: string;
  color?: string;
  microchip?: string;
  medicalNotes?: string;
  photo?: string;
  ownerId: number;
  owner: string;
  status: "healthy" | "treatment" | "urgent";
  lastVisit?: string;
  nextAppointment?: string;
  vaccinations?: string[];
  dbId: string;
  dbClientId: string;
}

interface SimplePetDossierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet: PetUI | null;
}

export function SimplePetDossierModal({ open, onOpenChange, pet }: SimplePetDossierModalProps) {
  const { t } = useTranslation("medical");
  const { t: tc } = useTranslation("common");
  const { bcp47 } = useAppLocale();
  const [activeTab, setActiveTab] = useState("overview");
  const [showPrint, setShowPrint] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [showVaccination, setShowVaccination] = useState(false);
  const [showAntiparasitic, setShowAntiparasitic] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const [selectedConsult, setSelectedConsult] = useState<any | null>(null);

  const animalId = pet?.dbId || "";
  const { data: consultations = [] } = useConsultationsByAnimal(animalId);
  const { data: vaccinations = [] } = useVaccinationsByAnimal(animalId);
  const { data: antiparasitics = [] } = useAntiparasiticsByAnimal(animalId);
  const { data: prescriptions = [] } = usePrescriptionsByAnimal(animalId);

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(bcp47) : "—");

  if (!pet) return null;

  const age = pet.birthDate ? calculateAge(pet.birthDate) : tc("notSpecified");
  const currentWeight = pet.weight ? `${pet.weight} kg` : tc("notSpecified");
  const lastConsult = consultations[0];
  const sexLabel =
    pet.gender === "male" ? tc("male") : pet.gender === "female" ? tc("female") : "—";
  const statusLabel =
    pet.status === "healthy"
      ? t("petDossier.healthy")
      : pet.status === "treatment"
        ? t("petDossier.inTreatment")
        : t("petDossier.urgent");

  // build animal-like object for print modal
  const animalForPrint = {
    id: animalId,
    name: pet.name,
    species: pet.type,
    breed: pet.breed,
    color: pet.color,
    sex: pet.gender === "male" || pet.gender === "female" ? sexLabel : undefined,
    weight: pet.weight,
    birth_date: pet.birthDate,
    microchip_number: pet.microchip,
    status: pet.status,
    client_id: pet.dbClientId,
    owner: pet.owner,
    photo: pet.photo || undefined,
    photo_url: pet.photo || undefined,
    medical_history: pet.medicalNotes || undefined,
  };

  const QuickAction = ({
    icon: Icon, label, onClick, color,
  }: { icon: any; label: string; onClick: () => void; color: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-1 h-auto py-2 px-0.5 flex-col items-center text-[10px] sm:text-xs w-full"
    >
      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
      <span className="leading-tight text-center truncate w-full px-0.5">{label}</span>
    </Button>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          style={{ maxHeight: "100dvh" }}
          className={[
            "max-w-5xl gap-0 p-0 overflow-hidden",
            "flex flex-col",
            "w-full max-sm:left-0 max-sm:top-0 max-sm:translate-x-0 max-sm:translate-y-0",
            "max-sm:w-full max-sm:max-w-none max-sm:h-[100dvh] max-sm:max-h-[100dvh]",
            "max-sm:rounded-none max-sm:border-0",
            "sm:w-[calc(100%-1.5rem)] sm:max-h-[90vh] sm:h-auto sm:rounded-lg",
          ].join(" ")}
        >
          <div className="shrink-0 border-b px-3 pt-3 pb-3 sm:px-6 sm:pt-5 space-y-3">
            <DialogHeader className="space-y-1 text-left pr-8">
              <DialogTitle className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                <span className="inline-flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="h-5 w-5 shrink-0" />
                  {pet.name}
                </span>
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                  {t("petDossier.subtitle", { owner: pet.owner })}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 [&_button]:w-full sm:flex-none sm:[&_button]:w-auto">
                <CertificateVaccinationPrintDynamic animalId={animalId} />
              </div>
              <Button
                onClick={() => setShowPrint(true)}
                variant="outline"
                size="sm"
                className="gap-2 shrink-0 justify-center"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">{t("petDossier.printQr")}</span>
                <span className="sm:hidden">{t("petDossier.printShort", { defaultValue: "Imprimer" })}</span>
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 sm:px-6 sm:py-4 space-y-3">
          {/* Quick actions */}
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-2 sm:px-6">
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                <QuickAction icon={Stethoscope} label={t("petDossier.quickConsult")} color="text-emerald-600" onClick={() => setShowConsultation(true)} />
                <QuickAction icon={Syringe} label={t("petDossier.quickVaccin")} color="text-blue-600" onClick={() => setShowVaccination(true)} />
                <QuickAction icon={AlertCircle} label={t("petDossier.quickAnti")} color="text-orange-600" onClick={() => setShowAntiparasitic(true)} />
                <QuickAction icon={ClipboardList} label={t("petDossier.quickRx")} color="text-purple-600" onClick={() => setShowPrescription(true)} />
                <QuickAction icon={CalendarPlus} label={t("petDossier.quickAppt")} color="text-pink-600" onClick={() => setShowAppointment(true)} />
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto -mx-1 px-1 pb-1 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-7 h-auto gap-1 p-1">
                <TabsTrigger value="overview" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  {t("petDossier.tabOverview")}
                </TabsTrigger>
                <TabsTrigger value="historique" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("petDossier.tabHistory")}
                </TabsTrigger>
                <TabsTrigger value="consultations" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {t("petDossier.tabConsult")}
                </TabsTrigger>
                <TabsTrigger value="vaccinations" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Syringe className="h-3.5 w-3.5" />
                  {t("petDossier.tabVaccines")}
                </TabsTrigger>
                <TabsTrigger value="antiparasites" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {t("petDossier.tabAnti")}
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {t("petDossier.tabRx")}
                </TabsTrigger>
                <TabsTrigger value="pedigree" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Award className="h-3.5 w-3.5" />
                  {t("petDossier.tabPedigree")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-3 mt-3">
              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-base">{t("petDossier.generalInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4">
                  {/* Mobile hero */}
                  <div className="flex flex-col items-center text-center gap-2 sm:hidden">
                    <Avatar className="h-24 w-24">
                      {pet.photo ? <AvatarImage src={pet.photo} alt={pet.name} className="object-cover" /> :
                        <AvatarFallback className="bg-primary-glow text-primary-foreground">
                          <Heart className="h-10 w-10" />
                        </AvatarFallback>}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {[pet.type, pet.breed].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Badge variant={pet.status === "healthy" ? "default" : pet.status === "treatment" ? "secondary" : "destructive"}>
                      {statusLabel}
                    </Badge>
                  </div>

                  {/* Desktop / tablet row */}
                  <div className="hidden sm:flex items-start gap-6">
                    <Avatar className="h-28 w-28 shrink-0">
                      {pet.photo ? <AvatarImage src={pet.photo} alt={pet.name} className="object-cover" /> :
                        <AvatarFallback className="bg-primary-glow text-primary-foreground">
                          <Heart className="h-12 w-12" />
                        </AvatarFallback>}
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xl mb-1">{pet.name}</h3>
                      <Badge variant={pet.status === "healthy" ? "default" : pet.status === "treatment" ? "secondary" : "destructive"}>
                        {statusLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.type").replace(/\s*:$/, "")}</p>
                      <p className="font-medium break-words">{pet.type || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.race").replace(/\s*:$/, "")}</p>
                      <p className="font-medium break-words">{pet.breed || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.sex").replace(/\s*:$/, "")}</p>
                      <p className="font-medium">{sexLabel}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.age").replace(/\s*:$/, "")}</p>
                      <p className="font-medium">{age}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.birth").replace(/\s*:$/, "")}</p>
                      <p className="font-medium">{pet.birthDate || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.color").replace(/\s*:$/, "")}</p>
                      <p className="font-medium break-words">{pet.color || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.weight").replace(/\s*:$/, "")}</p>
                      <p className="font-medium">{currentWeight}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.microchip").replace(/\s*:$/, "")}</p>
                      <p className="font-medium break-all text-xs sm:text-sm">{pet.microchip || "—"}</p>
                    </div>
                    <div className="col-span-2 flex items-start gap-2 pt-1 border-t">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.owner").replace(/\s*:$/, "")}</p>
                        <p className="font-medium break-words">{pet.owner}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("petDossier.lastVisit").replace(/\s*:$/, "")}</p>
                      <p className="font-medium">{lastConsult ? fmt(lastConsult.consultation_date) : t("petDossier.none")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <Card><CardContent className="p-3 sm:p-4"><p className="text-xs text-muted-foreground">{t("petDossier.consultations")}</p><p className="text-xl sm:text-2xl font-bold">{consultations.length}</p></CardContent></Card>
                <Card><CardContent className="p-3 sm:p-4"><p className="text-xs text-muted-foreground">{t("petDossier.vaccinations")}</p><p className="text-xl sm:text-2xl font-bold">{vaccinations.length}</p></CardContent></Card>
                <Card><CardContent className="p-3 sm:p-4"><p className="text-xs text-muted-foreground">{t("petDossier.antiparasitics")}</p><p className="text-xl sm:text-2xl font-bold">{antiparasitics.length}</p></CardContent></Card>
                <Card><CardContent className="p-3 sm:p-4"><p className="text-xs text-muted-foreground">{t("petDossier.prescriptions")}</p><p className="text-xl sm:text-2xl font-bold">{prescriptions.length}</p></CardContent></Card>
              </div>

              {pet.medicalNotes && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">{t("petDossier.notesHistory")}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm whitespace-pre-line">{pet.medicalNotes}</p></CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="historique" className="space-y-2">
              <Card>
                <CardHeader><CardTitle>{t("petDossier.timeline")}</CardTitle></CardHeader>
                <CardContent>
                  {(() => {
                    const events = [
                      ...consultations.map((c: any) => ({ d: c.consultation_date, t: t("petDossier.eventConsultation"), l: c.diagnosis || c.consultation_type, color: "bg-emerald-500" })),
                      ...vaccinations.map((v: any) => ({ d: v.vaccination_date, t: t("petDossier.eventVaccination"), l: v.vaccine_name, color: "bg-blue-500" })),
                      ...antiparasitics.map((a: any) => ({ d: a.treatment_date, t: t("petDossier.eventAntiparasitic"), l: a.product_name, color: "bg-orange-500" })),
                      ...prescriptions.map((p: any) => {
                        const meds = (p.medications || [])
                          .map((m: any) => m.medication_name)
                          .filter(Boolean)
                          .join(", ");
                        return {
                          d: p.prescription_date,
                          t: t("petDossier.eventPrescription"),
                          l: meds || p.diagnosis || t("petDossier.eventPrescriptionAlt"),
                          color: "bg-purple-500",
                        };
                      }),
                    ].filter(e => e.d).sort((a, b) => (a.d < b.d ? 1 : -1));
                    if (events.length === 0) return <p className="text-sm text-muted-foreground">{t("petDossier.noEvents")}</p>;
                    return (
                      <ul className="space-y-2">
                        {events.map((e, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm border-l-2 pl-3" style={{ borderColor: "hsl(var(--border))" }}>
                            <span className={`h-2 w-2 mt-2 rounded-full ${e.color}`} />
                            <div className="flex-1">
                              <div className="font-medium">{e.t}</div>
                              <div className="text-muted-foreground">{e.l}</div>
                            </div>
                            <span className="text-xs text-muted-foreground">{fmt(e.d)}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultations" className="space-y-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("petDossier.consultations")} ({consultations.length})</CardTitle>
                  <Button size="sm" onClick={() => setShowConsultation(true)} className="gap-2"><Plus className="h-4 w-4" />{t("petDossier.new")}</Button>
                </CardHeader>
                <CardContent>
                  {consultations.length === 0 ? <p className="text-sm text-muted-foreground">{t("petDossier.noConsultations")}</p> :
                  <div className="space-y-2">
                    {consultations.map((c: any) => {
                      const linkedRx = prescriptions.filter((p: any) => p.consultation_id === c.id);
                      return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setSelectedConsult(c)}
                        className="w-full text-left border rounded p-3 text-sm hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
                          <span className="font-medium">{fmt(c.consultation_date)}</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {c.photos?.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />{c.photos.length}
                              </span>
                            )}
                            {linkedRx.length > 0 && (
                              <Badge variant="secondary" className="text-xs">{t("petDossier.prescription")}</Badge>
                            )}
                            <span className="text-muted-foreground text-xs">{c.consultation_type}</span>
                          </div>
                        </div>
                        {c.diagnosis && <div className="mt-1"><strong>{t("petDossier.diagnosis")}</strong> {c.diagnosis}</div>}
                        {c.treatment && <div><strong>{t("petDossier.treatment")}</strong> {c.treatment}</div>}
                        {linkedRx.map((p: any) => {
                          const meds = (p.medications || []).map((m: any) => m.medication_name).filter(Boolean);
                          if (meds.length === 0) return null;
                          return (
                            <div key={p.id} className="mt-1 text-xs text-muted-foreground">
                              <strong>{t("petDossier.medications")}</strong> {meds.join(", ")}
                            </div>
                          );
                        })}
                      </button>
                      );
                    })}
                  </div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vaccinations" className="space-y-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("petDossier.vaccinations")} ({vaccinations.length})</CardTitle>
                  <Button size="sm" onClick={() => setShowVaccination(true)} className="gap-2"><Plus className="h-4 w-4" />{t("petDossier.new")}</Button>
                </CardHeader>
                <CardContent>
                  {vaccinations.length === 0 ? <p className="text-sm text-muted-foreground">{t("petDossier.noVaccinations")}</p> :
                  <div className="space-y-2">
                    {vaccinations.map((v: any) => (
                      <div key={v.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between"><span className="font-medium">{v.vaccine_name}</span><span className="text-muted-foreground">{fmt(v.vaccination_date)}</span></div>
                        <div className="text-xs text-muted-foreground">{t("petDossier.typeLabel")} {v.vaccine_type || "—"} · {t("petDossier.batch")} {v.batch_number || "—"} · {t("petDossier.booster")} {fmt(v.next_due_date)}</div>
                      </div>
                    ))}
                  </div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="antiparasites" className="space-y-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("petDossier.antiparasitics")} ({antiparasitics.length})</CardTitle>
                  <Button size="sm" onClick={() => setShowAntiparasitic(true)} className="gap-2"><Plus className="h-4 w-4" />{t("petDossier.newM")}</Button>
                </CardHeader>
                <CardContent>
                  {antiparasitics.length === 0 ? <p className="text-sm text-muted-foreground">{t("petDossier.noTreatments")}</p> :
                  <div className="space-y-2">
                    {antiparasitics.map((a: any) => (
                      <div key={a.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between"><span className="font-medium">{a.product_name}</span><span className="text-muted-foreground">{fmt(a.treatment_date)}</span></div>
                        <div className="text-xs text-muted-foreground">{a.parasite_type || "—"} · {a.active_ingredient || ""} · {t("petDossier.next")} {fmt(a.next_treatment_date)}</div>
                      </div>
                    ))}
                  </div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("petDossier.prescriptions")} ({prescriptions.length})</CardTitle>
                  <Button size="sm" onClick={() => setShowPrescription(true)} className="gap-2"><Plus className="h-4 w-4" />{t("petDossier.new")}</Button>
                </CardHeader>
                <CardContent>
                  {prescriptions.length === 0 ? <p className="text-sm text-muted-foreground">{t("petDossier.noPrescriptions")}</p> :
                  <div className="space-y-3">
                    {prescriptions.map((p: any) => {
                      const meds = Array.isArray(p.medications) ? p.medications : [];
                      return (
                        <div key={p.id} className="border rounded p-3 text-sm space-y-2">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium">{fmt(p.prescription_date)}</span>
                            <Badge variant="outline">{p.status || "active"}</Badge>
                          </div>
                          {p.diagnosis && (
                            <div><span className="text-muted-foreground">{t("petDossier.diagnosis")}</span> {p.diagnosis}</div>
                          )}
                          {meds.length === 0 ? (
                            <p className="text-muted-foreground text-xs">{t("dossier.noMedication")}</p>
                          ) : (
                            <ul className="space-y-1.5 border-t pt-2">
                              {meds.map((m: any) => (
                                <li key={m.id} className="rounded bg-muted/40 px-2 py-1.5">
                                  <div className="font-medium">{m.medication_name || t("petDossier.medication")}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {[
                                      m.dosage,
                                      m.frequency,
                                      m.duration ? t("petDossier.forDuration", { duration: m.duration }) : null,
                                      m.quantity ? t("petDossier.qty", { qty: m.quantity }) : null,
                                    ].filter(Boolean).join(" · ") || t("petDossier.dosageMissing")}
                                  </div>
                                  {m.instructions && (
                                    <div className="text-xs text-muted-foreground mt-0.5">{m.instructions}</div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                          {p.notes && (
                            <div className="text-xs text-muted-foreground border-t pt-2">{t("petDossier.notes")} {p.notes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pedigree">
              <PedigreeSection animalId={animalId} />
            </TabsContent>
          </Tabs>
          </div>

          <div className="shrink-0 border-t px-3 py-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-background">
            <Button variant="outline" className="w-full sm:w-auto sm:ml-auto sm:flex" onClick={() => onOpenChange(false)}>
              {t("petDossier.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PrintMedicalRecordModal open={showPrint} onOpenChange={setShowPrint} animal={animalForPrint} />
      <NewConsultationModal
        open={showConsultation}
        onOpenChange={setShowConsultation}
        prefillData={{ clientId: pet.dbClientId, animalId: pet.dbId }}
      />
      <NewVaccinationModal
        open={showVaccination}
        onOpenChange={setShowVaccination}
        selectedAnimalId={pet.dbId}
      />
      <NewAntiparasiticModalDynamic
        open={showAntiparasitic}
        onOpenChange={setShowAntiparasitic}
        selectedAnimalId={pet.dbId}
        selectedClientId={pet.dbClientId}
      />
      <NewPrescriptionModal
        open={showPrescription}
        onOpenChange={setShowPrescription}
        petId={pet.dbId}
        consultationId=""
      />
      <NewAppointmentModal
        open={showAppointment}
        onOpenChange={setShowAppointment}
        prefillClientId={pet.dbClientId}
        prefillPetId={pet.dbId}
      />
      <ConsultationDetailModal
        open={!!selectedConsult}
        onOpenChange={(o) => !o && setSelectedConsult(null)}
        consultation={selectedConsult}
      />
    </>
  );
}
