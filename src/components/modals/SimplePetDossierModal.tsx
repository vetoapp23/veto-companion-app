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
      className="gap-2 h-auto py-2 flex-col items-center text-xs"
    >
      <Icon className={`h-5 w-5 ${color}`} />
      {label}
    </Button>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dossier Médical — {pet.name} <span className="text-sm font-normal text-muted-foreground">({pet.owner})</span>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <CertificateVaccinationPrintDynamic animalId={animalId} />
                <Button onClick={() => setShowPrint(true)} variant="outline" size="sm" className="gap-2">
                  <Printer className="h-4 w-4" /> Dossier (Imprimer / PDF)
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Quick actions */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <QuickAction icon={Stethoscope} label="Consultation" color="text-emerald-600" onClick={() => setShowConsultation(true)} />
                <QuickAction icon={Syringe} label="Vaccination" color="text-blue-600" onClick={() => setShowVaccination(true)} />
                <QuickAction icon={AlertCircle} label="Antiparasitaire" color="text-orange-600" onClick={() => setShowAntiparasitic(true)} />
                <QuickAction icon={ClipboardList} label="Ordonnance" color="text-purple-600" onClick={() => setShowPrescription(true)} />
                <QuickAction icon={CalendarPlus} label="Rendez-vous" color="text-pink-600" onClick={() => setShowAppointment(true)} />
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview"><Activity className="h-4 w-4 mr-1" />Vue</TabsTrigger>
              <TabsTrigger value="historique"><Calendar className="h-4 w-4 mr-1" />Historique</TabsTrigger>
              <TabsTrigger value="consultations"><Stethoscope className="h-4 w-4 mr-1" />Consult.</TabsTrigger>
              <TabsTrigger value="vaccinations"><Syringe className="h-4 w-4 mr-1" />Vaccins</TabsTrigger>
              <TabsTrigger value="antiparasites"><AlertCircle className="h-4 w-4 mr-1" />Antiparas.</TabsTrigger>
              <TabsTrigger value="prescriptions"><FileText className="h-4 w-4 mr-1" />Ordo.</TabsTrigger>
              <TabsTrigger value="pedigree"><Award className="h-4 w-4 mr-1" />Pédigrée</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-start gap-6">
                    <Avatar className="h-28 w-28">
                      {pet.photo ? <AvatarImage src={pet.photo} alt={pet.name} /> :
                        <AvatarFallback className="bg-primary-glow text-primary-foreground">
                          <Heart className="h-12 w-12" />
                        </AvatarFallback>}
                    </Avatar>
                    <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{pet.name}</h3>
                        <div><span className="font-medium">Type :</span> {pet.type}</div>
                        <div><span className="font-medium">Race :</span> {pet.breed || "—"}</div>
                        <div><span className="font-medium">Sexe :</span> {pet.gender === "male" ? "Mâle" : pet.gender === "female" ? "Femelle" : "—"}</div>
                        <div><span className="font-medium">Âge :</span> {age}</div>
                        <div><span className="font-medium">Naissance :</span> {pet.birthDate || "—"}</div>
                      </div>
                      <div className="space-y-2">
                        <div><span className="font-medium">Couleur :</span> {pet.color || "—"}</div>
                        <div><span className="font-medium">Poids :</span> {currentWeight}</div>
                        <div><span className="font-medium">N° puce :</span> {pet.microchip || "—"}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Statut :</span>
                          <Badge variant={pet.status === "healthy" ? "default" : pet.status === "treatment" ? "secondary" : "destructive"}>
                            {pet.status === "healthy" ? "En bonne santé" : pet.status === "treatment" ? "En traitement" : "Urgent"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Propriétaire :</span> {pet.owner}</div>
                        <div><span className="font-medium">Dernière visite :</span> {lastConsult ? fmt(lastConsult.consultation_date) : "Aucune"}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Consultations</p><p className="text-2xl font-bold">{consultations.length}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Vaccinations</p><p className="text-2xl font-bold">{vaccinations.length}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Antiparasitaires</p><p className="text-2xl font-bold">{antiparasitics.length}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ordonnances</p><p className="text-2xl font-bold">{prescriptions.length}</p></CardContent></Card>
              </div>

              {pet.medicalNotes && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Notes / antécédents</CardTitle></CardHeader>
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
                      ...prescriptions.map((p: any) => ({ d: p.prescription_date, t: "Ordonnance", l: p.diagnosis || "Prescription", color: "bg-purple-500" })),
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
                    {consultations.map((c: any) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setSelectedConsult(c)}
                        className="w-full text-left border rounded p-3 text-sm hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{fmt(c.consultation_date)}</span>
                          <div className="flex items-center gap-2">
                            {c.photos?.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />{c.photos.length}
                              </span>
                            )}
                            <span className="text-muted-foreground text-xs">{c.consultation_type}</span>
                          </div>
                        </div>
                        {c.diagnosis && <div className="mt-1"><strong>Diagnostic :</strong> {c.diagnosis}</div>}
                        {c.treatment && <div><strong>Traitement :</strong> {c.treatment}</div>}
                      </button>
                    ))}
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
                  <div className="space-y-2">
                    {prescriptions.map((p: any) => (
                      <div key={p.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between"><span className="font-medium">{fmt(p.prescription_date)}</span><Badge variant="outline">{p.status}</Badge></div>
                        {p.diagnosis && <div className="mt-1">{p.diagnosis}</div>}
                      </div>
                    ))}
                  </div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pedigree">
              <PedigreeSection animalId={animalId} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
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
    </>
  );
}
