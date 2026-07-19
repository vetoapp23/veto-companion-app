import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Stethoscope, Plus, Eye, Edit, FileText, Calendar, User, Heart, TrendingUp, Clock, Activity, DollarSign } from "lucide-react";
import { useState } from "react";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { ConsultationEditModalNew } from "@/components/modals/ConsultationEditModalNew";
import { ConsultationPrint } from "@/components/ConsultationPrint";
import { useConsultations, useClients, useAnimals } from "@/hooks/useDatabase";
import { Consultation } from "@/lib/database";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";

export function ConsultationsOverview() {
  const { data: consultations = [] } = useConsultations();
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const { settings } = useSettings();
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);

  // Trier les consultations par date (plus récente en premier)
  const sortedConsultations = [...consultations].sort((a, b) => 
    new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime()
  );

  // Prendre les 5 consultations les plus récentes
  const recentConsultations = sortedConsultations.slice(0, 5);

  // Calculer les statistiques des consultations
  const totalConsultations = consultations.length;
  const today = new Date().toISOString().split('T')[0];
  const consultationsToday = consultations.filter(c => 
    new Date(c.consultation_date).toISOString().split('T')[0] === today
  ).length;
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const consultationsThisMonth = consultations.filter(c => {
    const consultationDate = new Date(c.consultation_date);
    return consultationDate.getMonth() === thisMonth && consultationDate.getFullYear() === thisYear;
  }).length;

  const consultationsLastMonth = consultations.filter(c => {
    const consultationDate = new Date(c.consultation_date);
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    return consultationDate.getMonth() === lastMonth && consultationDate.getFullYear() === lastMonthYear;
  }).length;

  const changePercentage = consultationsLastMonth > 0 ? 
    Math.round(((consultationsThisMonth - consultationsLastMonth) / consultationsLastMonth) * 100) : 
    consultationsThisMonth > 0 ? 100 : 0;

  // Calculer les revenus estimés
  const estimatedRevenue = consultationsThisMonth * 50; // Estimation de 50€ par consultation
  const previousRevenue = consultationsLastMonth * 50;
  const revenueChange = previousRevenue > 0 ? 
    Math.round(((estimatedRevenue - previousRevenue) / previousRevenue) * 100) : 
    estimatedRevenue > 0 ? 100 : 0;

  const handleEdit = (consultation: any) => {
    setSelectedConsultation(consultation);
    setShowEditModal(true);
  };

  const getStatusColor = (consultation: any) => {
    const consultationDate = new Date(consultation.consultation_date).toISOString().split('T')[0];
    if (consultationDate === today) return "bg-accent text-accent-foreground";
    if (consultationDate < today) return "bg-secondary text-secondary-foreground";
    return "bg-primary text-primary-foreground";
  };

  const getStatusText = (consultation: any) => {
    const consultationDate = new Date(consultation.consultation_date).toISOString().split('T')[0];
    if (consultationDate === today) return "Aujourd'hui";
    if (consultationDate < today) return "Terminée";
    return "À venir";
  };

  const getConsultationDetails = (consultation: any) => {
    const animal = consultation.animal || animals.find(p => p.id === consultation.animal_id);
    const client = consultation.client || clients.find(c => c.id === consultation.client_id);
    
    return {
      animalName: animal?.name || 'Animal inconnu',
      animalSpecies: animal?.species || 'Inconnu',
      animalBreed: animal?.breed || 'Non spécifiée',
      clientName: client ? `${client.first_name} ${client.last_name}` : 'Client inconnu',
      clientPhone: client?.phone || 'Non spécifié',
      clientCity: client?.address || 'Non spécifiée'
    };
  };

  return (
    <>
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Consultations Récentes
            </CardTitle>
            <Button size="sm" className="gap-2" onClick={() => setShowConsultationModal(true)}>
              <Plus className="h-4 w-4" />
              Nouveau
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalConsultations}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{consultationsToday}</div>
              <div className="text-sm text-muted-foreground">Aujourd'hui</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>+{consultationsThisMonth} ce mois</span>
              {changePercentage !== 0 && (
                <Badge variant={changePercentage > 0 ? "default" : "destructive"} className="text-xs">
                  {changePercentage > 0 ? '+' : ''}{changePercentage}%
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>~{estimatedRevenue}€ ce mois</span>
            </div>
          </div>

          {/* Recent Consultations List */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Dernières consultations</h4>
          {recentConsultations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Aucune consultation enregistrée</p>
              <p className="text-sm">Commencez par créer votre première consultation</p>
            </div>
          ) : (
            recentConsultations.map((consultation) => {
              const details = getConsultationDetails(consultation);
              return (
                <div
                  key={consultation.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Stethoscope className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium truncate">#{consultation.id.slice(0, 8)}</h4>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(consultation)}`}>
                          {getStatusText(consultation)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{details.animalName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{details.clientName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>{new Date(consultation.consultation_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(consultation)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <ConsultationPrint consultation={consultation as any} />
                  </div>
                </div>
              );
            })
          )}
          </div>
        </CardContent>
      </Card>

      <NewConsultationModal 
        open={showConsultationModal} 
        onOpenChange={setShowConsultationModal} 
      />
      
      <ConsultationEditModalNew
        open={showEditModal}
        onOpenChange={setShowEditModal}
        consultation={selectedConsultation}
      />
    </>
  );
}
