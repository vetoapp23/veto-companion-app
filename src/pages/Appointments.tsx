// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Heart, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Grid, List } from "lucide-react";
import { AppPageHeader } from "@/components/AppPageHeader";
import { SimpleAppointmentModal } from "../components/forms/SimpleAppointmentModal";
import { useAppointments, useUpdateAppointment, useDeleteAppointment, type Appointment } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { useAnimalSpecies, useAppointmentTypes } from '@/hooks/useAppSettings';
import { UnifiedCalendar } from '@/components/UnifiedCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";

const statusStyles = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-orange-100 text-orange-800"
};

const statusLabels = {
  scheduled: "Planifié",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
  "no-show": "Absent"
};

const typeLabels = {
  consultation: "Consultation générale",
  vaccination: "Vaccination",
  chirurgie: "Chirurgie",
  urgence: "Urgence",
  controle: "Contrôle post-opératoire",
  sterilisation: "Stérilisation",
  dentaire: "Soins dentaires"
};

export default function Appointments() {
  const { data: appointments = [], isLoading, error } = useAppointments();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();
  const { toast } = useToast();
  const { currentView } = useDisplayPreference('appointments');
  
  // Dynamic settings
  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();
  const { data: appointmentTypes = [], isLoading: typesLoading } = useAppointmentTypes();
  
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>(currentView);
  
  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  
  // Inline editing state
  const [editingField, setEditingField] = useState<{ id: string; field: 'date' | 'time' | 'status' | 'reason'; } | null>(null);
  const [fieldValue, setFieldValue] = useState<string>('');

  // Helper functions for date and time formatting
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAppointmentDate = (appointment: Appointment) => {
    return new Date(appointment.appointment_date).toISOString().split('T')[0];
  };

  const getAppointmentTime = (appointment: Appointment) => {
    const date = new Date(appointment.appointment_date);
    return date.toTimeString().slice(0, 5); // HH:MM format
  };
  
  // Date affichée pour la vue calendrier
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const prevMonth = () => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() + 1, 1));

  // Helper functions to get client and animal names
  const getClientName = (appointment: Appointment) => {
    if (appointment.client) {
      return `${appointment.client.first_name} ${appointment.client.last_name}`;
    }
    return 'Unknown Client';
  };

  const getAnimalName = (appointment: Appointment) => {
    return appointment.animal?.name || 'Unknown Animal';
  };

  const getAnimalSpecies = (appointment: Appointment) => {
    return appointment.animal?.species || 'Unknown Species';
  };

  // Calculate stats from appointments data
  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => new Date(apt.appointment_date) > now);
  };

  const getOverdueAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => 
      new Date(apt.appointment_date) < now && 
      apt.status === 'scheduled'
    );
  };

  const upcomingAppointments = getUpcomingAppointments();
  const overdueAppointments = getOverdueAppointments();

  const filteredAppointments = appointments.filter(appointment => {
    const clientName = getClientName(appointment);
    const petName = getAnimalName(appointment);
    
    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    const matchesType = filterType === "all" || appointment.appointment_type === filterType;
    const matchesSpecies = filterSpecies === "all" || getAnimalSpecies(appointment) === filterSpecies;
    
    let matchesDate = true;
    const appointmentDate = new Date(appointment.appointment_date);
    const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
    
    if (filterDate === "today") {
      matchesDate = appointmentDateStr === new Date().toISOString().split('T')[0];
    } else if (filterDate === "week") {
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow;
    } else if (filterDate === "month") {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      matchesDate = appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear;
    } else if (filterDate === "specific") {
      matchesDate = appointmentDateStr === selectedDate;
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesSpecies && matchesDate;
  });

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        data: { status: newStatus }
      });
      toast({
        title: "Statut mis à jour",
        description: `Le rendez-vous est maintenant ${statusLabels[newStatus].toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleFieldSave = async () => {
    if (!editingField) return;
    const { id, field } = editingField;
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      try {
        await updateAppointmentMutation.mutateAsync({
          id: id,
          data: { [field]: fieldValue }
        });
        toast({ title: 'Modifié', description: `${field} mis à jour`, });
      } catch (error) {
        toast({ title: 'Erreur', description: 'Impossible de mettre à jour', variant: 'destructive' });
      }
    }
    setEditingField(null);
  };

  const handleDelete = async (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    const animalName = getAnimalName(appointmentToDelete);
    try {
      await deleteAppointmentMutation.mutateAsync(appointmentToDelete.id);
      toast({
        title: "Rendez-vous supprimé",
        description: `Le rendez-vous pour ${animalName} a été supprimé.`,
      });
      setShowDeleteConfirm(false);
      setAppointmentToDelete(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(a => {
      const appointmentDate = new Date(a.appointment_date);
      return appointmentDate.toISOString().split('T')[0] === date;
    });
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return getAppointmentsForDate(today);
  };

  const todayAppointments = getTodayAppointments();

  // Calendar data based on currentDate
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const weeks: number[][] = [];
  let dayCounter = 1 - firstDay;
  while (dayCounter <= daysInMonth) {
    const week: number[] = [];
    for (let i=0;i<7;i++) {
      if (dayCounter>0 && dayCounter<=daysInMonth) week.push(dayCounter);
      else week.push(0);
      dayCounter++;
    }
    weeks.push(week);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Erreur lors du chargement des rendez-vous: {error.message}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      <AppPageHeader
        icon={Calendar}
        title="Rendez-vous"
        description="Planifiez et gérez tous vos rendez-vous vétérinaires"
        actions={
          <Button onClick={() => setShowNewAppointment(true)} className="gap-2 rounded-full">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau Rendez-vous</span>
            <span className="sm:hidden">Nouveau RDV</span>
          </Button>
        }
      />

      {/* Toggle List / Calendrier */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <div className="flex gap-2">
        <Button variant={viewMode==='list'?'default':'outline'} onClick={()=>setViewMode('list')} size="sm" className="flex-1 sm:flex-none">Liste</Button>
        <Button variant={viewMode==='calendar'?'default':'outline'} onClick={()=>setViewMode('calendar')} size="sm" className="flex-1 sm:flex-none">Calendrier</Button>
      </div>
      
      {viewMode === 'list' && (
        <div className="flex gap-2">
        <Button 
          size="sm" 
          variant={displayMode === 'cards' ? 'default' : 'outline'} 
          onClick={() => setDisplayMode('cards')}
          className="gap-1 sm:gap-2 flex-1 sm:flex-none"
        >
          <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Cartes</span>
        </Button>
        <Button 
          size="sm" 
          variant={displayMode === 'table' ? 'default' : 'outline'} 
          onClick={() => setDisplayMode('table')}
          className="gap-1 sm:gap-2 flex-1 sm:flex-none"
        >
          <List className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Tableau</span>
        </Button>
        </div>
      )}
      </div>
      {viewMode==='calendar' ? (
      <UnifiedCalendar
        events={appointments.map(appointment => ({
        id: parseInt(appointment.id),
        type: 'appointment' as const,
        title: `${getClientName(appointment)} - ${getAnimalName(appointment)}`,
        time: getAppointmentTime(appointment),
        date: getAppointmentDate(appointment),
        status: appointment.status,
        clientName: getClientName(appointment),
        petName: getAnimalName(appointment),
        }))}
        onEventClick={(event) => {
        // Gérer le clic sur un rendez-vous
        // Appointment clicked
        }}
        onDateClick={(date) => {
        setSelectedDate(date);
        }}
        onTimeSlotClick={(date, time) => {
        // Ouvrir le modal de création de rendez-vous avec la date et l'heure pré-remplies
        setShowNewAppointment(true);
        // Vous pouvez ajouter une logique pour pré-remplir le formulaire
        }}
        showTimeSlots={true}
        title="Calendrier des Rendez-vous"
        icon={<Calendar className="h-5 w-5" />}
      />
      ) : (
      <div className="app-kpi-grid grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Aujourd'hui</p>
            <p className="text-lg sm:text-2xl font-bold">{todayAppointments.length}</p>
          </div>
          </div>
        </CardContent>
        </Card>
        
        <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">À venir</p>
            <p className="text-lg sm:text-2xl font-bold">{upcomingAppointments.length}</p>
          </div>
          </div>
        </CardContent>
        </Card>
        
        <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">En retard</p>
            <p className="text-lg sm:text-2xl font-bold">{overdueAppointments.length}</p>
          </div>
          </div>
        </CardContent>
        </Card>
        
        <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
            <p className="text-lg sm:text-2xl font-bold">{appointments.length}</p>
          </div>
          </div>
        </CardContent>
        </Card>
      </div>
      )}

      {/* Filtres */}
      <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
        <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
        Filtres et Recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-2">
          <Label>Recherche</Label>
          <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Client, animal, motif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="scheduled">Planifié</SelectItem>
            <SelectItem value="confirmed">Confirmé</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
            <SelectItem value="no-show">Absent</SelectItem>
          </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {appointmentTypes.map((type) => (
              <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Espèce</Label>
          <Select value={filterSpecies} onValueChange={setFilterSpecies}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes espèces</SelectItem>
            {animalSpecies.map((species) => (
              <SelectItem key={species} value={species}>
                {species}
              </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Période</Label>
          <Select value={filterDate} onValueChange={setFilterDate}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les dates</SelectItem>
            <SelectItem value="today">Ce jour</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="specific">Date spécifique</SelectItem>
          </SelectContent>
          </Select>
        </div>
        
        {filterDate === "specific" && (
          <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          </div>
        )}
        </div>
      </CardContent>
      </Card>

      {/* Liste des rendez-vous */}
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
        Rendez-vous ({filteredAppointments.length})
        </h2>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>Aucun rendez-vous trouvé</p>
          <p className="text-sm">Commencez par créer votre premier rendez-vous</p>
        </CardContent>
        </Card>
      ) : displayMode === 'cards' ? (
        <div className="space-y-4">
        {filteredAppointments
          .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
          .map((appointment) => (
          <Card key={appointment.id} className="card-hover">
            <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{getClientName(appointment)}</span>
                </div>
                <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{getAnimalName(appointment)}</span>
                </div>
                <Badge className={statusStyles[appointment.status]}>
                {statusLabels[appointment.status]}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(appointment.appointment_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(appointment.appointment_date)}</span>
                </div>
                <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-1">{typeLabels[appointment.appointment_type as keyof typeof typeLabels] || appointment.appointment_type}</span>
                </div>
                <div>
                <span className="text-muted-foreground">Durée:</span>
                <span className="ml-1">{appointment.duration_minutes || 30} min</span>
                </div>
              </div>
              
              {appointment.notes && (
                <div>
                <span className="text-sm text-muted-foreground">Motif:</span>
                <p className="text-sm mt-1">{appointment.notes}</p>
                </div>
              )}
              
              {appointment.notes && (
                <div>
                <span className="text-sm text-muted-foreground">Notes:</span>
                <p className="text-sm mt-1 text-muted-foreground">{appointment.notes}</p>
                </div>
              )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:ml-4">
              {appointment.status === 'scheduled' && (
                <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                  className="gap-1 w-full sm:w-auto"
                >
                  <CheckCircle className="h-3 w-3" />
                  Confirmer
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                  className="gap-1 text-red-600 w-full sm:w-auto"
                >
                  <XCircle className="h-3 w-3" />
                  Annuler
                </Button>
                </>
              )}
              
              {appointment.status === 'confirmed' && (
                <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStatusChange(appointment.id, 'completed')}
                className="gap-1 w-full sm:w-auto"
                >
                <CheckCircle className="h-3 w-3" />
                Terminer
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDelete(appointment)}
                className="gap-1 text-red-600 w-full sm:w-auto"
              >
                <Trash2 className="h-3 w-3" />
                Supprimer
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
          <table className="w-full">
            <thead className="border-b">
            <tr className="text-left">
              <th className="p-2 sm:p-4 font-medium">Client / Animal</th>
              <th className="p-2 sm:p-4 font-medium">Date & Heure</th>
              <th className="p-2 sm:p-4 font-medium">Type</th>
              <th className="p-2 sm:p-4 font-medium">Statut</th>
              <th className="p-2 sm:p-4 font-medium">Motif</th>
              <th className="p-2 sm:p-4 font-medium">Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredAppointments
              .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
              .map((appointment) => (
              <tr key={appointment.id} className="border-b hover:bg-muted/50">
                <td className="p-2 sm:p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{getClientName(appointment)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{getAnimalName(appointment)}</span>
                  </div>
                </div>
                </td>
                <td className="p-2 sm:p-4">
                <div className="space-y-1">
                  <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => { setEditingField({ id: appointment.id, field: 'date' }); setFieldValue(getAppointmentDate(appointment)); }}
                  >
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {editingField?.id === appointment.id && editingField.field === 'date' ? (
                    <Input
                    type="date"
                    value={fieldValue}
                    onChange={e => setFieldValue(e.target.value)}
                    onBlur={handleFieldSave}
                    autoFocus
                    className="w-32"
                    />
                  ) : (
                    <span>{formatDate(appointment.appointment_date)}</span>
                  )}
                  </div>
                  <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => { setEditingField({ id: appointment.id, field: 'time' }); setFieldValue(getAppointmentTime(appointment)); }}
                  >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {editingField?.id === appointment.id && editingField.field === 'time' ? (
                    <Input
                    type="time"
                    value={fieldValue}
                    onChange={e => setFieldValue(e.target.value)}
                    onBlur={handleFieldSave}
                    autoFocus
                    className="w-24"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{formatTime(appointment.appointment_date)}</span>
                  )}
                  </div>
                </div>
                </td>
                <td className="p-2 sm:p-4">
                <div>
                  <div className="font-medium">{typeLabels[appointment.appointment_type as keyof typeof typeLabels] || appointment.appointment_type}</div>
                  <div className="text-sm text-muted-foreground">{appointment.duration_minutes || 30} min</div>
                </div>
                </td>
                <td className="p-2 sm:p-4">
                <div 
                  className="cursor-pointer"
                  onClick={() => { setEditingField({ id: appointment.id, field: 'status' }); setFieldValue(appointment.status); }}
                >
                  {editingField?.id === appointment.id && editingField.field === 'status' ? (
                  <Select
                    value={fieldValue}
                    onValueChange={value => {
                    setFieldValue(value);
                    handleStatusChange(appointment.id, value as Appointment['status']);
                    setEditingField(null);
                    }}
                  >
                    <SelectTrigger className="w-32">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="scheduled">Planifié</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                    <SelectItem value="no-show">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                  ) : (
                  <Badge className={statusStyles[appointment.status]}>
                    {statusLabels[appointment.status]}
                  </Badge>
                  )}
                </div>
                </td>
                <td className="p-2 sm:p-4">
                <div 
                  className="max-w-xs cursor-pointer"
                  onClick={() => { setEditingField({ id: appointment.id, field: 'reason' }); setFieldValue(appointment.notes || ''); }}
                >
                  {editingField?.id === appointment.id && editingField.field === 'reason' ? (
                  <Input
                    value={fieldValue}
                    onChange={e => setFieldValue(e.target.value)}
                    onBlur={handleFieldSave}
                    autoFocus
                    placeholder="Motif du rendez-vous"
                  />
                  ) : (
                  <>
                    {appointment.notes && (
                    <div className="text-sm">{appointment.notes}</div>
                    )}
                    {appointment.notes && (
                    <div className="text-xs text-muted-foreground mt-1">{appointment.notes}</div>
                    )}
                  </>
                  )}
                </div>
                </td>
                <td className="p-2 sm:p-4">
                <div className="flex gap-1">
                  {appointment.status === 'scheduled' && (
                  <>
                    <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                    >
                    <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                    className="text-red-600"
                    >
                    <XCircle className="h-3 w-3" />
                    </Button>
                  </>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(appointment.id, 'completed')}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                  )}
                  
                  <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(appointment)}
                  className="text-red-600"
                  >
                  <Trash2 className="h-3 w-3" />
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
      </div>

      <SimpleAppointmentModal
      open={showNewAppointment}
      onOpenChange={setShowNewAppointment}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        </DialogHeader>
        {appointmentToDelete && (
        <div className="space-y-4">
          <p className="text-gray-600">
          Êtes-vous sûr de vouloir supprimer le rendez-vous pour <strong>{getAnimalName(appointmentToDelete)}</strong> ?
          </p>
          <p className="text-sm text-red-600">
          Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={confirmDeleteAppointment}>
            Supprimer
          </Button>
          </div>
        </div>
        )}
      </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant Label pour éviter l'erreur
const Label = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <label className="text-sm font-medium" {...props}>{children}</label>
);