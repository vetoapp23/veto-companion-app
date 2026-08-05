import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreateConsultation, useCreatePrescription, useStockItems } from "@/hooks/useDatabase";
import { NewClientModal } from "./NewClientModal";
import { NewPetModal } from "./NewPetModal";
import {
  PrescriptionMedicationsFields,
  emptyPrescriptionMed,
  buildPrescriptionMedPayload,
  type PrescriptionMedDraft,
} from "./PrescriptionMedicationsFields";
import { PrescriptionPrint } from "@/components/PrescriptionPrint";
import { transformDbPrescriptionForPrint } from "@/lib/prescriptionPrint";

import { Plus, User, Heart, Pill } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext"; // Added for dynamic currency
import type { Animal, Client, CreateConsultationData } from "@/lib/database";
import { compressPhoto, recordStorageChange, estimateDataUrlBytes } from "@/lib/photoCompression";
import { Loader2 } from "lucide-react";
import { roundTemperature, temperatureInputValue } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface NewConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillData?: Partial<CreateConsultationData & { clientId: string; animalId: string; visit_id?: string }>;
  onCreated?: (consultation: { id: string }) => void;
}

export function NewConsultationModal({ open, onOpenChange, prefillData, onCreated }: NewConsultationModalProps) {
  const { t } = useTranslation("medical");
  const { t: tc } = useTranslation("common");
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const createConsultationMutation = useCreateConsultation();
  const createPrescriptionMutation = useCreatePrescription();
  const { data: stockItems = [] } = useStockItems();
  const { toast } = useToast();
  const { settings } = useSettings(); // Destructure currency for cost label
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [withPrescription, setWithPrescription] = useState(false);
  const [rxMedications, setRxMedications] = useState<PrescriptionMedDraft[]>([emptyPrescriptionMed()]);
  const [createdRxForPrint, setCreatedRxForPrint] = useState<any | null>(null);

  
  const [formData, setFormData] = useState({
    clientId: prefillData?.clientId || "",
    clientName: "",
    animalId: prefillData?.animalId || "",
    animalName: "",
    date: prefillData?.consultation_date ? new Date(prefillData.consultation_date).toISOString().split('T')[0] : "",
    weight: prefillData?.weight?.toString() || "",
    temperature: temperatureInputValue(prefillData?.temperature) || "",
    symptoms: prefillData?.symptoms || "",
    diagnosis: prefillData?.diagnosis || "",
    treatment: prefillData?.treatment || "",
    followUp: prefillData?.follow_up_notes || "",
    notes: prefillData?.notes || "",
    photos: prefillData?.photos || [] as string[]
  });

  // Filtrer les animaux selon le client sélectionné
  const availablePets = animals.filter(animal => animal.client_id === formData.clientId);

  // Get today's date in YYYY-MM-DD format for default date
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    if (field === 'clientId') {
      const selectedClient = clients.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        clientId: value,
        clientName: selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : "",
        animalId: "",
        animalName: ""
      }));
    } else if (field === 'animalId') {
      const selectedAnimal = animals.find(a => a.id === value);
      setFormData(prev => ({
        ...prev,
        animalId: value,
        animalName: selectedAnimal?.name || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive form validation
    const validationErrors: string[] = [];
    
    if (!formData.clientId) {
      validationErrors.push(t("alerts.selectClient"));
    }
    
    if (!formData.animalId) {
      validationErrors.push(t("alerts.selectAnimal"));
    }
    
    if (!formData.date) {
      validationErrors.push(t("alerts.selectConsultationDate"));
    } else {
      const consultationDate = new Date(formData.date);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (consultationDate > oneYearFromNow) {
        validationErrors.push(t("alerts.consultationDateTooFar"));
      }
    }
    
    // Validate numeric fields
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0 || weight > 999.9) {
        validationErrors.push(t("alerts.weightInvalid"));
      }
    }
    
    if (formData.temperature) {
      const temperature = parseFloat(formData.temperature);
      if (isNaN(temperature) || temperature < 30 || temperature > 50) {
        validationErrors.push(t("alerts.temperatureInvalid"));
      }
    }
    
    // Validate text field lengths
    if (formData.symptoms && formData.symptoms.length > 1000) {
      validationErrors.push(t("alerts.symptomsTooLong"));
    }
    
    if (formData.diagnosis && formData.diagnosis.length > 1000) {
      validationErrors.push(t("alerts.diagnosisTooLong"));
    }
    
    if (formData.treatment && formData.treatment.length > 1000) {
      validationErrors.push(t("alerts.treatmentTooLong"));
    }
    
    if (formData.notes && formData.notes.length > 2000) {
      validationErrors.push(t("alerts.notesTooLong"));
    }
    
    if (formData.followUp && formData.followUp.length > 500) {
      validationErrors.push(t("alerts.followUpTooLong"));
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: t("alerts.formIncomplete"),
        description: validationErrors[0], // Show first error
        variant: "destructive",
      });
      return;
    }
    
    try {
      let prescriptionMeds: ReturnType<typeof buildPrescriptionMedPayload> = [];
      if (withPrescription) {
        try {
          prescriptionMeds = buildPrescriptionMedPayload(rxMedications, stockItems);
        } catch (stockErr: any) {
          toast({
            title: t("alerts.insufficientStock"),
            description: stockErr?.message || t("alerts.cannotGeneratePrescription"),
            variant: "destructive",
          });
          return;
        }
        if (prescriptionMeds.length === 0) {
          toast({
            title: t("forms.prescriptionIncomplete"),
            description: t("alerts.prescriptionIncompleteBody"),
            variant: "destructive",
          });
          return;
        }
      }

      const treatmentFromRx =
        withPrescription && prescriptionMeds.length > 0
          ? prescriptionMeds
              .map((m) => {
                const bits = [m.medication_name, m.dosage, m.frequency, m.duration].filter(Boolean);
                return bits.join(" — ");
              })
              .join("; ")
          : "";

      // Create consultation data for database
      const consultationData: CreateConsultationData & { consultation_date: string; visit_id?: string } = {
        client_id: formData.clientId,
        animal_id: formData.animalId,
        consultation_type: prefillData?.consultation_type || "routine",
        consultation_date: formData.date || today,
        weight: formData.weight ? Math.min(parseFloat(formData.weight), 999.9) : undefined,
        temperature: formData.temperature
          ? roundTemperature(Math.min(parseFloat(formData.temperature), 99.9)) ?? undefined
          : undefined,
        symptoms: formData.symptoms.trim() || undefined,
        diagnosis: formData.diagnosis.trim() || undefined,
        treatment:
          formData.treatment.trim() ||
          (treatmentFromRx || undefined),
        follow_up_notes: formData.followUp.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        photos: formData.photos && formData.photos.length > 0 ? formData.photos : undefined,
        visit_id: prefillData?.visit_id,
      };

      console.log("[consultation] submitting with photos:", formData.photos?.length || 0);
      const created = await createConsultationMutation.mutateAsync(consultationData);
      onCreated?.(created);

      let rxCreated: any = null;
      const animalLabel = formData.animalName;
      const clientLabel = formData.clientName;
      if (withPrescription && prescriptionMeds.length > 0) {
        rxCreated = await createPrescriptionMutation.mutateAsync({
          consultation_id: created.id,
          visit_id: prefillData?.visit_id || null,
          animal_id: formData.animalId,
          client_id: formData.clientId,
          diagnosis: formData.diagnosis.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          medications: prescriptionMeds,
        });
        setCreatedRxForPrint({
          ...rxCreated,
          _animalLabel: animalLabel,
          _clientLabel: clientLabel,
          medications: prescriptionMeds.map((m, i) => ({
            id: `tmp-${i}`,
            medication_name: m.medication_name,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            quantity: m.quantity,
            instructions: m.instructions,
            route: m.route,
          })),
        });
      }

      toast({
        title: withPrescription && rxCreated ? t("alerts.consultationWithRx") : t("alerts.consultationSaved"),
        description:
          withPrescription && rxCreated
            ? t("alerts.consultationWithRxBody", { name: animalLabel })
            : t("alerts.consultationSavedBody", { name: animalLabel }),
      });

      // Reset form
      setFormData({
        clientId: "",
        clientName: "",
        animalId: "",
        animalName: "",
        date: today,
        weight: "",
        temperature: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        followUp: "",
        notes: "",
        photos: []
      });
      setWithPrescription(false);
      setRxMedications([emptyPrescriptionMed()]);

      if (!(withPrescription && rxCreated)) {
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error creating consultation:', error);
      
      let errorMessage = t("alerts.unexpectedError");
      
      // Handle specific error types
      if (error?.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('foreign key') || errorMsg.includes('constraint')) {
          errorMessage = t("alerts.clientOrAnimalGone");
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
          errorMessage = t("alerts.connectionProblem");
        } else if (errorMsg.includes('permission') || errorMsg.includes('unauthorized') || errorMsg.includes('authorized')) {
          errorMessage = t("alerts.noPermissionConsultation");
        } else if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
          errorMessage = t("alerts.duplicateConsultation");
        } else if (errorMsg.includes('authentication')) {
          errorMessage = t("alerts.sessionExpired");
        } else if (error.message.length < 100) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t("alerts.cannotSaveConsultation"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Reset form when modal opens (respecting prefillData)
  useEffect(() => {
    if (open) {
      const preClient = prefillData?.clientId ? clients.find(c => c.id === prefillData.clientId) : null;
      const preAnimal = prefillData?.animalId ? animals.find(a => a.id === prefillData.animalId) : null;
      setFormData({
        clientId: prefillData?.clientId || "",
        clientName: preClient ? `${preClient.first_name} ${preClient.last_name}` : "",
        animalId: prefillData?.animalId || "",
        animalName: preAnimal?.name || "",
        date: prefillData?.consultation_date ? new Date(prefillData.consultation_date).toISOString().split('T')[0] : today,
        weight: prefillData?.weight?.toString() || "",
        temperature: temperatureInputValue(prefillData?.temperature) || "",
        symptoms: prefillData?.symptoms || "",
        diagnosis: prefillData?.diagnosis || "",
        treatment: prefillData?.treatment || "",
        followUp: prefillData?.follow_up_notes || "",
        notes: prefillData?.notes || "",
        photos: prefillData?.photos || []
      });
    }
  }, [open, today, prefillData, clients, animals]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("forms.newConsultation")}</DialogTitle>
            <DialogDescription>
              {t("forms.consultationDesc")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{tc("client")} *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.clientId.toString()} 
                    onValueChange={(value) => handleSelectChange("clientId", value)}
                    disabled={clientsLoading}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={clientsLoading ? t("forms.loadingClients") : t("forms.selectClient")} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 && !clientsLoading ? (
                        <SelectItem value="__none__" disabled>{t("forms.noClients")}</SelectItem>
                      ) : (
                        clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.first_name} {client.last_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowClientModal(true)}
                    className="px-2"
                    disabled={clientsLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{tc("animal")} *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.animalId} 
                    onValueChange={(value) => handleSelectChange("animalId", value)}
                    disabled={!formData.clientId || animalsLoading}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={
                        !formData.clientId 
                          ? t("forms.selectClientFirst")
                          : animalsLoading 
                            ? t("forms.loadingAnimals")
                            : availablePets.length === 0
                              ? t("forms.noAnimalsForClient")
                              : t("forms.selectAnimal")
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePets.length === 0 && formData.clientId && !animalsLoading ? (
                        <SelectItem value="__none__" disabled>{t("forms.noAnimalsForClient")}</SelectItem>
                      ) : (
                        availablePets.map(animal => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.name} ({animal.species})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowPetModal(true)}
                    className="px-2"
                    disabled={!formData.clientId || animalsLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">{tc("date")} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || today}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">{t("forms.weightKg")}</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="999.9"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="ex: 25.5"
                  title="Poids en kilogrammes (0.1 à 999.9 kg)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">{t("forms.temperatureC")}</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.01"
                  min="30"
                  max="50"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="ex: 38.50"
                  title="Température corporelle (30°C à 50°C)"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="symptoms">{t("forms.symptomsLabel")}</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder={t("forms.symptomsPlaceholder")}
                rows={3}
                maxLength={1000}
                title="Maximum 1000 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {t("forms.charsCount", { count: formData.symptoms.length, max: 1000 })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis">{t("forms.diagnosisLabel")}</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder={t("forms.diagnosisPlaceholder")}
                rows={3}
                maxLength={1000}
                title="Maximum 1000 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {t("forms.charsCount", { count: formData.diagnosis.length, max: 1000 })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="treatment">{t("forms.treatmentAdministeredLabel")}</Label>
              <Textarea
                id="treatment"
                value={formData.treatment}
                onChange={handleChange}
                placeholder={t("forms.treatmentPlaceholder")}
                rows={3}
                maxLength={1000}
                title="Maximum 1000 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {t("forms.charsCount", { count: formData.treatment.length, max: 1000 })}
              </div>
            </div>

            {/* Ordonnance optionnelle */}
            <div className="rounded-lg border border-border p-4 space-y-4 bg-background">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="with-prescription" className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                    <Pill className="h-4 w-4 text-primary" />
                    {t("forms.generatePrescription")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("forms.generatePrescriptionHint")}
                  </p>
                </div>
                <Switch
                  id="with-prescription"
                  checked={withPrescription}
                  onCheckedChange={setWithPrescription}
                />
              </div>

              {withPrescription && (
                <PrescriptionMedicationsFields
                  medications={rxMedications}
                  onChange={setRxMedications}
                  stockItems={stockItems as any}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="followUp">{t("forms.followUpLabel")}</Label>
              <Input
                id="followUp"
                value={formData.followUp}
                onChange={handleChange}
                placeholder={t("forms.followUpPlaceholder")}
                maxLength={500}
                title="Maximum 500 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {t("forms.charsCount", { count: formData.followUp.length, max: 500 })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">{t("forms.additionalNotes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder={t("forms.additionalNotesPlaceholder")}
                rows={3}
                maxLength={2000}
                title="Maximum 2000 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {t("forms.charsCount", { count: formData.notes.length, max: 2000 })}
              </div>
            </div>
            {/* Photos upload */}
            <div className="space-y-2 col-span-2">
              <Label>{t("forms.consultationPhotos")}</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingPhotos}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  setUploadingPhotos(true);
                  try {
                    const results = await Promise.all(
                      files.map(async (file) => {
                        try {
                          const c = await compressPhoto(file);
                          return c.dataUrl;
                        } catch (err) {
                          console.error("[consultation] compress failed, fallback raw", err);
                          return await new Promise<string>((res, rej) => {
                            const reader = new FileReader();
                            reader.onload = () => res(reader.result as string);
                            reader.onerror = rej;
                            reader.readAsDataURL(file);
                          });
                        }
                      })
                    );
                    const totalBytes = results.reduce((s, u) => s + estimateDataUrlBytes(u), 0);
                    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...results] }));
                    recordStorageChange("consultation", totalBytes, results.length).catch(() => {});
                    toast({ title: t("alerts.photosAdded"), description: t("alerts.photosAddedBody", { count: results.length }) });
                  } catch (err: any) {
                    console.error("[consultation] photo upload error", err);
                    toast({ title: t("alerts.photosError"), description: err?.message || t("alerts.cannotProcessImages"), variant: "destructive" });
                  } finally {
                    setUploadingPhotos(false);
                    e.target.value = "";
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
              />
              {uploadingPhotos && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> {t("forms.compressingPhotos")}
                </div>
              )}
              {formData.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-2">
                  {formData.photos.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img src={src} alt={`photo-${idx}`} className="h-24 w-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={createConsultationMutation.isPending || createPrescriptionMutation.isPending}
              >
                {tc("cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={
                  !formData.clientId || 
                  !formData.animalId || 
                  createConsultationMutation.isPending ||
                  createPrescriptionMutation.isPending ||
                  uploadingPhotos ||
                  clientsLoading ||
                  animalsLoading
                }
              >
                {createConsultationMutation.isPending || createPrescriptionMutation.isPending
                  ? tc("saving")
                  : uploadingPhotos
                    ? tc("processing")
                    : withPrescription
                      ? t("forms.generatePrescription")
                      : tc("save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Après création avec ordonnance : imprimer / télécharger */}
      <Dialog
        open={!!createdRxForPrint}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedRxForPrint(null);
            onOpenChange(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              {t("forms.prescriptionCreated")}
            </DialogTitle>
            <DialogDescription>
              {t("forms.prescriptionCreatedDesc")}
            </DialogDescription>
          </DialogHeader>
          {createdRxForPrint && (
            <div className="flex flex-col gap-3">
              <PrescriptionPrint
                prescription={
                  transformDbPrescriptionForPrint({
                    ...createdRxForPrint,
                    animal: createdRxForPrint.animal || { name: createdRxForPrint._animalLabel || "" },
                    client: createdRxForPrint.client || (() => {
                      const parts = String(createdRxForPrint._clientLabel || "").trim().split(/\s+/);
                      return {
                        first_name: parts[0] || "",
                        last_name: parts.slice(1).join(" ") || "",
                      };
                    })(),
                    medications: createdRxForPrint.medications || [],
                  }) as any
                }
              />
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedRxForPrint(null);
                  onOpenChange(false);
                }}
              >
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <NewClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal} 
      />
      
      <NewPetModal 
        open={showPetModal} 
        onOpenChange={setShowPetModal} 
      />
      

    </>
  );
}