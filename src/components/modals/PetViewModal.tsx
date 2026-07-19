import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, User, Calendar, Edit, FileText, Camera, Trash2 } from "lucide-react";
import { calculateAge, formatDate } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useUpdateAnimal } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";

interface PetViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet: any | null;
  onEdit: () => void;
  onShowDossier: () => void;
  onDelete?: () => void;
}

export function PetViewModal({ open, onOpenChange, pet, onEdit, onShowDossier, onDelete }: PetViewModalProps) {
  const updateAnimalMutation = useUpdateAnimal();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  // Initialize preview with existing photo on open
  useEffect(() => {
    if (open) {
      setPhotoPreview(pet?.photo || null);
    }
  }, [open, pet]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pet) return;
    const animalId = pet.dbId || (typeof pet.id === "string" ? pet.id : null);
    if (!animalId) {
      toast({ title: "Erreur", description: "Identifiant animal introuvable", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoPreview(dataUrl);
      try {
        await updateAnimalMutation.mutateAsync({
          id: animalId,
          data: { photo_url: dataUrl },
        });
        toast({ title: "Photo enregistrée" });
      } catch (err) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Impossible d'enregistrer la photo",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!pet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profil Animal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="space-y-4">
              <Avatar className="h-24 w-24">
                {photoPreview ? (
                  <AvatarImage src={photoPreview} alt={pet.name} className="h-full w-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-primary-glow text-primary-foreground">
                    <Heart className="h-12 w-12" />
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 w-full flex items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  {photoPreview ? 'Changer photo' : 'Ajouter photo'}
                </Button>
                {photoPreview && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2 w-full"
                    onClick={() => {
                      setPhotoPreview(null);
                      updatePet(pet.id, { photo: undefined });
                    }}
                  >
                    Supprimer photo
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">{pet.name}</h2>
                <Badge 
                  variant="outline"
                  className={
                    pet.status === 'healthy' ? 'bg-secondary text-secondary-foreground' :
                    pet.status === 'treatment' ? 'bg-accent text-accent-foreground' : 
                    'bg-destructive text-destructive-foreground'
                  }
                >
                  {pet.status === 'healthy' ? 'En bonne santé' : 
                   pet.status === 'treatment' ? 'En traitement' : 'Urgent'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Type:</span>
                  <p className="text-muted-foreground">{pet.type}</p>
                </div>
                <div>
                  <span className="font-medium">Race:</span>
                  <p className="text-muted-foreground">{pet.breed || 'Non spécifiée'}</p>
                </div>
                <div>
                  <span className="font-medium">Âge:</span>
                  <p className="text-muted-foreground">
                  {pet.birthDate ? (
                    <>
                      {calculateAge(pet.birthDate)}
                      <br />
                      <span className="text-xs">Né(e) le {formatDate(pet.birthDate)}</span>
                    </>
                  ) : 'Non spécifié'}
                </p>
                </div>
                <div>
                  <span className="font-medium">Poids:</span>
                  <p className="text-muted-foreground">{pet.weight || 'Non spécifié'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="font-medium">Couleur:</span>
                <p className="text-muted-foreground">{pet.color || 'Non spécifiée'}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Propriétaire:</span>
                  <p className="text-muted-foreground">{pet.owner}</p>
                </div>
              </div>
              
              {pet.microchip && (
                <div>
                  <span className="font-medium">Puce électronique:</span>
                  <p className="text-muted-foreground font-mono">{pet.microchip}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {pet.lastVisit && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Dernière visite:</span>
                    <p className="text-muted-foreground">{new Date(pet.lastVisit).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              )}
              
              {pet.nextAppointment && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Prochain RDV:</span>
                    <p className="text-muted-foreground">{new Date(pet.nextAppointment).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {pet.vaccinations && pet.vaccinations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Vaccinations</h3>
              <div className="flex gap-2 flex-wrap">
                {pet.vaccinations.map((vacc, index) => (
                  <Badge key={index} variant="outline">
                    {vacc}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {pet.medicalNotes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Notes médicales</h3>
              <p className="text-muted-foreground p-3 bg-muted/30 rounded-lg">{pet.medicalNotes}</p>
            </div>
          )}
          
          <div className="flex justify-between gap-2 pt-4 border-t">

            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
              {onDelete && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onOpenChange(false);
                    onDelete();
                  }}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
              <Button onClick={onEdit} className="gap-2">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}