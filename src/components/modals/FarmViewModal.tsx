import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Mail, Calendar, Users2, AlertTriangle, CheckCircle, Clock, Building2, Shield, FileText, Car, UserCheck, Camera } from "lucide-react";
import { useClients } from "@/contexts/ClientContext";
import { Farm } from "@/contexts/ClientContext";
import { formatDate } from "@/lib/utils";

interface FarmViewModalProps {
  farm: Farm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onNewIntervention: () => void;
}

const FarmViewModal = ({ farm, open, onOpenChange, onEdit, onNewIntervention }: FarmViewModalProps) => {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { getFarmInterventionsByFarmId } = useClients();
  
  if (!farm) return null;

  const interventions = getFarmInterventionsByFarmId(farm.id);

  const statusStyles = {
    active: "bg-green-100 text-green-800",
    attention: "bg-yellow-100 text-yellow-800",
    urgent: "bg-red-100 text-red-800"
  };

  const getStatusIcon = (status: Farm['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'attention':
        return <AlertTriangle className="h-4 w-4" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(farm.status)}
            {farm.name}
            <Badge className={statusStyles[farm.status]}>
              {farm.status === 'active' ? t("farms.farmStatus.active") : 
               farm.status === 'attention' ? t("farms.farmStatus.attention") : t("farms.farmStatus.urgent")}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {t("farms.ui.viewFarmDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                {t("farms.ui.generalInfoTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("farms.owner")}</p>
                  <p className="font-medium">{farm.owner}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("farms.print.labels.farmTypes")}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {farm.types?.map((type) => (
                      <Badge key={type} variant="secondary">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.totalAnimals")}</p>
                  <p className="font-medium">{farm.totalAnimals}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.veterinarian")}</p>
                  <p className="font-medium">{farm.veterinarian || t("farms.ui.notAssigned")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.lastVisit")}</p>
                  <p className="font-medium">{formatDate(farm.lastVisit)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.createdAt")}</p>
                  <p className="font-medium">{formatDate(farm.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {tc("address")}
                </p>
                <p className="font-medium">{farm.address}</p>
              </div>

              {farm.coordinates && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.gpsCoordinates")}</p>
                  <p className="font-mono text-sm">
                    {farm.coordinates.latitude.toFixed(4)}, {farm.coordinates.longitude.toFixed(4)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {tc("phone")}
                  </p>
                  <p className="font-medium">{farm.phone || t("farms.ui.notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {tc("email")}
                  </p>
                  <p className="font-medium">{farm.email || t("farms.ui.notProvided")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails du cheptel */}
          {farm.animalDetails && farm.animalDetails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="h-5 w-5" />
                  {t("farms.ui.herdDetailsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {farm.animalDetails.map((detail, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{detail.category}</Badge>
                        <span className="text-sm font-medium">
                          {t("farms.ui.totalAnimalsCount", { count: detail.maleCount + detail.femaleCount })}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t("farms.ui.males")}:</span> {detail.maleCount}
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("farms.ui.females")}:</span> {detail.femaleCount}
                        </div>
                        {detail.breeds.length > 0 && (
                          <div className="md:col-span-3">
                            <span className="text-muted-foreground">{t("farms.ui.breedsTitle")}:</span> {detail.breeds.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations administratives */}
          {(farm.registrationNumber || farm.surfaceArea || farm.buildingDetails || farm.equipmentDetails) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t("farms.ui.adminInfoTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farm.registrationNumber && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.registrationImm")}</p>
                      <p className="font-medium">{farm.registrationNumber}</p>
                    </div>
                  )}
                  {farm.surfaceArea && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.surfaceLabel")}</p>
                      <p className="font-medium">{farm.surfaceArea} {t("farms.ui.hectaresUnit")}</p>
                    </div>
                  )}
                </div>
                {farm.buildingDetails && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.buildings")}</p>
                    <p className="font-medium">{farm.buildingDetails}</p>
                  </div>
                )}
                {farm.equipmentDetails && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.equipment")}</p>
                    <p className="font-medium">{farm.equipmentDetails}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {farm.certifications && farm.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("farms.certifications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {farm.certifications.map((cert) => (
                    <Badge key={cert} variant="outline">{cert}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assurance et contact d'urgence */}
          {(farm.insuranceDetails || farm.emergencyContact) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("farms.ui.insuranceEmergencyTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {farm.insuranceDetails && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.insurance")}</p>
                    <p className="font-medium">{farm.insuranceDetails}</p>
                  </div>
                )}
                {farm.emergencyContact && farm.emergencyContact.name && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.emergencyContact")}</p>
                      <p className="font-medium">{farm.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{tc("phone")}</p>
                      <p className="font-medium">{farm.emergencyContact.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("farms.ui.emergencyRelation")}</p>
                      <p className="font-medium">{farm.emergencyContact.relation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {farm.notes && (
            <Card>
              <CardHeader>
                <CardTitle>{tc("notes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{farm.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Détails du cheptel calculé depuis la ferme */}
          <Card>
            <CardHeader>
              <CardTitle>{t("farms.ui.herdDetailsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {farm.animalDetails && farm.animalDetails.length > 0 ? (
                <div className="space-y-4">
                  {farm.animalDetails.map((detail, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{detail.category}</h4>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            {t("farms.ui.totalAnimalsCount", { count: detail.maleCount + detail.femaleCount })}
                          </Badge>
                          <Badge variant="outline">
                            {t("farms.ui.males")}: {detail.maleCount}
                          </Badge>
                          <Badge variant="outline">
                            {t("farms.ui.females")}: {detail.femaleCount}
                          </Badge>
                        </div>
                      </div>
                      
                      {detail.breeds && detail.breeds.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-muted-foreground">{t("farms.ui.breedsTitle")}: </span>
                          {detail.breeds.map((breed, breedIndex) => (
                            <Badge key={breedIndex} variant="outline" className="mr-1 text-xs">
                              {breed}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {detail.ageGroups && detail.ageGroups.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">{t("farms.ui.ageGroups")} </span>
                          {detail.ageGroups.map((ageGroup, ageIndex) => (
                            <Badge key={ageIndex} variant="outline" className="mr-1 text-xs">
                              {ageGroup}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t("farms.ui.noHerdDetails")}</p>
              )}
            </CardContent>
          </Card>

          {/* Gestion des photos de l'exploitation */}
          <Card>
            <CardHeader>
              <CardTitle>{t("farms.farmPhotos")}</CardTitle>
            </CardHeader>
            <CardContent>
              {farm.photos && farm.photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farm.photos.map((photo) => (
                    <div key={photo.id} className="group relative">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={photo.url}
                          alt={photo.description}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay avec catégorie */}
                        <div className="absolute top-2 right-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-black/70 text-white border-0"
                          >
                            {photo.category === 'cheptel' ? t("farms.ui.photoCategories.cheptel") :
                             photo.category === 'batiments' ? t("farms.ui.photoCategories.batiments") :
                             photo.category === 'equipements' ? t("farms.ui.photoCategories.equipements") : t("farms.ui.photoCategories.general")}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium truncate">{photo.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(photo.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("farms.ui.noPhotos")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("farms.ui.photosEditHint")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Onglets pour les interventions */}
          <Tabs defaultValue="interventions" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="interventions">
                <Calendar className="h-4 w-4 mr-2" />
                Interventions ({interventions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="interventions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("farms.ui.veterinaryInterventions")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {interventions.length > 0 ? (
                    <div className="space-y-2">
                      {interventions.map((intervention) => (
                        <div key={intervention.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{intervention.type}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {formatDate(intervention.date)}
                            </span>
                          </div>
                          <Badge variant="outline">{intervention.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t("farms.ui.noInterventionsForFarm")}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button onClick={onNewIntervention} variant="outline">
            {t("farms.newIntervention")}
          </Button>
          <Button onClick={onEdit}>
            {tc("edit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FarmViewModal;
