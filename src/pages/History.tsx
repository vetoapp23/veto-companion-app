// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Heart, Grid, List, Eye, Search, FileText } from 'lucide-react';
import { AppPageHeader } from '@/components/AppPageHeader';
import {
  useConsultations,
  usePrescriptions,
  useClients,
  useAnimals,
  useVaccinations,
  useAntiparasitics,
  useFarmInterventions,
} from '@/hooks/useDatabase';
import { useVisits } from '@/hooks/useVisits';
import ConsultationViewModal from '@/components/modals/ConsultationViewModal';
import { NewPrescriptionModal } from '@/components/forms/NewPrescriptionModal';
import { PrescriptionPrint } from '@/components/PrescriptionPrint';
import { InvoicePrescriptionPrint } from '@/components/InvoicePrescriptionPrint';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ListDateFilter, DEFAULT_LIST_DATE_FILTER } from '@/components/ListDateFilter';
import { matchesListDateFilter, toLocalDateKey, type ListDateFilterState } from '@/lib/dateLocal';
import { useDisplayPreference } from '@/hooks/use-display-preference';

type HistoryItemType =
  | 'consultation'
  | 'vaccination'
  | 'antiparasitic'
  | 'visit'
  | 'farm_intervention';

const TYPE_LABELS: Record<HistoryItemType, string> = {
  consultation: 'Consultation',
  vaccination: 'Vaccination',
  antiparasitic: 'Antiparasitaire',
  visit: 'Visite',
  farm_intervention: 'Intervention élevage',
};

const History = () => {
  const navigate = useNavigate();
  const { data: consultations = [] } = useConsultations();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const { data: vaccinations = [] } = useVaccinations();
  const { data: antiparasitics = [] } = useAntiparasitics();
  const { data: visits = [] } = useVisits();
  const { data: farmInterventions = [] } = useFarmInterventions();

  // Helper function to transform database prescription to old format
  const transformPrescription = (dbPrescription: any) => {
    return {
      id: dbPrescription.id,
      consultationId: dbPrescription.consultation_id,
      clientId: dbPrescription.client_id,
      clientName: `${dbPrescription.client?.first_name || ''} ${dbPrescription.client?.last_name || ''}`.trim(),
      petId: dbPrescription.animal_id,
      petName: dbPrescription.animal?.name || '',
      date: dbPrescription.prescription_date,
      prescribedBy: 'Non spécifié', // TODO: Add veterinarian name
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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPet, setFilterPet] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState<ListDateFilterState>(DEFAULT_LIST_DATE_FILTER);
  const { currentView } = useDisplayPreference("history");
  const [viewMode, setViewMode] = useState<"cards" | "table">(
    currentView === "table" ? "table" : "cards"
  );

  useEffect(() => {
    setViewMode(currentView === "table" ? "table" : "cards");
  }, [currentView]);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const clientNameById = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c: any) => {
      map.set(c.id, `${c.first_name || ''} ${c.last_name || ''}`.trim());
    });
    return map;
  }, [clients]);

  const animalById = useMemo(() => {
    const map = new Map<string, any>();
    animals.forEach((a: any) => map.set(a.id, a));
    return map;
  }, [animals]);

  const resolveAnimalClient = (animalId?: string | null, animal?: any) => {
    const a = animal || (animalId ? animalById.get(animalId) : null);
    const petName = a?.name || '—';
    const petType = a?.species || '';
    const client =
      (a?.client ? `${a.client.first_name || ''} ${a.client.last_name || ''}`.trim() : '') ||
      (a?.client_id ? clientNameById.get(a.client_id) || '' : '') ||
      '—';
    return { petName, petType, client };
  };

  // Historique unifié synchronisé avec les modules cliniques / élevage
  const medicalHistory = useMemo(() => {
    const consultationItems = consultations.map((c: any) => ({
      id: c.id,
      sourceId: c.id,
      date: toLocalDateKey(c.consultation_date),
      petName: c.animal?.name || '',
      petType: c.animal?.species || '',
      client: `${c.client?.first_name || ''} ${c.client?.last_name || ''}`.trim(),
      type: 'consultation' as HistoryItemType,
      title: c.diagnosis || c.consultation_type || 'Consultation',
      veterinarian: '—',
      details: [c.symptoms, c.treatment].filter(Boolean).join(' · ') || c.notes || '',
      cost: c.cost || 0,
      status: c.status || 'completed',
    }));

    const vaccinationItems = vaccinations.map((v: any) => {
      const { petName, petType, client } = resolveAnimalClient(v.animal_id, v.animal);
      return {
        id: `vacc-${v.id}`,
        sourceId: v.id,
        date: toLocalDateKey(v.vaccination_date),
        petName,
        petType,
        client,
        type: 'vaccination' as HistoryItemType,
        title: v.vaccine_name || 'Vaccination',
        veterinarian: v.administered_by || '—',
        details: [
          v.vaccine_type,
          v.batch_number ? `Lot ${v.batch_number}` : '',
          v.next_due_date ? `Prochain: ${toLocalDateKey(v.next_due_date)}` : '',
          v.notes,
        ].filter(Boolean).join(' · '),
        cost: 0,
        status: 'completed',
      };
    });

    const antiparasiticItems = antiparasitics.map((a: any) => {
      const { petName, petType, client } = resolveAnimalClient(a.animal_id, a.animal);
      return {
        id: `anti-${a.id}`,
        sourceId: a.id,
        date: toLocalDateKey(a.treatment_date),
        petName,
        petType,
        client,
        type: 'antiparasitic' as HistoryItemType,
        title: a.product_name || 'Antiparasitaire',
        veterinarian: a.administered_by || '—',
        details: [
          a.parasite_type,
          a.dosage,
          a.next_treatment_date ? `Prochain: ${toLocalDateKey(a.next_treatment_date)}` : '',
          a.notes,
        ].filter(Boolean).join(' · '),
        cost: 0,
        status: 'completed',
      };
    });

    const visitItems = visits.map((v: any) => ({
      id: `visit-${v.id}`,
      sourceId: v.id,
      date: toLocalDateKey(v.visit_date),
      petName: v.animal?.name || (v.farm?.farm_name ? `Ferme: ${v.farm.farm_name}` : '—'),
      petType: v.animal?.species || '',
      client: v.client
        ? `${v.client.first_name || ''} ${v.client.last_name || ''}`.trim()
        : '—',
      type: 'visit' as HistoryItemType,
      title: v.reason || `Visite (${v.status || 'en cours'})`,
      veterinarian: '—',
      details: [
        v.farm?.farm_name ? `Exploitation ${v.farm.farm_name}` : '',
        Array.isArray(v.services) ? `${v.services.length} prestation(s)` : '',
      ].filter(Boolean).join(' · '),
      cost: v.total_amount || 0,
      status: v.status || 'completed',
    }));

    const farmItems = farmInterventions.map((fi: any) => {
      const farm = fi.farms || fi.farm;
      const owner = farm?.clients;
      return {
        id: `farm-int-${fi.id}`,
        sourceId: fi.id,
        date: toLocalDateKey(fi.intervention_date),
        petName: farm?.farm_name || 'Exploitation',
        petType: '',
        client: owner
          ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim()
          : '—',
        type: 'farm_intervention' as HistoryItemType,
        title: fi.intervention_type || 'Intervention élevage',
        veterinarian: '—',
        details: [fi.protocol_type, fi.description, fi.diagnosis, fi.treatment]
          .filter(Boolean)
          .join(' · '),
        cost: fi.cost || 0,
        status: 'completed',
      };
    });

    return [
      ...consultationItems,
      ...vaccinationItems,
      ...antiparasiticItems,
      ...visitItems,
      ...farmItems,
    ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [
    consultations,
    vaccinations,
    antiparasitics,
    visits,
    farmInterventions,
    animalById,
    clientNameById,
  ]);

  // Historique des prescriptions dynamique
  const prescriptionHistory = prescriptions.map(p => ({
    id: p.id,
    date: p.prescription_date?.split('T')[0] || '',
    petName: p.animal?.name || '',
    client: `${p.client?.first_name || ''} ${p.client?.last_name || ''}`.trim(),
    medication: p.medications?.map(m => m.medication_name).join(', ') || '',
    dosage: p.medications?.[0]?.dosage || '',
    frequency: p.medications?.[0]?.frequency || '',
    duration: p.medications?.[0]?.duration || '',
    veterinarian: 'Non spécifié',
    status: p.status as string
  }));

  const filteredHistory = medicalHistory.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      item.petName.toLowerCase().includes(q) ||
      item.client.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      (item.details || '').toLowerCase().includes(q);
    const matchesPet = filterPet === "all" || item.petName === filterPet;
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesPeriod = matchesListDateFilter(item.date, dateFilter);
    return matchesSearch && matchesPet && matchesType && matchesPeriod;
  });

  const filteredPrescriptions = prescriptionHistory.filter(item => {
    const matchesSearch = item.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.medication.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPet = filterPet === "all" || item.petName === filterPet;
    const matchesPeriod = matchesListDateFilter(item.date, dateFilter);
    return matchesSearch && matchesPet && matchesPeriod;
  });

  const petOptions = useMemo(
    () => Array.from(new Set(medicalHistory.map((i) => i.petName).filter(Boolean))).sort(),
    [medicalHistory]
  );

  const openHistoryItem = (item: any) => {
    if (item.type === 'consultation') {
      const consultation = consultations.find((c) => c.id === item.sourceId);
      if (consultation) {
        setSelectedConsultation({
          ...consultation,
          petId: consultation.animal_id,
          clientId: consultation.client_id,
        });
        setShowConsultationModal(true);
      }
      return;
    }
    if (item.type === 'visit') {
      navigate(`/visites/${item.sourceId}`);
      return;
    }
    if (item.type === 'vaccination') {
      navigate('/vaccinations');
      return;
    }
    if (item.type === 'antiparasitic') {
      navigate('/antiparasites');
      return;
    }
    if (item.type === 'farm_intervention') {
      navigate('/farm');
    }
  };

  const statusStyles = {
    active: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    completed: 'bg-green-100 text-green-800 hover:bg-green-200',
    discontinued: 'bg-red-100 text-red-800 hover:bg-red-200'
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl">
      <AppPageHeader
        icon={FileText}
        title="Historique médical"
        description="Consultations, vaccins, antiparasitaires, visites et interventions élevage"
        actions={
          <>
            <Button
              size="sm"
              variant={viewMode === "cards" ? "default" : "outline"}
              onClick={() => setViewMode("cards")}
              className="gap-2 rounded-full"
            >
              <Grid className="h-4 w-4" />
              Cartes
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "outline"}
              onClick={() => setViewMode("table")}
              className="gap-2 rounded-full"
            >
              <List className="h-4 w-4" />
              Tableau
            </Button>
          </>
        }
      />

      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
        <Search className="h-5 w-5" />
        Rechercher
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input 
          placeholder="Rechercher par nom, animal, diagnostic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select value={filterPet} onValueChange={setFilterPet}>
          <SelectTrigger>
          <SelectValue placeholder="Filtrer par animal" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="all">Tous les animaux</SelectItem>
          {petOptions.map(petName => (
            <SelectItem key={petName} value={petName}>{petName}</SelectItem>
          ))}
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
          <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="all">Tous types</SelectItem>
          <SelectItem value="consultation">Consultations</SelectItem>
          <SelectItem value="vaccination">Vaccinations</SelectItem>
          <SelectItem value="antiparasitic">Antiparasitaires</SelectItem>
          <SelectItem value="visit">Visites</SelectItem>
          <SelectItem value="farm_intervention">Interventions élevage</SelectItem>
          </SelectContent>
        </Select>
        </div>

        <ListDateFilter
          value={dateFilter}
          onChange={setDateFilter}
          idPrefix="history-date"
        />
      </CardContent>
      </Card>

      <Tabs defaultValue="medical" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="medical" className="gap-2">
        <Calendar className="h-4 w-4" />
        Historique Médical
        </TabsTrigger>
        <TabsTrigger value="prescriptions" className="gap-2">
        <Heart className="h-4 w-4" />
        Prescriptions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="medical" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">
          Historique médical ({filteredHistory.length} entrées)
        </h3>
        </div>
        
        {viewMode === 'cards' ? (
        <div className="grid gap-6">
          {filteredHistory.map((item) => (
          <Card key={item.id} className="card-hover">
            <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">
                  {new Date(item.date).toLocaleDateString('fr-FR')}
                </span>
                </div>
                <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[item.type as HistoryItemType] || item.type}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold">{item.title}</h4>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {item.petName}
                </span>
                <span>Client: {item.client}</span>
                {item.veterinarian && item.veterinarian !== '—' && (
                  <span>Vétérinaire: {item.veterinarian}</span>
                )}
                </div>
              </div>
              
              {item.details && (
                <p className="text-sm text-muted-foreground">
                {item.details}
                </p>
              )}
              
              {item.cost > 0 && (
                <div className="text-sm">
                <span className="font-medium">Coût: {item.cost} MAD</span>
                </div>
              )}
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => openHistoryItem(item)}>
                <Eye className="h-4 w-4" />
              </Button>
              </div>
            </div>
            </CardContent>
          </Card>
          ))}
        </div>
        ) : (
        <Card>
          <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
            <thead className="border-b">
              <tr className="text-left">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Titre</th>
              <th className="p-4 font-medium">Animal</th>
              <th className="p-4 font-medium">Client</th>
              <th className="p-4 font-medium">Vétérinaire</th>
              <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
              <tr key={item.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                {new Date(item.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="p-4">
                <Badge variant="outline" className="text-xs">
                  {TYPE_LABELS[item.type as HistoryItemType] || item.type}
                </Badge>
                </td>
                <td className="p-4">
                <div className="font-medium">{item.title}</div>
                {item.details && (
                  <div className="text-sm text-muted-foreground">{item.details}</div>
                )}
                </td>
                <td className="p-4">{item.petName}</td>
                <td className="p-4">{item.client}</td>
                <td className="p-4">{item.veterinarian}</td>
                <td className="p-4">
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline" onClick={() => openHistoryItem(item)}>
                  <Eye className="h-4 w-4" />
                  </Button>
                </div>
                </td>
              </tr>
              ))}
            </tbody>
            </table>
          </div>
          </CardContent>
        </Card>
        )}
      </TabsContent>

      <TabsContent value="prescriptions" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">
          Historique des prescriptions ({filteredPrescriptions.length} entrées)
        </h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
          size="sm" 
          variant={viewMode === 'cards' ? 'default' : 'outline'} 
          onClick={() => setViewMode('cards')}
          className="gap-2 flex-1 sm:flex-none"
          >
          <Grid className="h-4 w-4" />
          Cartes
          </Button>
          <Button 
          size="sm" 
          variant={viewMode === 'table' ? 'default' : 'outline'} 
          onClick={() => setViewMode('table')}
          className="gap-2 flex-1 sm:flex-none"
          >
          <List className="h-4 w-4" />
          Tableau
          </Button>
        </div>
        </div>
        
        {viewMode === 'cards' ? (
        <div className="grid gap-6">
          {filteredPrescriptions.map((prescription) => (
          <Card key={prescription.id} className="card-hover">
            <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">
                  {new Date(prescription.date).toLocaleDateString('fr-FR')}
                </span>
                </div>
                <Badge 
                variant="outline"
                className={statusStyles[prescription.status as keyof typeof statusStyles]}
                >
                {prescription.status === 'active' ? 'Actif' :
                 prescription.status === 'completed' ? 'Terminé' : 'Arrêté'}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold">{prescription.medication}</h4>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {prescription.petName}
                </span>
                <span>Client: {prescription.client}</span>
                <span>Prescrit par: {prescription.veterinarian}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                <span className="font-medium">Dosage:</span> {prescription.dosage}
                </div>
                <div>
                <span className="font-medium">Fréquence:</span> {prescription.frequency}
                </div>
                <div>
                <span className="font-medium">Durée:</span> {prescription.duration}
                </div>
              </div>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => { setSelectedPrescription(prescription); setShowNewPrescription(true); }}>
                Renouveler
              </Button>
              {(() => {
                const rawPrescription = prescriptions.find(p => p.id === prescription.id);
                if (rawPrescription) {
                return <PrescriptionPrint prescription={transformPrescription(rawPrescription)} />;
                } else {
                return <Button size="sm" variant="outline" disabled className="flex-1 sm:flex-none">Prescription indisponible</Button>;
                }
              })()}
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => {
                const pres = prescriptions.find(p => p.id === prescription.id);
                if (pres) {
                setSelectedInvoice(transformPrescription(pres));
                setShowInvoiceModal(true);
                }
              }}>
                Facture
              </Button>
              </div>
            </div>
            </CardContent>
          </Card>
          ))}
        </div>
        ) : (
        <Card>
          <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
            <thead className="border-b">
              <tr className="text-left">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Statut</th>
              <th className="p-4 font-medium">Médicament</th>
              <th className="p-4 font-medium">Animal</th>
              <th className="p-4 font-medium">Client</th>
              <th className="p-4 font-medium">Dosage</th>
              <th className="p-4 font-medium">Durée</th>
              <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((prescription) => (
              <tr key={prescription.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                {new Date(prescription.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="p-4">
                <Badge 
                  variant="outline"
                  className={statusStyles[prescription.status as keyof typeof statusStyles]}
                >
                  {prescription.status === 'active' ? 'Actif' :
                   prescription.status === 'completed' ? 'Terminé' : 'Arrêté'}
                </Badge>
                </td>
                <td className="p-4">
                <div className="font-medium">{prescription.medication}</div>
                <div className="text-sm text-muted-foreground">Prescrit par: {prescription.veterinarian}</div>
                </td>
                <td className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  {prescription.petName}
                </div>
                </td>
                <td className="p-4">{prescription.client}</td>
                <td className="p-4">
                <div className="text-sm">
                  <div>{prescription.dosage}</div>
                  <div className="text-muted-foreground">{prescription.frequency}</div>
                </div>
                </td>
                <td className="p-4">{prescription.duration}</td>
                <td className="p-4">
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedPrescription(prescription); setShowNewPrescription(true); }}>
                  Renouveler
                  </Button>
                  <PrescriptionPrint prescription={transformPrescription(prescriptions.find(p => p.id === prescription.id)!)} />
                  <Button size="sm" variant="outline" onClick={() => {
                  const pres = prescriptions.find(p => p.id === prescription.id)!;
                  setSelectedInvoice(transformPrescription(pres));
                  setShowInvoiceModal(true);
                  }}>
                  Facture
                  </Button>
                </div>
                </td>
              </tr>
              ))}
            </tbody>
            </table>
          </div>
          </CardContent>
        </Card>
        )}
      </TabsContent>
      </Tabs>

      {/* Modales */}
      <ConsultationViewModal
      consultation={selectedConsultation}
      open={showConsultationModal}
      onOpenChange={setShowConsultationModal}
      onEdit={() => { /* TODO: implement edit */ }}
      />
      {selectedPrescription?.id && (
      <NewPrescriptionModal
        open={showNewPrescription}
        onOpenChange={setShowNewPrescription}
        petId={prescriptions.find(p => p.id === selectedPrescription?.id)?.animal_id?.toString() || ""}
        consultationId={selectedPrescription.id.toString()}
      />
      )}
      {/* Invoice + Prescription Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
      <DialogContent>
        {selectedInvoice && <InvoicePrescriptionPrint prescription={selectedInvoice} />}
      </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;