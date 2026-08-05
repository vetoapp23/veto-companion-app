// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Heart, User, Calendar, Pill, Thermometer, Edit, Trash2, Grid, List, Eye } from "lucide-react";
import { formatTemperature } from "@/lib/utils";
import { AppPageHeader } from "@/components/AppPageHeader";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { ConsultationEditModalNew } from "@/components/modals/ConsultationEditModalNew";
import { ConsultationPrintNew } from "@/components/ConsultationPrintNew";
import { NewPrescriptionModal } from "@/components/forms/NewPrescriptionModal";
import { PrescriptionEditModal } from "@/components/modals/PrescriptionEditModal";
import { PrescriptionPrint } from "@/components/PrescriptionPrint";
import { transformDbPrescriptionForPrint } from "@/lib/prescriptionPrint";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { useConsultations, useCreateConsultation, useUpdateConsultation, useDeleteConsultation, usePrescriptions } from "@/hooks/useDatabase";
import type { Consultation, CreateConsultationData, Prescription } from "@/lib/database";
import { deleteConsultationDirect } from "@/lib/consultationUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListDateFilter, DEFAULT_LIST_DATE_FILTER } from "@/components/ListDateFilter";
import { matchesListDateFilter, type ListDateFilterState } from "@/lib/dateLocal";
import { useWriteAccess } from "@/components/RoleGuard";
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";

const Consultations = () => {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { bcp47 } = useAppLocale();
  const { data: consultations = [], isLoading } = useConsultations();
  const { data: prescriptions = [] } = usePrescriptions();
  const createConsultationMutation = useCreateConsultation();
  const updateConsultationMutation = useUpdateConsultation();
  const deleteConsultationMutation = useDeleteConsultation();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { currentView } = useDisplayPreference('consultations');
  const { canWrite, guardWrite } = useWriteAccess("can_create_consultations");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<ListDateFilterState>(DEFAULT_LIST_DATE_FILTER);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [showNewConsultation, setShowNewConsultation] = useState(false);
  const [showEditConsultation, setShowEditConsultation] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [consultationPrefillData, setConsultationPrefillData] = useState<Partial<CreateConsultationData & { clientId: string; animalId: string }> | null>(null);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [prescriptionPetId, setPrescriptionPetId] = useState<string | null>(null);
  const [prescriptionConsultationId, setPrescriptionConsultationId] = useState<string | null>(null);
  const [showPrescriptionDetails, setShowPrescriptionDetails] = useState(false);
  const [selectedConsultationPrescriptions, setSelectedConsultationPrescriptions] = useState<any[]>([]);
  const [selectedAnimalName, setSelectedAnimalName] = useState<string>('');
  const [showEditPrescription, setShowEditPrescription] = useState(false);
  const [prescriptionToEdit, setPrescriptionToEdit] = useState<Prescription | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);

  // Helper function to get prescriptions for a consultation
  const getPrescriptionsForConsultation = (consultationId: string) => {
    return prescriptions.filter(prescription => 
      prescription.consultation_id === consultationId
    );
  };

  const filteredConsultations = consultations.filter(consultation => {
    const clientName = `${consultation.client?.first_name || ''} ${consultation.client?.last_name || ''}`.trim();
    const petName = consultation.animal?.name || '';
    
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (consultation.symptoms && consultation.symptoms.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (consultation.diagnosis && consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch && matchesListDateFilter(consultation.consultation_date, dateFilter);
  });

  const handleEditConsultation = (consultation: Consultation) => {
    if (!guardWrite()) return;
    setSelectedConsultation(consultation);
    setShowEditConsultation(true);
  };

  const handleNewPrescription = (consultation: Consultation) => {
    if (!guardWrite()) return;
    setPrescriptionPetId(consultation.animal_id);
    setPrescriptionConsultationId(consultation.id);
    setShowNewPrescription(true);
  };

  const handleDeleteConsultation = (consultation: Consultation) => {
    if (!guardWrite()) return;
    setConsultationToDelete(consultation);
    setShowDeleteAlert(true);
  };

  const confirmDeleteConsultation = async () => {
    if (!guardWrite()) return;
    if (!consultationToDelete) return;
    
    try {
      // Use both approaches for better chance of success
      
      // 1. Try direct deletion first
      const result = await deleteConsultationDirect(consultationToDelete.id);
      
      if (result.success) {
        toast({
          title: t("consultations.deleted"),
          description: t("consultations.deleted"),
        });
        
        // Manually refetch data after successful delete
        window.location.reload();
        setShowDeleteAlert(false);
        setConsultationToDelete(null);
        return;
      }
      
      // 2. If direct deletion fails, try mutation
      deleteConsultationMutation.mutate(consultationToDelete.id, {
        onSuccess: () => {
          toast({
            title: t("consultations.deleted"),
            description: t("consultations.deleted"),
          });
          setShowDeleteAlert(false);
          setConsultationToDelete(null);
        },
        onError: (error) => {
          toast({
            title: tc("error"),
            description: `${t("consultations.cannotDelete")}: ${error.message}`,
            variant: "destructive",
          });
          setShowDeleteAlert(false);
          setConsultationToDelete(null);
        }
      });
    } catch (error: any) {
      toast({
        title: tc("error"),
        description: `${tc("unexpectedError")} ${error.message || tc("unknown")}`,
        variant: "destructive",
      });
      setShowDeleteAlert(false);
      setConsultationToDelete(null);
    }
  };

  const handleNewFollowUp = (consultation: Consultation) => {
    if (!guardWrite()) return;
    // Pré-remplir le formulaire avec les informations du client et de l'animal
    setConsultationPrefillData({
      clientId: consultation.client_id,
      animalId: consultation.animal_id,
      consultation_date: new Date().toISOString(),
      consultation_type: 'follow-up',
      symptoms: "",
      diagnosis: "",
      treatment: "",
      notes: t("consultations.followUpNote", { date: new Date(consultation.consultation_date).toLocaleDateString(bcp47) }),
      status: "scheduled"
    });
    setShowNewConsultation(true);
  };

  const handleViewPrescriptions = (consultation: any) => {
    const consultationPrescriptions = getPrescriptionsForConsultation(consultation.id);
    setSelectedConsultationPrescriptions(consultationPrescriptions);
    setSelectedAnimalName(consultation.animal?.name || t("consultations.unknownPet"));
    setShowPrescriptionDetails(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
      <AppPageHeader
        icon={FileText}
        title={t("consultations.title")}
        description={t("consultations.description")}
        actions={
          <>
            <div className="flex border rounded-full p-1 bg-muted/50">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="rounded-full px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-full px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            {canWrite && (
            <Button
              size="sm"
              className="gap-1 sm:gap-2 rounded-full"
              onClick={() => {
                if (!guardWrite()) return;
                setShowNewConsultation(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t("consultations.new")}</span>
            </Button>
            )}
          </>
        }
      />

      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
        <Search className="h-4 sm:h-5 w-4 sm:w-5" />
        {tc("searchAndFilter")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full flex-col gap-3 sm:gap-4">
        <Input 
          placeholder={t("consultations.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md"
        />
        <ListDateFilter
          value={dateFilter}
          onChange={setDateFilter}
          idPrefix="consultations-date"
        />
        </div>
      </CardContent>
      </Card>

      <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold">
        {t("consultations.title")} ({filteredConsultations.length})
      </h3>
      
      {filteredConsultations.length === 0 ? (
        <Card>
        <CardContent className="p-6 sm:p-8 text-center text-muted-foreground">
          <FileText className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-sm sm:text-base">{t("consultations.empty")}</p>
          <p className="text-xs sm:text-sm">{t("consultations.emptyHint")}</p>
        </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        filteredConsultations.map((consultation) => (
        <Card key={consultation.id} className="card-hover">
          <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h4 className="text-base sm:text-lg font-semibold">{consultation.animal?.name || t("consultations.unknownPet")}</h4>
              <Badge variant="secondary" className="w-fit">{t("consultations.title")}</Badge>
              {(consultation.visit_id) && (
                <Badge variant="outline" className="w-fit">{t("consultations.linkedVisit")}</Badge>
              )}
              <span className="text-xs sm:text-sm text-muted-foreground">
                {new Date(consultation.consultation_date).toLocaleDateString(bcp47)}
              </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 sm:h-4 w-3 sm:w-4" />
                {consultation.client?.first_name} {consultation.client?.last_name}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Consultation #{consultation.id}
              </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              {consultation.temperature && (
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 sm:h-4 w-3 sm:w-4 text-primary" />
                {formatTemperature(consultation.temperature, '-')}
              </div>
              )}
              {consultation.weight && (
              <span>{consultation.weight} kg</span>
              )}
            </div>
            </div>
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              {consultation.symptoms && (
              <>
                <h5 className="font-medium text-sm sm:text-base">{t("consultations.clinical.symptoms")}:</h5>
                <p className="text-xs sm:text-sm">{consultation.symptoms}</p>
              </>
              )}
              
              {consultation.diagnosis && (
              <>
                <h5 className="font-medium text-sm sm:text-base">{t("consultations.clinical.diagnosis")}:</h5>
                <p className="text-xs sm:text-sm">{consultation.diagnosis}</p>
              </>
              )}
            </div>
            
            <div className="space-y-2">
              {consultation.treatment && (
              <>
                <h5 className="font-medium text-sm sm:text-base">{t("consultations.clinical.treatment")}:</h5>
                <p className="text-xs sm:text-sm">{consultation.treatment}</p>
              </>
              )}
              
              {(() => {
              const consultationPrescriptions = getPrescriptionsForConsultation(consultation.id);
              return consultationPrescriptions.length > 0 && (
                <>
                <h5 className="font-medium flex items-center gap-1 text-sm sm:text-base">
                  <Pill className="h-3 sm:h-4 w-3 sm:w-4" />
                  {t("consultations.prescription.title")} ({consultationPrescriptions.length}):
                </h5>
                <div className="space-y-1">
                  {consultationPrescriptions.map((prescription: any) => (
                  <div key={prescription.id} className="text-xs sm:text-sm bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                    <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                    <div className="font-medium text-blue-800">
                    Prescription #{prescription.id.slice(-8)}
                    </div>
                    <div className="text-blue-600 text-xs">
                    {new Date(prescription.prescription_date).toLocaleDateString(bcp47)} - 
                    Status: {prescription.status}
                    </div>
                    {prescription.medications && prescription.medications.length > 0 && (
                    <div className="mt-1">
                      <div className="text-xs font-medium text-blue-700">{t("consultations.medications")}:</div>
                      {prescription.medications.map((med: any, idx: number) => (
                      <div key={idx} className="text-xs text-blue-600 ml-2">
                        • {med.medication_name} {med.dosage && `- ${med.dosage}`} {med.quantity && `(${med.quantity})`}
                      </div>
                      ))}
                    </div>
                    )}
                    </div>
                    <PrescriptionPrint
                      prescription={transformDbPrescriptionForPrint(prescription) as any}
                      compact
                    />
                    </div>
                  </div>
                  ))}
                </div>
                </>
              );
              })()}
            </div>
            </div>
            
            {consultation.notes && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm sm:text-base">{t("consultations.notes")}:</h5>
              <p className="text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded">{consultation.notes}</p>
            </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 inline mr-1" />
              {consultation.followUp ? t("consultations.followUp", { date: consultation.followUp }) : t("consultations.noFollowUp")}
            </span>
            
            <div className="flex flex-wrap gap-2">
              <ConsultationPrintNew consultation={consultation as Consultation} />
              {canWrite && (
              <>
              <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleEditConsultation(consultation as Consultation)}
              className="gap-1 text-xs sm:text-sm"
              >
              <Edit className="h-3 w-3" />
              {tc("edit")}
              </Button>
              <Button 
              size="sm" 
              variant="default"
              onClick={() => handleNewPrescription(consultation as Consultation)}
              className="gap-1 text-xs sm:text-sm"
              >
              <Pill className="h-3 w-3" />
              {t("consultations.prescription.title")}
              </Button>
              <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDeleteConsultation(consultation as Consultation)}
              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
              <Trash2 className="h-3 w-3" />
              {tc("delete")}
              </Button>
              <Button 
              size="sm"
              onClick={() => handleNewFollowUp(consultation as Consultation)}
              className="text-xs sm:text-sm"
              >
              {t("consultations.newFollowUp")}
              </Button>
              </>
              )}
            </div>
            </div>
          </div>
          </CardContent>
        </Card>
        ))
      ) : (
        <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">{t("consultations.columns.pet")} / {t("consultations.columns.client")}</TableHead>
              <TableHead className="text-xs sm:text-sm">{t("consultations.columns.date")}</TableHead>
              <TableHead className="text-xs sm:text-sm">{t("consultations.clinical.symptoms")}</TableHead>
              <TableHead className="text-xs sm:text-sm">{t("consultations.columns.diagnosis")}</TableHead>
              <TableHead className="text-xs sm:text-sm">{t("consultations.clinical.vitals")}</TableHead>
              <TableHead className="text-xs sm:text-sm">{t("consultations.prescription.title")}</TableHead>
              <TableHead className="text-xs sm:text-sm">{t("consultations.columns.actions")}</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {filteredConsultations.map((consultation) => (
              <TableRow key={consultation.id}>
              <TableCell className="text-xs sm:text-sm">
                <div>
                <div className="font-medium">{consultation.animal?.name}</div>
                <div className="text-xs text-muted-foreground">{consultation.client?.first_name} {consultation.client?.last_name}</div>
                </div>
              </TableCell>
              <TableCell className="text-xs sm:text-sm">
                {new Date(consultation.consultation_date).toLocaleDateString(bcp47)}
              </TableCell>
              <TableCell className="text-xs sm:text-sm">
                <div className="max-w-xs truncate">
                {consultation.symptoms || '-'}
                </div>
              </TableCell>
              <TableCell className="text-xs sm:text-sm">
                <div className="max-w-xs truncate">
                {consultation.diagnosis || '-'}
                </div>
              </TableCell>
              <TableCell className="text-xs sm:text-sm">
                {consultation.temperature ? formatTemperature(consultation.temperature) : '-'}
              </TableCell>
              <TableCell className="text-xs sm:text-sm">
                {(() => {
                const consultationPrescriptions = getPrescriptionsForConsultation(consultation.id);
                return consultationPrescriptions.length > 0 ? (
                  <div className="space-y-1">
                  <div 
                    className="flex items-center gap-2 cursor-pointer p-1 rounded transition-colors w-fit"
                    onClick={() => handleViewPrescriptions(consultation)}
                    title={t("consultations.prescriptionTooltip")}
                  >
                    <Badge variant="outline" className="text-xs">
                    {consultationPrescriptions.length} prescription{consultationPrescriptions.length > 1 ? 's' : ''}
                    </Badge>
                    <Eye className="h-3 w-3 text-blue-600 hover:text-blue-800" />
                  </div>
                  
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">{tc("none")}</span>
                );
                })()}
              </TableCell>
              <TableCell className="text-xs sm:text-sm">
                <div className="flex gap-1 flex-wrap">
                <ConsultationPrintNew consultation={consultation as Consultation} />
                {canWrite && (
                <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEditConsultation(consultation as Consultation)}
                  title={t("consultations.tooltips.edit")}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleNewPrescription(consultation as Consultation)}
                  title={t("consultations.prescription.new")}
                >
                  <Pill className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDeleteConsultation(consultation as Consultation)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title={t("consultations.tooltips.delete")}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                </>
                )}
                </div>
              </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
        </Card>
      )}
      </div>
      
      <NewConsultationModal 
      open={showNewConsultation} 
      onOpenChange={(open) => {
        setShowNewConsultation(open);
        if (!open) {
        setConsultationPrefillData(null);
        }
      }}
      prefillData={consultationPrefillData || undefined}
      />
      
      <ConsultationEditModalNew
      open={showEditConsultation}
      onOpenChange={setShowEditConsultation}
      consultation={selectedConsultation}
      />
      
      {prescriptionPetId && prescriptionConsultationId && (
      <NewPrescriptionModal
        open={showNewPrescription}
        onOpenChange={setShowNewPrescription}
        petId={prescriptionPetId}
        consultationId={prescriptionConsultationId}
      />
      )}

      <PrescriptionEditModal
        open={showEditPrescription}
        onOpenChange={(open) => {
          setShowEditPrescription(open);
          if (!open) setPrescriptionToEdit(null);
        }}
        prescription={prescriptionToEdit}
        onUpdated={(updated) => {
          setSelectedConsultationPrescriptions((prev) =>
            prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
          );
        }}
      />

      {/* Prescription Details Modal */}
      <Dialog open={showPrescriptionDetails} onOpenChange={setShowPrescriptionDetails}>
      <DialogContent className="max-w-full sm:max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
        <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
        <Pill className="h-4 sm:h-5 w-4 sm:w-5" />
        Prescriptions pour {selectedAnimalName}
      </DialogTitle>
      <DialogDescription className="text-sm">
        {t("consultations.prescriptionDetailsTitle", { count: selectedConsultationPrescriptions.length })}
      </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
      {selectedConsultationPrescriptions.map((prescription: any, index: number) => (
        <Card key={prescription.id} className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle className="text-base sm:text-lg">
          Prescription #{prescription.id.slice(-8)}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={prescription.status === 'active' ? 'default' : prescription.status === 'completed' ? 'secondary' : 'destructive'}
          className="text-xs w-fit"
        >
          {prescription.status}
        </Badge>
        {canWrite && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            if (!guardWrite()) return;
            setPrescriptionToEdit(prescription);
            setShowEditPrescription(true);
          }}
        >
          <Edit className="h-4 w-4 mr-1" />
          {tc("edit")}
        </Button>
        )}
        <PrescriptionPrint
          prescription={transformDbPrescriptionForPrint(prescription) as any}
          compact
        />
        </div>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
        Date: {new Date(prescription.prescription_date).toLocaleDateString(bcp47)} à {new Date(prescription.prescription_date).toLocaleTimeString(bcp47)}
        {prescription.valid_until && (
          <span className="ml-0 sm:ml-4 block sm:inline">Valide jusqu'au: {new Date(prescription.valid_until).toLocaleDateString(bcp47)}</span>
        )}
        </div>
        </CardHeader>

        <CardContent className="space-y-4">
        {/* Diagnosis */}
        {prescription.diagnosis && (
        <div>
          <h4 className="font-medium text-sm mb-1">{t("consultations.clinical.diagnosis")}:</h4>
          <p className="text-sm bg-muted p-2 rounded">{prescription.diagnosis}</p>
        </div>
        )}

        {/* Medications */}
        {prescription.medications && prescription.medications.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">{t("consultations.medications")} ({prescription.medications.length}):</h4>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {prescription.medications.map((med: any, medIndex: number) => (
          <div key={medIndex} className="bg-muted p-3 rounded-lg">
          <div className="font-medium text-sm">{med.medication_name}</div>
          <div className="text-xs space-y-1 mt-1">
          {med.dosage && <div>{t("consultations.dosage")}: {med.dosage}</div>}
          {med.frequency && <div>{t("consultations.frequency")}: {med.frequency}</div>}
          {med.duration && <div>{t("consultations.duration")}: {med.duration}</div>}
          {med.quantity && <div>{t("consultations.quantity")}: {med.quantity}</div>}
          {med.route && <div>{t("consultations.route")}: {med.route}</div>}
          </div>
          {med.instructions && (
          <div className="mt-2 text-xs bg-background p-2 rounded border">
          <span className="font-medium">Instructions: </span>
          {med.instructions}
          </div>
          )}
          </div>
        ))}
          </div>
        </div>
        )}

        {/* Notes */}
        {prescription.notes && (
        <div>
          <h4 className="font-medium text-sm mb-1">{t("consultations.notes")}:</h4>
          <p className="text-sm bg-muted p-2 rounded">{prescription.notes}</p>
        </div>
        )}

        {/* Additional Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <span>Renouvellements: {prescription.refill_count || 0}</span>
        <span>{t("consultations.createdAt")}: {new Date(prescription.created_at).toLocaleDateString(bcp47)}</span>
        {prescription.updated_at !== prescription.created_at && (
          <span>{t("consultations.updatedAt")}: {new Date(prescription.updated_at).toLocaleDateString(bcp47)}</span>
        )}
        </div>
        <PrescriptionPrint
          prescription={transformDbPrescriptionForPrint(prescription) as any}
        />
        </div>
        </CardContent>
        </Card>
      ))}

      {selectedConsultationPrescriptions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
        <Pill className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-sm">{t("consultations.noPrescriptions")}</p>
        </div>
      )}
        </div>
      </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("consultations.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("consultations.deleteConfirmBody")} {' '}
              <strong>{consultationToDelete?.animal?.name || 'cet animal'}</strong> ?
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                {t("consultations.columns.date")}: {consultationToDelete && new Date(consultationToDelete.consultation_date).toLocaleDateString(bcp47)}
              </span>
              <br />
              {tc("cannotUndo")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConsultationToDelete(null)}>
              {tc("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteConsultation}
              className="bg-red-600 hover:bg-red-700"
            >
              {tc("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Consultations;