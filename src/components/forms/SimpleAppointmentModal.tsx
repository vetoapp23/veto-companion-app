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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
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
        title: tc("error"),
        description: t("appointments.fillClientDateTime"),
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
        title: tc("success"),
        description: t("appointments.createdSimple"),
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: tc("error"),
        description: t("appointments.cannotCreate"),
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
              {t("appointments.new")}
            </DialogTitle>
            <DialogDescription>
              {t("appointments.newDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">{tc("client")} *</Label>
              <div className="flex gap-2">
                <Select value={formData.clientId} onValueChange={handleClientChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t("visits.selectClient")} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        {t("appointments.noClientsCreate")}
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
                  title={t("visits.newClient")}
                  aria-label={t("visits.newClient")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animal">{t("appointments.animalOptional")}</Label>
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
                        ? t("appointments.selectAnimalOptional")
                        : t("appointments.selectClientFirst")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t("appointments.noAnimal")}</SelectItem>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">{tc("date")} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  min={todayLocalKey()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">{tc("time")} *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t("appointments.appointmentType")}</Label>
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
              <Label htmlFor="notes">{t("appointments.notesOptional")}</Label>
              <Textarea
                id="notes"
                placeholder={t("appointments.notesPlaceholder")}
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={createAppointment.isPending}>
                {createAppointment.isPending
                  ? t("appointments.creating")
                  : t("appointments.createAppointment")}
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
