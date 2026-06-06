// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pill, Clock, AlertCircle, CheckCircle, XCircle, Plus, Edit, Trash2, Printer } from "lucide-react";
import { useState } from "react";
import { usePrescriptions, usePrescriptionsByAnimal } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import { NewPrescriptionModal } from "@/components/forms/NewPrescriptionModal";
import { PrescriptionEditModal } from "@/components/modals/PrescriptionEditModal";
import { PrescriptionPrint } from "@/components/PrescriptionPrint";

interface PrescriptionsListProps {
  petId: string;
  consultationId?: string;
}

const statusStyles = {
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  discontinued: "bg-red-100 text-red-800"
};

const statusLabels = {
  active: "Active",
  completed: "Terminée",
  discontinued: "Arrêtée"
};

export function PrescriptionsList({ petId, consultationId }: PrescriptionsListProps) {
  const { data: allPrescriptions = [] } = usePrescriptions();
  const { data: prescriptionsByAnimal = [] } = usePrescriptionsByAnimal(petId);
  const { toast } = useToast();
  
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [showEditPrescription, setShowEditPrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  // Filtrer les prescriptions selon le contexte
  const filteredPrescriptions = consultationId 
    ? allPrescriptions.filter(p => p.consultation_id === consultationId)
    : prescriptionsByAnimal;

  const handleEdit = (prescription: any) => {
    setSelectedPrescription(prescription);
    setShowEditPrescription(true);
  };

  const handleDelete = (prescription: any) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la prescription pour ${prescription.medications?.map((m: any) => m.medication_name).join(', ') || 'médicaments'} ?`)) {
      // TODO: Implement delete functionality with new hooks
      toast({
        title: "Fonctionnalité à implémenter",
        description: "La suppression de prescription n'est pas encore implémentée.",
      });
    }
  };

  const handleStatusChange = (prescriptionId: string, newStatus: string) => {
    // TODO: Implement status change functionality with new hooks
    toast({
      title: "Fonctionnalité à implémenter",
      description: "Le changement de statut n'est pas encore implémenté.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'discontinued':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const transformPrescriptionForPrint = (dbPrescription: any) => {
    return {
      id: dbPrescription.id,
      consultationId: dbPrescription.consultation_id,
      clientId: dbPrescription.client_id,
      clientName: `${dbPrescription.client?.first_name || ''} ${dbPrescription.client?.last_name || ''}`.trim(),
      petId: dbPrescription.animal_id,
      petName: dbPrescription.animal?.name || '',
      date: dbPrescription.prescription_date,
      prescribedBy: 'Non spécifié',
      diagnosis: dbPrescription.diagnosis || '',
      medications: dbPrescription.medications?.map((med: any) => ({
        id: med.id,
        name: med.medication_name,
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        duration: med.duration || '',
        instructions: med.instructions || '',
        quantity: med.quantity || 1,
        unit: 'unit',
        cost: 0
      })) || [],
      instructions: dbPrescription.notes || '',
      duration: dbPrescription.valid_until || '',
      followUpDate: undefined,
      status: dbPrescription.status || 'active',
      notes: dbPrescription.notes || '',
      createdAt: dbPrescription.created_at
    };
  };

  const calculateTotalCost = (medications: any[]) => {
    return medications?.reduce((total, med) => total + (med.cost || 0), 0) || 0;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Prescriptions ({filteredPrescriptions.length})
          </h3>
          <Button 
            size="sm" 
            onClick={() => setShowNewPrescription(true)}
            disabled={!consultationId}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Prescription
          </Button>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Aucune prescription trouvée</p>
              <p className="text-sm">Commencez par créer une nouvelle prescription</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions
              .sort((a, b) => new Date(b.prescription_date || b.date).getTime() - new Date(a.prescription_date || a.date).getTime())
              .map((prescription) => (
                <Card key={prescription.id} className="card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(prescription.status)}
                          <Badge className={statusStyles[prescription.status]}>
                            {statusLabels[prescription.status]}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {new Date(prescription.prescription_date || prescription.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <PrescriptionPrint prescription={transformPrescriptionForPrint(prescription)} />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(prescription)}
                          className="h-8 w-8 p-0"
                          title="Modifier"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(prescription)}
                          className="h-8 w-8 p-0 text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Informations générales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Prescrit par:</span>
                        <p className="text-muted-foreground">Non spécifié</p>
                      </div>
                      <div>
                        <span className="font-medium">Diagnostic:</span>
                        <p className="text-muted-foreground">{prescription.diagnosis}</p>
                      </div>
                      <div>
                        <span className="font-medium">Durée:</span>
                        <p className="text-muted-foreground">{prescription.valid_until ? new Date(prescription.valid_until).toLocaleDateString('fr-FR') : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Coût total:</span>
                        <p className="text-muted-foreground">{calculateTotalCost(prescription.medications).toFixed(2)}€</p>
                      </div>
                    </div>

                    {/* Médicaments */}
                    <div>
                      <h4 className="font-medium mb-3">Médicaments prescrits:</h4>
                      <div className="space-y-3">
                        {prescription.medications?.map((medication: any) => (
                          <div key={medication.id} className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="font-medium">{medication.medication_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Posologie:</span> {medication.dosage} - {medication.frequency}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Durée:</span> {medication.duration}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Quantité:</span> {medication.quantity}
                                </div>
                                {medication.instructions && (
                                  <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">Instructions:</span> {medication.instructions}
                                  </div>
                                )}
                              </div>
                              {medication.cost && (
                                <div className="text-right">
                                  <div className="font-medium">{medication.cost.toFixed(2)}€</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions générales */}
                    {prescription.instructions && (
                      <div>
                        <span className="font-medium">Instructions générales:</span>
                        <p className="text-sm text-muted-foreground mt-1">{prescription.instructions}</p>
                      </div>
                    )}

                    {/* Date de suivi */}
                    {prescription.followUpDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Suivi prévu:</span>
                        <span className="text-muted-foreground">
                          {new Date(prescription.followUpDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {prescription.notes && (
                      <div>
                        <span className="font-medium">Notes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{prescription.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {consultationId && (
        <NewPrescriptionModal 
          open={showNewPrescription} 
          onOpenChange={setShowNewPrescription}
          petId={petId.toString()}
          consultationId={consultationId.toString()}
        />
      )}
      <PrescriptionEditModal
        open={showEditPrescription}
        onOpenChange={setShowEditPrescription}
        prescription={selectedPrescription}
      />
    </>
  );
}