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
import { transformDbPrescriptionForPrint } from "@/lib/prescriptionPrint";
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";

interface PrescriptionsListProps {
  petId: string;
  consultationId?: string;
}

const statusStyles = {
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  discontinued: "bg-red-100 text-red-800"
};

export function PrescriptionsList({ petId, consultationId }: PrescriptionsListProps) {
  const { data: allPrescriptions = [] } = usePrescriptions();
  const { data: prescriptionsByAnimal = [] } = usePrescriptionsByAnimal(petId);
  const { toast } = useToast();
  const { t } = useTranslation("medical");
  const { t: tc } = useTranslation("common");
  const { bcp47 } = useAppLocale();
  const statusLabels = {
    active: t("prescriptionsList.statuses.active"),
    completed: t("prescriptionsList.statuses.completed"),
    discontinued: t("prescriptionsList.statuses.discontinued"),
  };
  
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
    if (confirm(tc("areYouSure"))) {
      // TODO: Implement delete functionality with new hooks
      toast({
        title: tc("notAvailable"),
        description: tc("featureLocked"),
      });
    }
  };

  const handleStatusChange = (prescriptionId: string, newStatus: string) => {
    // TODO: Implement status change functionality with new hooks
    toast({
      title: tc("notAvailable"),
      description: tc("featureLocked"),
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

  const transformPrescriptionForPrint = transformDbPrescriptionForPrint;

  const calculateTotalCost = (medications: any[]) => {
    return medications?.reduce((total, med) => total + (med.cost || 0), 0) || 0;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Pill className="h-5 w-5" />
            {t("prescriptionsList.headings.title")} ({filteredPrescriptions.length})
          </h3>
          <Button 
            size="sm" 
            onClick={() => setShowNewPrescription(true)}
            disabled={!consultationId}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {tc("create")}
          </Button>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>{t("prescriptionsList.empty")}</p>
              <p className="text-sm">{tc("emptyState")}</p>
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
                          {new Date(prescription.prescription_date || prescription.date).toLocaleDateString(bcp47)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <PrescriptionPrint prescription={transformPrescriptionForPrint(prescription)} compact />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(prescription)}
                          className="h-8 w-8 p-0"
                          title={tc("edit")}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(prescription)}
                          className="h-8 w-8 p-0 text-red-600"
                          title={tc("delete")}
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
                        <span className="font-medium">{t("prescriptionsList.labels.veterinarian")}:</span>
                        <p className="text-muted-foreground">{t("prescriptionsList.notSpecified")}</p>
                      </div>
                      <div>
                        <span className="font-medium">{t("consultations.clinical.diagnosis")}:</span>
                        <p className="text-muted-foreground">{prescription.diagnosis}</p>
                      </div>
                      <div>
                        <span className="font-medium">{t("prescriptionsList.labels.duration")}:</span>
                        <p className="text-muted-foreground">{prescription.valid_until ? new Date(prescription.valid_until).toLocaleDateString(bcp47) : tc("notAvailable")}</p>
                      </div>
                      <div>
                        <span className="font-medium">{tc("total")}:</span>
                        <p className="text-muted-foreground">{calculateTotalCost(prescription.medications).toFixed(2)}€</p>
                      </div>
                    </div>

                    {/* Médicaments */}
                    <div>
                      <h4 className="font-medium mb-3">{t("prescriptionsList.headings.medications")}:</h4>
                      <div className="space-y-3">
                        {prescription.medications?.map((medication: any) => (
                          <div key={medication.id} className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="font-medium">{medication.medication_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">{t("prescriptionsList.labels.dosage")}:</span> {medication.dosage} - {medication.frequency}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">{t("prescriptionsList.labels.duration")}:</span> {medication.duration}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">{tc("quantity")}:</span> {medication.quantity}
                                </div>
                                {medication.instructions && (
                                  <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">{t("prescriptionsList.labels.instructions")}:</span> {medication.instructions}
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
                        <span className="font-medium">{t("prescriptionsList.labels.instructions")}:</span>
                        <p className="text-sm text-muted-foreground mt-1">{prescription.instructions}</p>
                      </div>
                    )}

                    {/* Date de suivi */}
                    {prescription.followUpDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{tc("reminder")}:</span>
                        <span className="text-muted-foreground">
                          {new Date(prescription.followUpDate).toLocaleDateString(bcp47)}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {prescription.notes && (
                      <div>
                        <span className="font-medium">{tc("notes")}:</span>
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
        onOpenChange={(open) => {
          setShowEditPrescription(open);
          if (!open) setSelectedPrescription(null);
        }}
        prescription={selectedPrescription}
      />
    </>
  );
}