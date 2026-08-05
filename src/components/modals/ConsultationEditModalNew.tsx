import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useUpdateConsultation, type Consultation } from "@/hooks/useDatabase";
import type { CreateConsultationData } from "@/lib/database";
import { useSettings } from "@/contexts/SettingsContext";
import { roundTemperature, temperatureInputValue } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ConsultationEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation | null;
}

export function ConsultationEditModalNew({ open, onOpenChange, consultation }: ConsultationEditModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const updateConsultationMutation = useUpdateConsultation();
  const { toast } = useToast();
  const { settings } = useSettings();
  const { t } = useTranslation("medical");
  const { t: tc } = useTranslation("common");
  
  const [formData, setFormData] = useState({
    client_id: "",
    animal_id: "",
    consultation_date: "",
    consultation_type: "routine",
    weight: "",
    temperature: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    follow_up_date: "",
    follow_up_notes: "",
    status: "completed"
  });

  // Filtrer les animaux selon le client sélectionné
  const availablePets = animals.filter(animal => animal.client_id === formData.client_id);

  useEffect(() => {
    if (consultation && open) {
      setFormData({
        client_id: consultation.client_id || "",
        animal_id: consultation.animal_id || "",
        consultation_date: consultation.consultation_date ? consultation.consultation_date.split('T')[0] : "",
        consultation_type: consultation.consultation_type || "routine",
        weight: consultation.weight?.toString() || "",
        temperature: temperatureInputValue(consultation.temperature) || "",
        symptoms: consultation.symptoms || "",
        diagnosis: consultation.diagnosis || "",
        treatment: consultation.treatment || "",
        notes: consultation.notes || "",
        follow_up_date: consultation.follow_up_date || "",
        follow_up_notes: consultation.follow_up_notes || "",
        status: consultation.status || "completed"
      });
    }
  }, [consultation, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // When client changes, reset animal selection
    if (field === 'client_id') {
      setFormData(prev => ({
        ...prev,
        animal_id: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consultation) {
      toast({
        title: tc("error"),
        description: t("forms.noConsultationToEdit"),
        variant: "destructive",
      });
      return;
    }

    // Comprehensive form validation
    const validationErrors: string[] = [];
    
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
    
    if (formData.follow_up_notes && formData.follow_up_notes.length > 500) {
      validationErrors.push(t("alerts.followUpTooLong"));
    }
    
    // Validate follow-up date if provided
    if (formData.follow_up_date) {
      const followUpDate = new Date(formData.follow_up_date);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (followUpDate > oneYearFromNow) {
        validationErrors.push(t("alerts.followUpDateTooFar"));
      }
      
      const consultationDate = new Date(consultation.consultation_date);
      if (followUpDate < consultationDate) {
        validationErrors.push(t("alerts.followUpDateBeforeConsultation"));
      }
    }
    
    // Validate status
    const validStatuses = ["scheduled", "in-progress", "completed", "cancelled"];
    if (formData.status && !validStatuses.includes(formData.status)) {
      validationErrors.push(t("alerts.invalidStatus"));
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: t("alerts.validationErrors"),
        description: validationErrors.join(". "),
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: Partial<CreateConsultationData> = {
        // Note: client_id and animal_id are not included as they are read-only in edit mode
        consultation_type: formData.consultation_type,
        symptoms: formData.symptoms?.trim() || undefined,
        diagnosis: formData.diagnosis?.trim() || undefined,
        treatment: formData.treatment?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        temperature: formData.temperature
          ? roundTemperature(parseFloat(formData.temperature)) ?? undefined
          : undefined,
        follow_up_date: formData.follow_up_date || null,
        follow_up_notes: formData.follow_up_notes?.trim() || undefined,
        status: formData.status as "scheduled" | "in-progress" | "completed" | "cancelled"
      };

      await updateConsultationMutation.mutateAsync({ 
        id: consultation.id, 
        data: updateData 
      });

      toast({
        title: t("alerts.consultationUpdated"),
        description: t("alerts.editConsultationSuccessBody"),
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating consultation:', error);
      
      let errorMessage = t("alerts.editConsultationGenericError");
      
      if (error?.message) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          errorMessage = t("alerts.consultationGone");
        } else if (error.message.includes('foreign key constraint')) {
          errorMessage = t("alerts.clientOrAnimalGone");
        } else if (error.message.includes('network')) {
          errorMessage = t("alerts.connectionProblem");
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          errorMessage = t("alerts.noPermissionEditConsultation");
        } else if (error.message.includes('version') || error.message.includes('conflict')) {
          errorMessage = t("alerts.consultationConflict");
        }
      }
      
      toast({
        title: t("alerts.editConsultationError"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const selectedClient = clients.find(client => client.id === formData.client_id);
  const selectedAnimal = animals.find(animal => animal.id === formData.animal_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("forms.editConsultation")}</DialogTitle>
          <DialogDescription>
            {t("forms.editConsultationInfo")}
          </DialogDescription>
        </DialogHeader>

        {!consultation ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>{t("forms.noConsultationSelected")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only consultation context */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t("forms.consultationFor")}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t("forms.clientLabel")}</span>{' '}
                <span className="font-medium">
                  {clients.find(c => c.id === formData.client_id)?.first_name} {clients.find(c => c.id === formData.client_id)?.last_name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("forms.animalLabelShort")}</span>{' '}
                <span className="font-medium">
                  {availablePets.find(a => a.id === formData.animal_id)?.name} ({availablePets.find(a => a.id === formData.animal_id)?.species})
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consultation_date">{t("forms.consultationDate")}</Label>
              <Input
                id="consultation_date"
                type="date"
                value={formData.consultation_date}
                onChange={handleChange}
                className="bg-muted/50"
                readOnly
                title={t("forms.dateReadOnlyTitle")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultation_type">{t("forms.consultationType")}</Label>
              <Select value={formData.consultation_type} onValueChange={(value) => handleSelectChange('consultation_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">{t("forms.consultationTypes.routine")}</SelectItem>
                  <SelectItem value="emergency">{t("forms.consultationTypes.emergency")}</SelectItem>
                  <SelectItem value="follow-up">{t("forms.consultationTypes.followUp")}</SelectItem>
                  <SelectItem value="vaccination">{t("forms.consultationTypes.vaccination")}</SelectItem>
                  <SelectItem value="surgery">{t("forms.consultationTypes.surgery")}</SelectItem>
                </SelectContent>
              </Select>
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
                placeholder={t("forms.weightExample")}
                value={formData.weight}
                onChange={handleChange}
                title={t("forms.weightTitle")}
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
                placeholder={t("forms.temperatureExample")}
                value={formData.temperature}
                onChange={handleChange}
                title={t("forms.temperatureTitle")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">{t("forms.symptomsLabel")}</Label>
            <Textarea
              id="symptoms"
              placeholder={t("forms.symptomsDescPlaceholder")}
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              title={t("forms.maxChars", { count: 1000 })}
            />
            <div className="text-xs text-muted-foreground text-right">
              {t("forms.charsCount", { count: (formData.symptoms || '').length, max: 1000 })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">{t("forms.diagnosisLabel")}</Label>
            <Textarea
              id="diagnosis"
              placeholder={t("forms.diagnosisPosedPlaceholder")}
              value={formData.diagnosis}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              title={t("forms.maxChars", { count: 1000 })}
            />
            <div className="text-xs text-muted-foreground text-right">
              {t("forms.charsCount", { count: (formData.diagnosis || '').length, max: 1000 })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">{t("forms.treatmentShort")}</Label>
            <Textarea
              id="treatment"
              placeholder={t("forms.treatmentPrescribedPlaceholder")}
              value={formData.treatment}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              title={t("forms.maxChars", { count: 1000 })}
            />
            <div className="text-xs text-muted-foreground text-right">
              {t("forms.charsCount", { count: (formData.treatment || '').length, max: 1000 })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_date">{t("forms.followUpDate")}</Label>
            <Input
              id="follow_up_date"
              type="date"
              value={formData.follow_up_date}
              onChange={handleChange}
              title={t("forms.followUpDateTitle")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_notes">{t("forms.followUpNotes")}</Label>
            <Textarea
              id="follow_up_notes"
              placeholder={t("forms.followUpNotesPlaceholder")}
              value={formData.follow_up_notes}
              onChange={handleChange}
              rows={2}
              maxLength={500}
              title={t("forms.maxChars", { count: 500 })}
            />
            <div className="text-xs text-muted-foreground text-right">
              {t("forms.charsCount", { count: (formData.follow_up_notes || '').length, max: 500 })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("forms.additionalNotes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("forms.additionalNotesPlaceholder")}
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              maxLength={2000}
              title={t("forms.maxChars", { count: 2000 })}
            />
            <div className="text-xs text-muted-foreground text-right">
              {t("forms.charsCount", { count: (formData.notes || '').length, max: 2000 })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{tc("status")}</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">{t("forms.consultationStatuses.scheduled")}</SelectItem>
                <SelectItem value="in-progress">{t("forms.consultationStatuses.inProgress")}</SelectItem>
                <SelectItem value="completed">{t("forms.consultationStatuses.completed")}</SelectItem>
                <SelectItem value="cancelled">{t("forms.consultationStatuses.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateConsultationMutation.isPending}
            >
              {tc("cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={updateConsultationMutation.isPending || !consultation}
            >
              {updateConsultationMutation.isPending ? tc("saving") : tc("edit")}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}