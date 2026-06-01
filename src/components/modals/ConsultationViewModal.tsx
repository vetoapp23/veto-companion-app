// @ts-nocheck
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Heart, User, Stethoscope, Printer, Edit } from "lucide-react";
import { useClients, Consultation } from "@/contexts/ClientContext";
import { formatDate } from "@/lib/utils";
import { ConsultationPrint } from "@/components/ConsultationPrint";
import { PrescriptionsList } from "@/components/PrescriptionsList";

interface ConsultationViewModalProps {
  consultation: Consultation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

const ConsultationViewModal = ({ consultation, open, onOpenChange, onEdit }: ConsultationViewModalProps) => {
  if (!consultation) return null;
  const { getClientById, getPetById } = useClients();
  const client = getClientById(consultation.clientId);
  const pet = getPetById(consultation.petId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Consultation #{consultation.id} - {formatDate(consultation.date)}
          </DialogTitle>
          <DialogDescription>
            Détails de la consultation générale
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-semibold">{consultation.purpose || 'Consultation générale'}</h3>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {pet?.name} ({pet?.type})
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {client?.name}
            </div>
            <div className="flex items-center gap-1">
              <Stethoscope className="h-4 w-4" />
              {consultation.veterinarian}
            </div>
          </div>
          {consultation.symptoms && (
            <Card>
              <CardContent>
                <p><strong>Symptômes:</strong> {consultation.symptoms}</p>
              </CardContent>
            </Card>
          )}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="overview">Détails</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Motif:</strong> {consultation.purpose || 'Non spécifié'}</p>
                  <p><strong>Notes:</strong> {consultation.notes || 'Aucune'}</p>
                  {consultation.photos && consultation.photos.length > 0 && (
                    <div className="pt-4">
                      <h5 className="font-medium mb-2">Photos de la consultation</h5>
                      <div className="flex gap-2 overflow-x-auto">
                        {consultation.photos.map((src, idx) => (
                          <div key={idx} className="relative">
                            <img src={src} alt={`consult-photo-${idx}`} className="h-32 w-32 object-cover rounded cursor-pointer hover:opacity-80" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="prescriptions">
              <PrescriptionsList petId={consultation.petId} consultationId={consultation.id} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4" /> Modifier
          </Button>
          <ConsultationPrint consultation={consultation} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationViewModal;
