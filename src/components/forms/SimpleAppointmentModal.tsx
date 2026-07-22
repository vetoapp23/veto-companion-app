import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, Heart, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreateAppointment, type Client, type Animal } from "@/hooks/useDatabase";
import { useAppointmentTypes } from "@/hooks/useAppSettings";
import { NewClientModal } from "./NewClientModal";
import { localDateTimeToISO, todayLocalKey } from "@/lib/dateLocal";

interface SimpleAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefill when opening from calendar date/slot click */
  prefillDate?: string;
  prefillTime?: string;
}

export function SimpleAppointmentModal({
  open,
  onOpenChange,
  prefillDate,
  prefillTime,
}: SimpleAppointmentModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();
  const { data: appointmentTypes = [] } = useAppointmentTypes();

  const [showClientModal, setShowClientModal] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    animalId: "",
    date: "",
    time: "",
    appointmentType: "consultation",
    notes: "",
  });

  const availableAnimals = formData.clientId
    ? animals.filter((animal) => animal.client_id === formData.clientId)
    : [];

  useEffect(() => {
    if (open) {
      setFormData({
        clientId: "",
        animalId: "",
        date: prefillDate || "",
        time: prefillTime || "",
        appointmentType: "consultation",
        notes: "",
      });
      setShowClientModal(false);
    } else {
      setFormData({
        clientId: "",
        animalId: "",
        date: "",
        time: "",
        appointmentType: "consultation",
        notes: "",
      });
      setShowClientModal(false);
    }
  }, [open, prefillDate, prefillTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.date || !formData.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le client, la date et l'heure",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAppointment.mutateAsync({
        client_id: formData.clientId,
        animal_id: formData.animalId || undefined,
        appointment_date: localDateTimeToISO(formData.date, formData.time),
        appointment_type: formData.appointmentType as
          | "consultation"
          | "vaccination"
          | "surgery"
          | "follow-up",
        notes: formData.notes || undefined,
        duration_minutes: 30,
      });

      toast({
        title: "Succès",
        description: "Rendez-vous créé avec succès",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const handleClientChange = (clientId: string) => {
    setFormData((prev) => ({ ...prev, clientId, animalId: "" }));
  };

  const handleClientCreated = (client: Client) => {
    setFormData((prev) => ({ ...prev, clientId: client.id, animalId: "" }));
  };

  const getClientName = (client: Client) => `${client.first_name} ${client.last_name}`;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Nouveau Rendez-vous
            </DialogTitle>
            <DialogDescription>
              Créer un nouveau rendez-vous pour un client (animal optionnel)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <div className="flex gap-2">
                <Select value={formData.clientId} onValueChange={handleClientChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        Aucun client — créez-en un avec +
                      </SelectItem>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {getClientName(client)}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setShowClientModal(true)}
                  title="Nouveau client"
                  aria-label="Ajouter un nouveau client"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animal">Animal (optionnel)</Label>
              <Select
                value={formData.animalId || "__none__"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    animalId: value === "__none__" ? "" : value,
                  }))
                }
                disabled={!formData.clientId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      formData.clientId
                        ? "Sélectionner un animal (optionnel)"
                        : "Sélectionner d'abord un client"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucun animal</SelectItem>
                  {availableAnimals.map((animal: Animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        {animal.name} ({animal.species})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  min={todayLocalKey()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de rendez-vous</Label>
              <Select
                value={formData.appointmentType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, appointmentType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, "-")}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Notes additionnelles sur le rendez-vous..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createAppointment.isPending}>
                {createAppointment.isPending ? "Création..." : "Créer le rendez-vous"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <NewClientModal
        open={showClientModal}
        onOpenChange={setShowClientModal}
        onCreated={handleClientCreated}
      />
    </>
  );
}
