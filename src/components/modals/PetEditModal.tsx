// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Pet, useClients } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "react-i18next";

interface PetEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet: Pet | null;
}

export function PetEditModal({ open, onOpenChange, pet }: PetEditModalProps) {
  const { updatePet, clients } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    gender: "",
    birthDate: "",
    weight: "",
    color: "",
    ownerId: 0,
    microchip: "",
    medicalNotes: "",
    status: "vivant" as "vivant" | "décédé" | "perdu",
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

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name,
        type: pet.type,
        breed: pet.breed || "",
        gender: pet.gender || "",
        birthDate: pet.birthDate || "",
        weight: pet.weight || "",
        color: pet.color || "",
        ownerId: pet.ownerId,
        microchip: pet.microchip || "",
        medicalNotes: pet.medicalNotes || "",
        status: pet.status,
        // Propriétés du pedigree
        hasPedigree: pet.hasPedigree || false,
        officialName: pet.officialName || "",
        pedigreeNumber: pet.pedigreeNumber || "",
        breeder: pet.breeder || "",
        fatherName: pet.fatherName || "",
        fatherPedigree: pet.fatherPedigree || "",
        fatherBreed: pet.fatherBreed || "",
        fatherTitles: pet.fatherTitles || "",
        motherName: pet.motherName || "",
        motherPedigree: pet.motherPedigree || "",
        motherBreed: pet.motherBreed || "",
        motherTitles: pet.motherTitles || "",
        pedigreePhoto: pet.pedigreePhoto || ""
      });
    }
  }, [pet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'ownerId' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pet) return;

    const owner = clients.find(c => c.id === formData.ownerId);

    updatePet(pet.id, {
      ...formData,
      owner: owner?.name || pet.owner
    });

    toast({
      title: t("pets.updateSuccess"),
      description: t("pets.updatedBody", { name: formData.name }),
    });

    onOpenChange(false);
  };

  if (!pet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("pets.editTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("pets.animalNameLabel")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("pets.speciesTypeLabel")}</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>

                    <><SelectItem value="Chien">Chien</SelectItem>
                    <SelectItem value="Chat">Chat</SelectItem>
                    <SelectItem value="Oiseau">Oiseau</SelectItem>
                    <SelectItem value="Lapin">Lapin</SelectItem>
                    <SelectItem value="Furet">Furet</SelectItem>
                    <SelectItem value="Souris">Souris</SelectItem>
                    <SelectItem value="Hamster">Hamster</SelectItem>
                    <SelectItem value="Reptile">Reptile</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem></>

                  
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">{t("pets.columns.breed")}</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>{tc("sex")}</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("pets.selectSex")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("pets.sexMale")}</SelectItem>
                  <SelectItem value="female">{t("pets.sexFemale")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">{t("pets.birthDate")}</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">{tc("weight")} ({tc("kg")})</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">{t("pets.color")}</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              {/* Champ vide pour maintenir la grille */}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("pets.ownerRequiredLabel")}</Label>
              <Select value={formData.ownerId.toString()} onValueChange={(value) => handleSelectChange("ownerId", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("pets.healthStatusLabel")}</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">{t("pets.statusHealthy")}</SelectItem>
                  <SelectItem value="treatment">{t("pets.statusTreatment")}</SelectItem>
                  <SelectItem value="urgent">{t("pets.statusUrgent")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="microchip">{t("pets.microchipNumberLabel")}</Label>
            <Input
              id="microchip"
              value={formData.microchip}
              onChange={handleChange}
            />
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

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="hasPedigree"
                checked={formData.hasPedigree}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, hasPedigree: checked as boolean }))
                }
              />
              <Label htmlFor="hasPedigree" className="text-lg font-medium">{t("pets.hasPedigree")}</Label>
            </div>

            {formData.hasPedigree && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officialName">{t("pets.officialName")}</Label>
                    <Input
                      id="officialName"
                      value={formData.officialName}
                      onChange={handleChange}
                      placeholder={t("pets.officialNamePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pedigreeNumber">{t("pets.pedigreeNumber")}</Label>
                    <Input
                      id="pedigreeNumber"
                      value={formData.pedigreeNumber}
                      onChange={handleChange}
                      placeholder={t("pets.pedigreeNumberPlaceholder")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breeder">{t("pets.breeder")}</Label>
                  <Input
                    id="breeder"
                    value={formData.breeder}
                    onChange={handleChange}
                    placeholder={t("pets.breederPlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">{t("pets.sire")}</h4>
                    <div className="space-y-2">
                      <Input placeholder={t("pets.sireNamePlaceholder")} value={formData.fatherName} onChange={handleChange} id="fatherName" />
                      <Input placeholder={t("pets.sirePedigreePlaceholder")} value={formData.fatherPedigree} onChange={handleChange} id="fatherPedigree" />
                      <Input placeholder={t("pets.sireBreedPlaceholder")} value={formData.fatherBreed} onChange={handleChange} id="fatherBreed" />
                      <Textarea placeholder={t("pets.sireTitlesPlaceholder")} value={formData.fatherTitles} onChange={handleChange} id="fatherTitles" rows={2} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">{t("pets.dam")}</h4>
                    <div className="space-y-2">
                      <Input placeholder={t("pets.damNamePlaceholder")} value={formData.motherName} onChange={handleChange} id="motherName" />
                      <Input placeholder={t("pets.damPedigreePlaceholder")} value={formData.motherPedigree} onChange={handleChange} id="motherPedigree" />
                      <Input placeholder={t("pets.damBreedPlaceholder")} value={formData.motherBreed} onChange={handleChange} id="motherBreed" />
                      <Textarea placeholder={t("pets.damTitlesPlaceholder")} value={formData.motherTitles} onChange={handleChange} id="motherTitles" rows={2} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("pets.pedigreeDocument")}</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setFormData(prev => ({ ...prev, pedigreePhoto: reader.result as string }));
                      reader.readAsDataURL(file);
                    }}
                  />
                  {formData.pedigreePhoto && (
                    <img src={formData.pedigreePhoto} alt={t("pets.pedigreeDocumentAlt")} className="h-32 w-auto object-contain rounded border" />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit">
              {tc("save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}