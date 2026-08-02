import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Plus, TrendingUp, Activity } from "lucide-react";
import { useState } from "react";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { useClients, useAnimals, useConsultations, useAppointments } from "@/hooks/useDatabase";
import { calculateAge } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";

export function PetsOverview() {
  const { t } = useTranslation("app");
  const { bcp47 } = useAppLocale();
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { data: consultations = [] } = useConsultations();
  useAppointments();
  const [showPetModal, setShowPetModal] = useState(false);

  const totalPets = pets.length;

  const healthyPets = pets.filter(p => p.status === 'vivant').length;
  const sickPets = pets.filter(p => {
    const recentConsultations = consultations.filter(c =>
      c.animal_id === p.id &&
      new Date(c.consultation_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    return recentConsultations.length > 0;
  }).length;

  const petsWithActivity = pets.map(pet => {
    const petConsultations = consultations.filter(c => c.animal_id === pet.id);
    const lastConsultation = petConsultations.length > 0
      ? Math.max(...petConsultations.map(c => new Date(c.consultation_date).getTime()))
      : 0;
    return {
      ...pet,
      lastActivity: lastConsultation > 0 ? new Date(lastConsultation).toISOString() : pet.created_at,
      consultationsCount: petConsultations.length
    };
  });

  const sortedPets = [...petsWithActivity].sort((a, b) =>
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  const recentPets = sortedPets.slice(0, 5);

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const newPetsThisMonth = pets.filter(p => {
    const createdDate = new Date(p.created_at);
    return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
  }).length;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {t("dashboard.petsOverview.title")}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowPetModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("dashboard.petsOverview.new")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalPets}</div>
            <div className="text-sm text-muted-foreground">{t("dashboard.petsOverview.total")}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{healthyPets}</div>
            <div className="text-sm text-muted-foreground">{t("dashboard.petsOverview.healthy")}</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{sickPets}</div>
            <div className="text-sm text-muted-foreground">{t("dashboard.petsOverview.inTreatment")}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>{t("dashboard.petsOverview.newThisMonth", { count: newPetsThisMonth })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <span>{t("dashboard.petsOverview.activeFollowed", { count: totalPets })}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">{t("dashboard.petsOverview.recentList")}</h4>
          {recentPets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t("dashboard.petsOverview.empty")}
            </p>
          ) : (
            recentPets.map((pet) => {
              const owner = clients.find(c => c.id === pet.client_id);
              const ownerName = owner
                ? `${owner.first_name} ${owner.last_name}`
                : t("dashboard.petsOverview.unknownOwner");

              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'vivant': return 'bg-green-100 text-green-800';
                  case 'décédé': return 'bg-red-100 text-red-800';
                  case 'perdu': return 'bg-orange-100 text-orange-800';
                  default: return 'bg-gray-100 text-gray-800';
                }
              };

              return (
                <div
                  key={pet.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      {pet.photo_url ? (
                        <AvatarImage src={pet.photo_url} alt={pet.name} />
                      ) : (
                        <AvatarFallback className="text-sm">🐾</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium truncate">{pet.name}</h4>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {pet.species}
                        </Badge>
                        <Badge className={`text-xs flex-shrink-0 ${getStatusColor(pet.status)}`}>
                          {pet.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>{t("dashboard.petsOverview.owner", { name: ownerName })}</span>
                        {pet.breed && <span>{t("dashboard.petsOverview.breed", { breed: pet.breed })}</span>}
                        {pet.birth_date && (
                          <span>{t("dashboard.petsOverview.age", { age: calculateAge(pet.birth_date) })}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>{t("dashboard.petsOverview.consultations", { count: pet.consultationsCount })}</span>
                        <span>{t("dashboard.petsOverview.lastActivity", { date: new Date(pet.lastActivity).toLocaleDateString(bcp47) })}</span>
                        {pet.weight && <span>{t("dashboard.petsOverview.weight", { weight: pet.weight })}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <NewPetModal
        open={showPetModal}
        onOpenChange={setShowPetModal}
      />
    </Card>
  );
}
