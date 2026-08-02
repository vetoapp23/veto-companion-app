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

  if (!pet) return null;

  const age = pet.birthDate ? calculateAge(pet.birthDate) : "Non renseigné";
  const currentWeight = pet.weight ? `${pet.weight} kg` : "Non renseigné";
  const lastConsult = consultations[0];
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");

  // build animal-like object for print modal
  const animalForPrint = {
    id: animalId,
    name: pet.name,
    species: pet.type,
    breed: pet.breed,
    color: pet.color,
    sex: pet.gender === "male" ? "Mâle" : pet.gender === "female" ? "Femelle" : undefined,
    weight: pet.weight,
    birth_date: pet.birthDate,
    microchip_number: pet.microchip,
    status: pet.status,
    client_id: pet.dbClientId,
    owner: pet.owner,
  };

  const QuickAction = ({
    icon: Icon, label, onClick, color,
  }: { icon: any; label: string; onClick: () => void; color: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-1.5 h-auto py-2.5 px-1 flex-col items-center text-[11px] sm:text-xs w-full"
    >
      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
      <span className="leading-tight text-center">{label}</span>
    </Button>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          style={{ maxHeight: "100dvh" }}
          className={[
            "max-w-5xl gap-3 p-3 sm:p-6",
            "w-full max-sm:left-0 max-sm:top-0 max-sm:translate-x-0 max-sm:translate-y-0",
            "max-sm:w-full max-sm:max-w-none max-sm:h-[100dvh] max-sm:max-h-[100dvh]",
            "max-sm:rounded-none max-sm:border-0",
            "sm:w-[calc(100%-1.5rem)] sm:max-h-[90vh] sm:h-auto",
          ].join(" ")}
        >
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 pr-6">
              <span className="inline-flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-5 w-5 shrink-0" />
                {pet.name}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                Dossier médical · {pet.owner}
              </span>
            </DialogTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
              <div className="[&_button]:w-full sm:[&_button]:w-auto">
                <CertificateVaccinationPrintDynamic animalId={animalId} />
              </div>
              <Button
                onClick={() => setShowPrint(true)}
                variant="outline"
                size="sm"
                className="gap-2 w-full sm:w-auto justify-center"
              >
                <Printer className="h-4 w-4" />
                Imprimer / QR
              </Button>
            </div>
          </DialogHeader>

          {/* Quick actions */}
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <QuickAction icon={Stethoscope} label="Consult." color="text-emerald-600" onClick={() => setShowConsultation(true)} />
                <QuickAction icon={Syringe} label="Vaccin" color="text-blue-600" onClick={() => setShowVaccination(true)} />
                <QuickAction icon={AlertCircle} label="Anti-P." color="text-orange-600" onClick={() => setShowAntiparasitic(true)} />
                <QuickAction icon={ClipboardList} label="Ordo." color="text-purple-600" onClick={() => setShowPrescription(true)} />
                <QuickAction icon={CalendarPlus} label="RDV" color="text-pink-600" onClick={() => setShowAppointment(true)} />
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-h-0 flex-1">
            <div className="overflow-x-auto -mx-1 px-1 pb-1">
              <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-7 h-auto gap-1 p-1">
                <TabsTrigger value="overview" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  Vue
                </TabsTrigger>
                <TabsTrigger value="historique" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Historique
                </TabsTrigger>
                <TabsTrigger value="consultations" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Consult.
                </TabsTrigger>
                <TabsTrigger value="vaccinations" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Syringe className="h-3.5 w-3.5" />
                  Vaccins
                </TabsTrigger>
                <TabsTrigger value="antiparasites" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Anti-P.
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Ordo.
                </TabsTrigger>
                <TabsTrigger value="pedigree" className="shrink-0 text-xs sm:text-sm px-2.5 py-2 gap-1">
                  <Award className="h-3.5 w-3.5" />
                  Pédigrée
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4 mt-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <Avatar className="h-20 w-20 sm:h-28 sm:w-28 mx-auto sm:mx-0 shrink-0">
                      {pet.photo ? <AvatarImage src={pet.photo} alt={pet.name} /> :
                        <AvatarFallback className="bg-primary-glow text-primary-foreground">
                          <Heart className="h-10 w-10 sm:h-12 sm:w-12" />
                        </AvatarFallback>}
                    </Avatar>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm w-full">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-center sm:text-left">{pet.name}</h3>
                        <div><span className="font-medium text-muted-foreground">Type :</span> {pet.type}</div>
                        <div><span className="font-medium text-muted-foreground">Race :</span> {pet.breed || "—"}</div>
                        <div><span className="font-medium text-muted-foreground">Sexe :</span> {pet.gender === "male" ? "Mâle" : pet.gender === "female" ? "Femelle" : "—"}</div>
                        <div><span className="font-medium text-muted-foreground">Âge :</span> {age}</div>
                        <div><span className="font-medium text-muted-foreground">Naissance :</span> {pet.birthDate || "—"}</div>
                      </div>
                      <div className="space-y-2">
                        <div><span className="font-medium text-muted-foreground">Couleur :</span> {pet.color || "—"}</div>
                        <div><span className="font-medium text-muted-foreground">Poids :</span> {currentWeight}</div>
                        <div><span className="font-medium text-muted-foreground">N° puce :</span> {pet.microchip || "—"}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-muted-foreground">Statut :</span>
                          <Badge variant={pet.status === "healthy" ? "default" : pet.status === "treatment" ? "secondary" : "destructive"}>
                            {pet.status === "healthy" ? "En bonne santé" : pet.status === "treatment" ? "En traitement" : "Urgent"}
                          </Badge>
                        </div>
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span><span className="font-medium text-muted-foreground">Propriétaire :</span> {pet.owner}</span>
                        </div>
                        <div><span className="font-medium text-muted-foreground">Dernière visite :</span> {lastConsult ? fmt(lastConsult.consultation_date) : "Aucune"}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <Card><CardContent className="p-3 sm:p-4"><p className="text-xs text-muted-foreground">Consultations</p><p className="text-xl sm:text-2xl font-bold">{consultations.length}</p></CardContent></Card>
                <Card><CardContent className="p-3 sm:p-4"><p className="text-xs text-muted-foreground">Vaccinations</p><p className="text-xl sm:text-2xl font-bold">{vaccinations.length}</p></CardContent></Card>
                <Card><CardContent className="p-3 sm:p-4"><p className="text-xs text-muted-foreground">Antiparasitaires</p><p className="text-xl sm:text-2xl font-bold">{antiparasitics.length}</p></CardContent></Card>
                <Card><CardContent className="p-3 sm:p-4"><p className="text-xs text-muted-foreground">Ordonnances</p><p className="text-xl sm:text-2xl font-bold">{prescriptions.length}</p></CardContent></Card>
              </div>

              {pet.medicalNotes && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Notes / antécédents</CardTitle></CardHeader>
                  <CardContent><p className="text-sm whitespace-pre-line">{pet.medicalNotes}</p></CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="historique" className="space-y-2">
              <Card>
                <CardHeader><CardTitle>Frise chronologique</CardTitle></CardHeader>
                <CardContent>
                  {(() => {
                    const events = [
                      ...consultations.map((c: any) => ({ d: c.consultation_date, t: "Consultation", l: c.diagnosis || c.consultation_type, color: "bg-emerald-500" })),
                      ...vaccinations.map((v: any) => ({ d: v.vaccination_date, t: "Vaccination", l: v.vaccine_name, color: "bg-blue-500" })),
                      ...antiparasitics.map((a: any) => ({ d: a.treatment_date, t: "Antiparasitaire", l: a.product_name, color: "bg-orange-500" })),
                      ...prescriptions.map((p: any) => {
                        const meds = (p.medications || [])
                          .map((m: any) => m.medication_name)
                          .filter(Boolean)
                          .join(", ");
                        return {
                          d: p.prescription_date,
                          t: "Ordonnance",
                          l: meds || p.diagnosis || "Prescription",
                          color: "bg-purple-500",
                        };
                      }),
                    ].filter(e => e.d).sort((a, b) => (a.d < b.d ? 1 : -1));
                    if (events.length === 0) return <p className="text-sm text-muted-foreground">Aucun événement enregistré</p>;
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
                  <CardTitle>Consultations ({consultations.length})</CardTitle>
                  <Button size="sm" onClick={() => setShowConsultation(true)} className="gap-2"><Plus className="h-4 w-4" />Nouvelle</Button>
                </CardHeader>
                <CardContent>
                  {consultations.length === 0 ? <p className="text-sm text-muted-foreground">Aucune consultation.</p> :
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
                              <Badge variant="secondary" className="text-xs">Ordonnance</Badge>
                            )}
                            <span className="text-muted-foreground text-xs">{c.consultation_type}</span>
                          </div>
                        </div>
                        {c.diagnosis && <div className="mt-1"><strong>Diagnostic :</strong> {c.diagnosis}</div>}
                        {c.treatment && <div><strong>Traitement :</strong> {c.treatment}</div>}
                        {linkedRx.map((p: any) => {
                          const meds = (p.medications || []).map((m: any) => m.medication_name).filter(Boolean);
                          if (meds.length === 0) return null;
                          return (
                            <div key={p.id} className="mt-1 text-xs text-muted-foreground">
                              <strong>Médicaments :</strong> {meds.join(", ")}
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
                  <CardTitle>Vaccinations ({vaccinations.length})</CardTitle>
                  <Button size="sm" onClick={() => setShowVaccination(true)} className="gap-2"><Plus className="h-4 w-4" />Nouvelle</Button>
                </CardHeader>
                <CardContent>
                  {vaccinations.length === 0 ? <p className="text-sm text-muted-foreground">Aucune vaccination.</p> :
                  <div className="space-y-2">
                    {vaccinations.map((v: any) => (
                      <div key={v.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between"><span className="font-medium">{v.vaccine_name}</span><span className="text-muted-foreground">{fmt(v.vaccination_date)}</span></div>
                        <div className="text-xs text-muted-foreground">Type : {v.vaccine_type || "—"} · Lot : {v.batch_number || "—"} · Rappel : {fmt(v.next_due_date)}</div>
                      </div>
                    ))}
                  </div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="antiparasites" className="space-y-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Antiparasitaires ({antiparasitics.length})</CardTitle>
                  <Button size="sm" onClick={() => setShowAntiparasitic(true)} className="gap-2"><Plus className="h-4 w-4" />Nouveau</Button>
                </CardHeader>
                <CardContent>
                  {antiparasitics.length === 0 ? <p className="text-sm text-muted-foreground">Aucun traitement.</p> :
                  <div className="space-y-2">
                    {antiparasitics.map((a: any) => (
                      <div key={a.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between"><span className="font-medium">{a.product_name}</span><span className="text-muted-foreground">{fmt(a.treatment_date)}</span></div>
                        <div className="text-xs text-muted-foreground">{a.parasite_type || "—"} · {a.active_ingredient || ""} · Prochain : {fmt(a.next_treatment_date)}</div>
                      </div>
                    ))}
                  </div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Ordonnances ({prescriptions.length})</CardTitle>
                  <Button size="sm" onClick={() => setShowPrescription(true)} className="gap-2"><Plus className="h-4 w-4" />Nouvelle</Button>
                </CardHeader>
                <CardContent>
                  {prescriptions.length === 0 ? <p className="text-sm text-muted-foreground">Aucune ordonnance.</p> :
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
                            <div><span className="text-muted-foreground">Diagnostic :</span> {p.diagnosis}</div>
                          )}
                          {meds.length === 0 ? (
                            <p className="text-muted-foreground text-xs">Aucun médicament enregistré</p>
                          ) : (
                            <ul className="space-y-1.5 border-t pt-2">
                              {meds.map((m: any) => (
                                <li key={m.id} className="rounded bg-muted/40 px-2 py-1.5">
                                  <div className="font-medium">{m.medication_name || "Médicament"}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {[
                                      m.dosage,
                                      m.frequency,
                                      m.duration ? `pendant ${m.duration}` : null,
                                      m.quantity ? `Qté : ${m.quantity}` : null,
                                    ].filter(Boolean).join(" · ") || "Posologie non renseignée"}
                                  </div>
                                  {m.instructions && (
                                    <div className="text-xs text-muted-foreground mt-0.5">{m.instructions}</div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                          {p.notes && (
                            <div className="text-xs text-muted-foreground border-t pt-2">Notes : {p.notes}</div>
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

          <div className="flex justify-stretch sm:justify-end pt-2 pb-[env(safe-area-inset-bottom)]">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Fermer
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
