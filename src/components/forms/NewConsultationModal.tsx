import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreateConsultation } from "@/hooks/useDatabase";
import { NewClientModal } from "./NewClientModal";
import { NewPetModal } from "./NewPetModal";

import { Plus, User, Heart } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext"; // Added for dynamic currency
import type { Animal, Client, CreateConsultationData } from "@/lib/database";
import { compressPhoto, recordStorageChange, estimateDataUrlBytes } from "@/lib/photoCompression";
import { Loader2 } from "lucide-react";

interface NewConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillData?: Partial<CreateConsultationData & { clientId: string; animalId: string }>;
}

export function NewConsultationModal({ open, onOpenChange, prefillData }: NewConsultationModalProps) {
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const createConsultationMutation = useCreateConsultation();
  const { toast } = useToast();
  const { settings } = useSettings(); // Destructure currency for cost label
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  
  const [formData, setFormData] = useState({
    clientId: prefillData?.clientId || "",
    clientName: "",
    animalId: prefillData?.animalId || "",
    animalName: "",
    date: prefillData?.consultation_date ? new Date(prefillData.consultation_date).toISOString().split('T')[0] : "",
    weight: prefillData?.weight?.toString() || "",
    temperature: prefillData?.temperature?.toString() || "",
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
      validationErrors.push("Veuillez sélectionner un client");
    }
    
    if (!formData.animalId) {
      validationErrors.push("Veuillez sélectionner un animal");
    }
    
    if (!formData.date) {
      validationErrors.push("Veuillez sélectionner une date de consultation");
    } else {
      const consultationDate = new Date(formData.date);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (consultationDate > oneYearFromNow) {
        validationErrors.push("La date de consultation ne peut pas être plus d'un an dans le futur");
      }
    }
    
    // Validate numeric fields
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0 || weight > 999.9) {
        validationErrors.push("Le poids doit être un nombre valide entre 0.1 et 999.9 kg");
      }
    }
    
    if (formData.temperature) {
      const temperature = parseFloat(formData.temperature);
      if (isNaN(temperature) || temperature < 30 || temperature > 50) {
        validationErrors.push("La température doit être un nombre valide entre 30°C et 50°C");
      }
    }
    
    // Validate text field lengths
    if (formData.symptoms && formData.symptoms.length > 1000) {
      validationErrors.push("Les symptômes ne peuvent pas dépasser 1000 caractères");
    }
    
    if (formData.diagnosis && formData.diagnosis.length > 1000) {
      validationErrors.push("Le diagnostic ne peut pas dépasser 1000 caractères");
    }
    
    if (formData.treatment && formData.treatment.length > 1000) {
      validationErrors.push("Le traitement ne peut pas dépasser 1000 caractères");
    }
    
    if (formData.notes && formData.notes.length > 2000) {
      validationErrors.push("Les notes ne peuvent pas dépasser 2000 caractères");
    }
    
    if (formData.followUp && formData.followUp.length > 500) {
      validationErrors.push("Les notes de suivi ne peuvent pas dépasser 500 caractères");
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: "⚠ Formulaire incomplet",
        description: validationErrors[0], // Show first error
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create consultation data for database
      const consultationData: CreateConsultationData & { consultation_date: string } = {
        client_id: formData.clientId,
        animal_id: formData.animalId,
        consultation_type: 'routine',
        consultation_date: formData.date || today,
        weight: formData.weight ? Math.min(parseFloat(formData.weight), 999.9) : undefined,
        temperature: formData.temperature ? Math.min(parseFloat(formData.temperature), 99.9) : undefined,
        symptoms: formData.symptoms.trim() || undefined,
        diagnosis: formData.diagnosis.trim() || undefined,
        treatment: formData.treatment.trim() || undefined,
        follow_up_notes: formData.followUp.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        photos: formData.photos && formData.photos.length > 0 ? formData.photos : undefined,
      };

      await createConsultationMutation.mutateAsync(consultationData);
      
      toast({
        title: "✓ Consultation enregistrée",
        description: `La consultation pour ${formData.animalName} a été sauvegardée avec succès.`,
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
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating consultation:', error);
      
      let errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer.";
      
      // Handle specific error types
      if (error?.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('foreign key') || errorMsg.includes('constraint')) {
          errorMessage = "Le client ou l'animal sélectionné n'existe plus. Veuillez actualiser la page.";
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet et réessayez.";
        } else if (errorMsg.includes('permission') || errorMsg.includes('unauthorized') || errorMsg.includes('authorized')) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour créer une consultation.";
        } else if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
          errorMessage = "Une consultation similaire existe déjà pour cette date et cet animal.";
        } else if (errorMsg.includes('authentication')) {
          errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        } else if (error.message.length < 100) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "⚠ Impossible d'enregistrer la consultation",
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
        temperature: prefillData?.temperature?.toString() || "",
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
            <DialogTitle>Nouvelle Consultation</DialogTitle>
            <DialogDescription>
              Enregistrez une nouvelle consultation vétérinaire.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.clientId.toString()} 
                    onValueChange={(value) => handleSelectChange("clientId", value)}
                    disabled={clientsLoading}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={clientsLoading ? "Chargement des clients..." : "Sélectionner le client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 && !clientsLoading ? (
                        <SelectItem value="__none__" disabled>Aucun client disponible</SelectItem>
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
                <Label>Animal *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.animalId} 
                    onValueChange={(value) => handleSelectChange("animalId", value)}
                    disabled={!formData.clientId || animalsLoading}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={
                        !formData.clientId 
                          ? "Sélectionnez d'abord un client"
                          : animalsLoading 
                            ? "Chargement des animaux..."
                            : availablePets.length === 0
                              ? "Aucun animal pour ce client"
                              : "Sélectionner l'animal"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePets.length === 0 && formData.clientId && !animalsLoading ? (
                        <SelectItem value="__none__" disabled>Aucun animal pour ce client</SelectItem>
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
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || today}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg)</Label>
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
                <Label htmlFor="temperature">Température (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="30"
                  max="50"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="ex: 38.5"
                  title="Température corporelle (30°C à 50°C)"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptômes observés</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="Symptômes observés, comportement anormal..."
                rows={3}
                maxLength={1000}
                title="Maximum 1000 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.symptoms.length}/1000 caractères
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnostic</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Diagnostic établi..."
                rows={3}
                maxLength={1000}
                title="Maximum 1000 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.diagnosis.length}/1000 caractères
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="treatment">Traitement administré</Label>
              <Textarea
                id="treatment"
                value={formData.treatment}
                onChange={handleChange}
                placeholder="Traitements, injections, interventions..."
                rows={3}
                maxLength={1000}
                title="Maximum 1000 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.treatment.length}/1000 caractères
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="followUp">Suivi recommandé</Label>
              <Input
                id="followUp"
                value={formData.followUp}
                onChange={handleChange}
                placeholder="ex: Contrôle dans 1 semaine"
                maxLength={500}
                title="Maximum 500 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.followUp.length}/500 caractères
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes additionnelles</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes diverses, recommandations..."
                rows={3}
                maxLength={2000}
                title="Maximum 2000 caractères"
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.notes.length}/2000 caractères
              </div>
            </div>
            {/* Photos upload */}
            <div className="space-y-2 col-span-2">
              <Label>Photos de la consultation</Label>
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
                    toast({ title: "✓ Photos ajoutées", description: `${results.length} photo(s) prête(s) à enregistrer.` });
                  } catch (err: any) {
                    console.error("[consultation] photo upload error", err);
                    toast({ title: "Erreur photos", description: err?.message || "Impossible de traiter les images", variant: "destructive" });
                  } finally {
                    setUploadingPhotos(false);
                    e.target.value = "";
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
              />
              {uploadingPhotos && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Compression des photos…
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
                disabled={createConsultationMutation.isPending}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={
                  !formData.clientId || 
                  !formData.animalId || 
                  createConsultationMutation.isPending ||
                  clientsLoading ||
                  animalsLoading
                }
              >
                {createConsultationMutation.isPending ? "Enregistrement..." : "Enregistrer Consultation"}
              </Button>
            </div>
          </form>
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