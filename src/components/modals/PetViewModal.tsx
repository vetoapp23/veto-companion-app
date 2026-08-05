import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, User, Calendar, Edit, FileText, Camera, Trash2 } from "lucide-react";
import { calculateAge, formatDate } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useUpdateAnimal } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";

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
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { bcp47 } = useAppLocale();
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
      toast({ title: tc("error"), description: t("pets.animalIdNotFound"), variant: "destructive" });
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
        toast({ title: t("pets.photoSaved") });
      } catch (err) {
        toast({
          title: tc("error"),
          description: err instanceof Error ? err.message : t("pets.photoSaveError"),
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!pet) return null;

  const statusLabel =
    pet.status === "healthy"
      ? t("pets.statusHealthy")
      : pet.status === "treatment"
        ? t("pets.statusTreatment")
        : t("pets.statusUrgent");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("pets.profileTitle")}</DialogTitle>
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
                  {photoPreview ? t("pets.changePhoto") : t("pets.addPhoto")}
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
                    {t("pets.removePhoto")}
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
                  {statusLabel}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">{t("pets.typeLabel")}</span>
                  <p className="text-muted-foreground">{pet.type}</p>
                </div>
                <div>
                  <span className="font-medium">{t("pets.breedLabel")}</span>
                  <p className="text-muted-foreground">{pet.breed || t("pets.breedNotSpecified")}</p>
                </div>
                <div>
                  <span className="font-medium">{t("pets.ageLabel")}</span>
                  <p className="text-muted-foreground">
                  {pet.birthDate ? (
                    <>
                      {calculateAge(pet.birthDate)}
                      <br />
                      <span className="text-xs">{t("pets.bornOn", { date: formatDate(pet.birthDate) })}</span>
                    </>
                  ) : t("pets.notSpecified")}
                </p>
                </div>
                <div>
                  <span className="font-medium">{t("pets.weightLabel")}</span>
                  <p className="text-muted-foreground">{pet.weight || t("pets.notSpecified")}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="font-medium">{t("pets.colorLabel")}</span>
                <p className="text-muted-foreground">{pet.color || t("pets.breedNotSpecified")}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">{t("pets.ownerLabelShort")}</span>
                  <p className="text-muted-foreground">{pet.owner}</p>
                </div>
              </div>
              
              {pet.microchip && (
                <div>
                  <span className="font-medium">{t("pets.microchipLabel")}</span>
                  <p className="text-muted-foreground font-mono">{pet.microchip}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {pet.lastVisit && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">{t("pets.lastVisitLabel")}</span>
                    <p className="text-muted-foreground">{new Date(pet.lastVisit).toLocaleDateString(bcp47)}</p>
                  </div>
                </div>
              )}
              
              {pet.nextAppointment && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">{t("pets.nextAppointmentLabel")}</span>
                    <p className="text-muted-foreground">{new Date(pet.nextAppointment).toLocaleDateString(bcp47)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {pet.vaccinations && pet.vaccinations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">{t("pets.vaccinationsHeading")}</h3>
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
              <h3 className="font-semibold">{t("pets.medicalNotes")}</h3>
              <p className="text-muted-foreground p-3 bg-muted/30 rounded-lg">{pet.medicalNotes}</p>
            </div>
          )}
          
          <div className="flex justify-between gap-2 pt-4 border-t">

            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {tc("close")}
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
                  {tc("delete")}
                </Button>
              )}
              <Button onClick={onEdit} className="gap-2">
                <Edit className="h-4 w-4" />
                {tc("edit")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}