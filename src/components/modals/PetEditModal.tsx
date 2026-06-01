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

interface PetEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet: Pet | null;
}

export function PetEditModal({ open, onOpenChange, pet }: PetEditModalProps) {
  const { updatePet, clients } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
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
      title: "Animal modifié",
      description: `Les informations de ${formData.name} ont été mises à jour.`,
    });

    onOpenChange(false);
  };

  if (!pet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier Animal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'animal *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type d'animal *</Label>
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
              <Label htmlFor="breed">Race</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Sexe</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Mâle</SelectItem>
                  <SelectItem value="female">Femelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Couleur</Label>
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
              <Label>Propriétaire *</Label>
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
              <Label>Statut de santé</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">En bonne santé</SelectItem>
                  <SelectItem value="treatment">En traitement</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="microchip">Numéro de puce électronique</Label>
            <Input
              id="microchip"
              value={formData.microchip}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalNotes">Notes médicales</Label>
            <Textarea
              id="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleChange}
              placeholder="Allergies, conditions médicales, notes importantes..."
            />
          </div>

          {/* Section Pedigree */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="hasPedigree"
                checked={formData.hasPedigree}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, hasPedigree: checked as boolean }))
                }
              />
              <Label htmlFor="hasPedigree" className="text-lg font-medium">Cet animal a un pedigree officiel</Label>
            </div>

            {formData.hasPedigree && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officialName">Nom officiel</Label>
                    <Input
                      id="officialName"
                      value={formData.officialName}
                      onChange={handleChange}
                      placeholder="Nom officiel du pedigree"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pedigreeNumber">N° pedigree/LOF</Label>
                    <Input
                      id="pedigreeNumber"
                      value={formData.pedigreeNumber}
                      onChange={handleChange}
                      placeholder="Numéro de pedigree"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breeder">Éleveur</Label>
                  <Input
                    id="breeder"
                    value={formData.breeder}
                    onChange={handleChange}
                    placeholder="Nom de l'éleveur"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Père */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Père</h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nom du père"
                        value={formData.fatherName}
                        onChange={handleChange}
                      />
                      <Input
                        placeholder="N° pedigree du père"
                        value={formData.fatherPedigree}
                        onChange={handleChange}
                      />
                      <Input
                        placeholder="Race du père"
                        value={formData.fatherBreed}
                        onChange={handleChange}
                      />
                      <Textarea
                        placeholder="Titres du père"
                        value={formData.fatherTitles}
                        onChange={handleChange}
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Mère */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Mère</h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nom de la mère"
                        value={formData.motherName}
                        onChange={handleChange}
                      />
                      <Input
                        placeholder="N° pedigree de la mère"
                        value={formData.motherPedigree}
                        onChange={handleChange}
                      />
                      <Input
                        placeholder="Race de la mère"
                        value={formData.motherBreed}
                        onChange={handleChange}
                      />
                      <Textarea
                        placeholder="Titres de la mère"
                        value={formData.motherTitles}
                        onChange={handleChange}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Photo du document pedigree */}
                <div className="space-y-2">
                  <Label>Document pedigree</Label>
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
                    <img src={formData.pedigreePhoto} alt="Document pedigree" className="h-32 w-auto object-contain rounded border" />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}