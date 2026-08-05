import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ComboboxFreeText } from "@/components/ui/combobox-freetext";
import { useAnimalSpecies, useAnimalBreeds, useAnimalColors } from "@/hooks/useAppSettings";
import { useClients, useCreateAnimal, useAnimals } from "@/hooks/useDatabase";
import { useQuotaCheck } from "@/hooks/useQuotaCheck";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Animal, CreateAnimalData } from "@/lib/database";
import { useTranslation } from "react-i18next";

interface NewPetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefill owner when opened from a client/visit context */
  defaultClientId?: string;
  onCreated?: (animal: Animal) => void;
}

export function NewPetModal({ open, onOpenChange, defaultClientId, onCreated }: NewPetModalProps) {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const createAnimalMutation = useCreateAnimal();
  const { toast } = useToast();
  
  // Dynamic settings hooks
  const { data: animalSpecies = [] } = useAnimalSpecies();
  const { data: allAnimalBreeds = {} } = useAnimalBreeds(); // Get all breeds as object
  const { data: animalColors = [] } = useAnimalColors();
  
  // Form errors state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    gender: "",
    birthDate: "",
    weight: "",
    color: "",
    ownerId: defaultClientId || "",
    microchip: "",
    medicalNotes: "",
    photo: "", // added official photo
    status: "vivant", // added status field
    // Propriétés du pedigree
    hasPedigree: false,
    officialName: "",
    pedigreeNumber: "",
    breeder: "",
    fatherName: "",
    fatherPedigree: "",
    fatherBreed: "",
    fatherTitles: "",
    motherName: "",
    motherPedigree: "",
    motherBreed: "",
    motherTitles: "",
    pedigreePhoto: ""
  });

  // Keep owner in sync when opening with a client context
  useEffect(() => {
    if (open && defaultClientId) {
      setFormData((prev) => ({ ...prev, ownerId: defaultClientId }));
    }
  }, [open, defaultClientId]);

  // Filter breeds based on selected type
  const availableBreeds = formData.type && allAnimalBreeds[formData.type] 
    ? allAnimalBreeds[formData.type] 
    : [];

  // Form validation function
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.name.trim()) {
      errors.name = t("pets.nameRequired");
    } else if (formData.name.trim().length < 2) {
      errors.name = t("pets.nameMinLength");
    } else if (formData.name.trim().length > 50) {
      errors.name = t("pets.nameMaxLength");
    }
    
    if (!formData.type) {
      errors.type = t("pets.typeRequired");
    }
    
    if (!formData.ownerId) {
      errors.ownerId = t("pets.ownerRequired");
    }
    
    // Optional fields validation
    if (formData.weight && (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0)) {
      errors.weight = t("pets.weightPositive");
    }
    
    if (formData.weight && Number(formData.weight) > 1000) {
      errors.weight = t("pets.weightTooHigh");
    }
    
    // Microchip validation - flexible format
    if (formData.microchip && formData.microchip.trim()) {
      const microchipValue = formData.microchip.trim();
      
      // Check length - allow 10-15 characters (more flexible)
      if (microchipValue.length < 10) {
        errors.microchip = t("pets.microchipMinLength");
      } else if (microchipValue.length > 15) {
        errors.microchip = t("pets.microchipMaxLength");
      }
      
      // Check for valid characters (alphanumeric only)
      if (!/^[0-9A-Fa-f]+$/.test(microchipValue)) {
        errors.microchip = t("pets.microchipHex");
      }
      
      // Check for existing microchip
      const existingAnimal = animals.find(animal => 
        animal.microchip_number === microchipValue
      );
      if (existingAnimal) {
        errors.microchip = t("pets.microchipInUse", { name: existingAnimal.name });
      }
    }
    
    // Birth date validation
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      
      if (birthDate > today) {
        errors.birthDate = t("pets.birthDateFuture");
      }
      
      // Check if animal is not too old (reasonable limit: 30 years)
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 30);
      if (birthDate < maxAge) {
        errors.birthDate = t("pets.birthDateTooOld");
      }
    }
    
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    // Auto-format microchip input
    let processedValue = value;
    if (id === 'microchip') {
      // Remove any non-alphanumeric characters and convert to uppercase
      processedValue = value
        .replace(/[^0-9A-Fa-f]/g, '')
        .toUpperCase()
        .slice(0, 15); // Limit to 15 characters
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: processedValue
    }));
    
    // Clear error when user starts typing
    if (formErrors[id]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user makes selection
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const { enforce } = useQuotaCheck();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!await enforce("animals")) return;
    
    
    // Validate form
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast({
        title: t("pets.formIncomplete"),
        description: firstError || t("pets.formIncompleteBody"),
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create animal data compatible with database
      const animalData: CreateAnimalData = {
        client_id: formData.ownerId,
        name: formData.name.trim(),
        species: formData.type,
        breed: formData.breed?.trim() || undefined,
        color: formData.color?.trim() || undefined,
        sex: formData.gender === 'male' ? 'Mâle' : (formData.gender === 'female' ? 'Femelle' : 'Inconnu'),
        weight: formData.weight ? Number(formData.weight) : undefined,
        birth_date: formData.birthDate || undefined,
        // Only include microchip_number if it's not empty to avoid unique constraint violation
        ...(formData.microchip && formData.microchip.trim() ? { microchip_number: formData.microchip.trim() } : {}),
        notes: formData.medicalNotes?.trim() || undefined,
        photo_url: formData.photo?.trim() || undefined,
        status: formData.status === 'healthy' ? 'vivant' : (formData.status === 'urgent' ? 'décédé' : 'perdu')
      };

      const created = await createAnimalMutation.mutateAsync(animalData);
    
      toast({
        title: t("pets.addedSuccess"),
        description: t("pets.addedSuccessBody", { name: formData.name }),
      });
      
      // Reset form with all required properties
      setFormData({
        name: "",
        type: "",
        breed: "",
        gender: "",
        birthDate: "",
        weight: "",
        color: "",
        ownerId: defaultClientId || "",
        microchip: "",
        medicalNotes: "",
        photo: "",
        status: "vivant", // reset status to default
        hasPedigree: false,
        officialName: "",
        pedigreeNumber: "",
        breeder: "",
        fatherName: "",
        fatherPedigree: "",
        fatherBreed: "",
        fatherTitles: "",
        motherName: "",
        motherPedigree: "",
        motherBreed: "",
        motherTitles: "",
        pedigreePhoto: ""
      });
      
      // Clear any form errors
      setFormErrors({});
      
      onCreated?.(created);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating animal:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = tc("unexpectedError");
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('microchip') || errorMsg.includes('unique')) {
          errorMessage = t("pets.microchipDuplicate");
          setFormErrors({ microchip: errorMessage });
        } else if (errorMsg.includes('client') || errorMsg.includes('foreign key')) {
          errorMessage = t("pets.ownerNotFound");
          setFormErrors({ ownerId: errorMessage });
        } else if (errorMsg.includes('name') || errorMsg.includes('not null')) {
          errorMessage = t("pets.nameAndOwnerRequired");
        } else if (errorMsg.includes('authentication') || errorMsg.includes('not authenticated')) {
          errorMessage = t("pets.sessionExpired");
        } else if (errorMsg.includes('network') || errorMsg.includes('connection') || errorMsg.includes('fetch')) {
          errorMessage = tc("connectionProblem");
        } else if (errorMsg.includes('permission') || errorMsg.includes('access') || errorMsg.includes('authorized')) {
          errorMessage = t("pets.noPermissionAdd");
        } else {
          // Extract meaningful part of the error message
          if (error.message.includes('Error creating animal:')) {
            errorMessage = error.message.replace('Error creating animal:', '').trim();
          } else if (error.message.length < 100) {
            errorMessage = error.message;
          }
        }
      }
      
      toast({
        title: t("pets.cannotAdd"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) {
          // Reset form and errors when closing
          setFormErrors({});
          setIsSubmitting(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("pets.new")}</DialogTitle>
          <DialogDescription>
            {t("pets.newDesc")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Summary */}
          {Object.keys(formErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t("pets.formErrorsTitle")}
                <ul className="mt-2 ml-4 list-disc">
                  {Object.values(formErrors).map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={formErrors.name ? "text-destructive" : ""}>
                {t("pets.nameLabel")}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={formErrors.name ? "border-destructive focus:border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className={formErrors.type ? "text-destructive" : ""}>
                {t("pets.speciesLabel")}
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger className={formErrors.type ? "border-destructive focus:border-destructive" : ""}>
                  <SelectValue placeholder={t("pets.selectSpecies")} />
                </SelectTrigger>
                <SelectContent>
                  {animalSpecies.map(species => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.type && (
                <p className="text-sm text-destructive">{formErrors.type}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">{tc("breed")}</Label>
              <ComboboxFreeText
                value={formData.breed}
                onChange={(v) => handleSelectChange("breed", v)}
                options={availableBreeds}
                category={formData.type ? `breed_${formData.type.toLowerCase()}` : "breed_other"}
                placeholder={formData.type ? t("pets.selectOrType") : t("pets.selectTypeFirst")}
                disabled={!formData.type}
              />
            </div>
            <div className="space-y-2">
              <Label>{tc("sex")}</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("pets.selectSex")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{tc("male")}</SelectItem>
                  <SelectItem value="female">{tc("female")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate" className={formErrors.birthDate ? "text-destructive" : ""}>
                {t("pets.birthDate")}
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={formErrors.birthDate ? "border-destructive focus:border-destructive" : ""}
              />
              {formErrors.birthDate && (
                <p className="text-sm text-destructive">{formErrors.birthDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className={formErrors.weight ? "text-destructive" : ""}>
                {tc("weight")} ({tc("kg")})
              </Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={handleChange}
                type="number"
                step="0.1"
                min="0"
                max="1000"
                placeholder="Ex: 5.2"
                className={formErrors.weight ? "border-destructive focus:border-destructive" : ""}
              />
              {formErrors.weight && (
                <p className="text-sm text-destructive">{formErrors.weight}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">{t("pets.color")}</Label>
              <ComboboxFreeText
                value={formData.color}
                onChange={(v) => handleSelectChange("color", v)}
                options={animalColors}
                category="color"
                placeholder={t("pets.colorPlaceholder")}
              />

            </div>
            <div className="space-y-2">
              {/* Champ vide pour maintenir la grille */}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className={formErrors.ownerId ? "text-destructive" : ""}>
              {tc("owner")} *
            </Label>
            {clients.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  {t("pets.noClientsAvailable")}
                </p>
              </div>
            ) : (
              <Select value={formData.ownerId.toString()} onValueChange={(value) => handleSelectChange("ownerId", value)}>
                <SelectTrigger className={formErrors.ownerId ? "border-destructive focus:border-destructive" : ""}>
                  <SelectValue placeholder={t("pets.selectOwner")} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.first_name} {client.last_name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {formErrors.ownerId && (
              <p className="text-sm text-destructive">{formErrors.ownerId}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="microchip" className={formErrors.microchip ? "text-destructive" : ""}>
              {t("pets.microchip")} ({tc("optional")})
            </Label>
            <div className="relative">
              <Input
                id="microchip"
                value={formData.microchip}
                onChange={handleChange}
                className={formErrors.microchip ? "border-destructive focus:border-destructive" : ""}
                placeholder={t("pets.microchipPlaceholder")}
              />
              {formData.microchip && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {formData.microchip.length >= 10 && formData.microchip.length <= 15 ? (
                    <span className="text-green-600 text-xs font-medium">
                      ✓ {formData.microchip.length}/15
                    </span>
                  ) : (
                    <span className="text-orange-600 text-xs font-medium">
                      {formData.microchip.length}/15
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.microchip 
                ? `${formData.microchip.length < 10 
                    ? `Encore ${10 - formData.microchip.length} caractères minimum` 
                    : formData.microchip.length > 15 
                      ? 'Trop de caractères' 
                      : 'Format valide ✓'}`
                : 'Format: 10 à 15 caractères alphanumériques (chiffres et lettres A-F)'}
            </p>
            {formErrors.microchip && (
              <p className="text-sm text-destructive">{formErrors.microchip}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medicalNotes">{t("pets.medicalNotes")}</Label>
            <Textarea
              id="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleChange}
              placeholder={t("pets.medicalNotesPlaceholder")}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t("pets.healthStatus")}</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("pets.selectHealthStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">En bonne santé</SelectItem>
                <SelectItem value="treatment">En traitement</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

     
          {/* Official Photo */}
          <div className="space-y-2">
            <Label>{t("pets.photo")}</Label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setFormData(prev => ({ ...prev, photo: reader.result as string }));
                reader.readAsDataURL(file);
              }}
            />
            {formData.photo && (
              <img src={formData.photo} alt="preview" className="h-24 w-24 object-cover rounded" />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {tc("cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || Object.keys(formErrors).length > 0}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isSubmitting ? t("pets.adding") : t("pets.addPet")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}