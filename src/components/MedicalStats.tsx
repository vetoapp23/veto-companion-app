import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Weight, Thermometer, TrendingUp, TrendingDown, Minus, Activity, Calendar, AlertTriangle } from "lucide-react";
import { Pet, Consultation } from "@/contexts/ClientContext";
import { roundTemperature, formatTemperatureValue } from "@/lib/utils";

interface MedicalStatsProps {
  pet: Pet;
  consultations: Consultation[];
}

export function MedicalStats({ pet, consultations }: MedicalStatsProps) {
  // Trier les consultations par date (plus récentes en premier)
  const sortedConsultations = [...consultations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Extraire les données de poids et température
  const weightData = sortedConsultations
    .filter(c => c.weight)
    .map(c => ({ date: c.date, weight: parseFloat(c.weight) }));

  const temperatureData = sortedConsultations
    .filter(c => c.temperature)
    .map(c => ({
      date: c.date,
      temperature: roundTemperature(c.temperature) ?? 0,
    }));

  // Calculer les statistiques
  const currentWeight = weightData[0]?.weight || 0;
  const previousWeight = weightData[1]?.weight || 0;
  const weightChange = currentWeight - previousWeight;
  const weightTrend = weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'stable';

  const currentTemperature = temperatureData[0]?.temperature || 0;
  const avgTemperature = temperatureData.length > 0 
    ? temperatureData.reduce((sum, data) => sum + data.temperature, 0) / temperatureData.length 
    : 0;

  const minTemperature = temperatureData.length > 0 
    ? Math.min(...temperatureData.map(d => d.temperature))
    : 0;

  const maxTemperature = temperatureData.length > 0 
    ? Math.max(...temperatureData.map(d => d.temperature))
    : 0;

  // Calculer la fréquence des consultations
  const totalConsultations = consultations.length;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const consultationsThisMonth = consultations.filter(c => {
    const consultationDate = new Date(c.date);
    return consultationDate.getMonth() === thisMonth && consultationDate.getFullYear() === thisYear;
  }).length;

  // Dernière consultation
  const lastConsultation = sortedConsultations[0];
  const daysSinceLastVisit = lastConsultation 
    ? Math.floor((new Date().getTime() - new Date(lastConsultation.date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Alertes
  const alerts = [];
  
  if (currentTemperature > 39.5) {
    alerts.push({
      type: 'danger',
      message: 'Température élevée',
      icon: AlertTriangle
    });
  } else if (currentTemperature < 37.5) {
    alerts.push({
      type: 'warning',
      message: 'Température basse',
      icon: AlertTriangle
    });
  }

  if (weightChange < -2) {
    alerts.push({
      type: 'warning',
      message: 'Perte de poids',
      icon: TrendingDown
    });
  }

  if (daysSinceLastVisit && daysSinceLastVisit > 180) {
    alerts.push({
      type: 'info',
      message: 'Contrôle recommandé',
      icon: Calendar
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Statistiques médicales</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Poids actuel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Weight className="h-4 w-4" />
              Poids actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeight}kg</div>
            {weightChange !== 0 && (
              <div className="flex items-center gap-1 text-sm mt-1">
                {weightTrend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : weightTrend === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                ) : (
                  <Minus className="h-3 w-3 text-gray-600" />
                )}
                <span className={weightTrend === 'up' ? 'text-green-600' : weightTrend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                  {Math.abs(weightChange)}kg
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Température */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Température
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTemperatureValue(currentTemperature) ?? '—'}°C
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Moy: {formatTemperatureValue(avgTemperature) ?? '—'}°C
            </div>
            {temperatureData.length > 1 && (
              <div className="text-xs text-muted-foreground">
                Min: {formatTemperatureValue(minTemperature) ?? '—'}°C | Max:{' '}
                {formatTemperatureValue(maxTemperature) ?? '—'}°C
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultations}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Ce mois: {consultationsThisMonth}
            </div>
            {lastConsultation && (
              <div className="text-xs text-muted-foreground">
                Dernière: {new Date(lastConsultation.date).toLocaleDateString('fr-FR')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {alerts.length > 0 ? 'À traiter' : 'Aucune'}
            </div>
            {alerts.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {alerts.slice(0, 2).map((alert, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {alert.message}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertes détaillées */}
      {alerts.length > 0 && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive text-base">Alertes médicales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-destructive/5 rounded">
                  <alert.icon className={`h-4 w-4 ${
                    alert.type === 'danger' ? 'text-destructive' : 
                    alert.type === 'warning' ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`} />
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé des tendances */}
      {weightData.length > 1 || temperatureData.length > 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {weightData.length > 1 && (
                <div>
                  <h4 className="font-medium mb-2">Évolution du poids</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Poids initial:</span>
                      <span>{weightData[weightData.length - 1].weight}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Poids actuel:</span>
                      <span>{weightData[0].weight}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Évolution totale:</span>
                      <span className={weightData[0].weight > weightData[weightData.length - 1].weight ? 'text-green-600' : 'text-red-600'}>
                        {weightData[0].weight - weightData[weightData.length - 1].weight}kg
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {temperatureData.length > 1 && (
                <div>
                  <h4 className="font-medium mb-2">Évolution de la température</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Température moyenne:</span>
                      <span>{formatTemperatureValue(avgTemperature) ?? '—'}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variation:</span>
                      <span>
                        {formatTemperatureValue(maxTemperature - minTemperature) ?? '—'}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stabilité:</span>
                      <span className={maxTemperature - minTemperature < 1 ? 'text-green-600' : 'text-yellow-600'}>
                        {maxTemperature - minTemperature < 1 ? 'Stable' : 'Variable'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>Pas assez de données pour afficher les tendances</p>
            <p className="text-sm">Ajoutez plus de consultations avec poids et température</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
