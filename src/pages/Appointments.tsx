// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Heart, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Grid, List, Stethoscope } from "lucide-react";
import { AppPageHeader } from "@/components/AppPageHeader";
import { SimpleAppointmentModal } from "../components/forms/SimpleAppointmentModal";
import { useAppointments, useUpdateAppointment, useDeleteAppointment, useVaccinations, useAntiparasitics, type Appointment } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { useAnimalSpecies, useAppointmentTypes } from '@/hooks/useAppSettings';
import { UnifiedCalendar } from '@/components/UnifiedCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCreateVisit, useVisits } from "@/hooks/useVisits";
import {
  getServiceDef,
  getVisitServiceLabel,
  suggestServiceFromAppointmentType,
  resolveServiceAmount,
} from "@/lib/visitCatalog";
import { buildClinicCalendarEvents } from "@/lib/clinicCalendar";
import { toLocalDateKey, toLocalTimeKey, todayLocalKey, localDateTimeToISO, matchesListDateFilter, type ListDateFilterState } from "@/lib/dateLocal";
import type { UpdateAppointmentData } from "@/lib/database";
import { useSettings } from "@/contexts/SettingsContext";
import { ListDateFilter, DEFAULT_LIST_DATE_FILTER } from "@/components/ListDateFilter";
import { Label } from "@/components/ui/label";
import { useWriteAccess } from "@/components/RoleGuard";
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";

const statusStyles = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-orange-100 text-orange-800"
};

export default function Appointments() {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { t: ts } = useTranslation("settings");
  const { t: tm } = useTranslation("medical");
  const { bcp47 } = useAppLocale();
  const typeLabels = {
    consultation: t("appointments.types.consultation"),
    vaccination: t("appointments.types.vaccination"),
    chirurgie: t("appointments.types.chirurgie"),
    controle: t("appointments.types.controle"),
    sterilisation: t("appointments.types.sterilisation"),
    dentaire: t("appointments.types.dentaire"),
  };
  const statusLabels: Record<string, string> = {
    scheduled: tc("scheduled"),
    confirmed: tc("confirmed"),
    completed: tc("completed"),
    cancelled: tc("cancelled"),
    "no-show": tc("noShow"),
  };
  const { data: appointments = [], isLoading, error } = useAppointments();
  const { data: visits = [] } = useVisits();
  const { data: vaccinations = [] } = useVaccinations();
  const { data: antiparasitics = [] } = useAntiparasitics();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();
  const createVisit = useCreateVisit();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSettings();
  const { currentView } = useDisplayPreference('appointments');
  const { canWrite, guardWrite } = useWriteAccess("can_manage_appointments");
  
  // Dynamic settings
  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();
  const { data: appointmentTypes = [], isLoading: typesLoading } = useAppointmentTypes();
  
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [prefillTime, setPrefillTime] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [dateFilter, setDateFilter] = useState<ListDateFilterState>(DEFAULT_LIST_DATE_FILTER);
  const initialViewMode: 'list' | 'calendar' =
    currentView === 'calendar' ? 'calendar' : 'list';
  const initialDisplayMode: 'cards' | 'table' =
    currentView === 'cards' ? 'cards' : 'table';
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(initialViewMode);
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>(initialDisplayMode);

  useEffect(() => {
    if (currentView === 'calendar') {
      setViewMode('calendar');
    } else if (currentView === 'list' || currentView === 'table' || currentView === 'cards') {
      setViewMode('list');
      if (currentView === 'cards' || currentView === 'table') {
        setDisplayMode(currentView);
      }
    }
  }, [currentView]);
  
  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  
  // Inline editing state
  const [editingField, setEditingField] = useState<{ id: string; field: 'date' | 'time' | 'status' | 'reason'; } | null>(null);
  const [fieldValue, setFieldValue] = useState<string>('');

  // Helper functions for date and time formatting
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(bcp47);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(bcp47, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAppointmentDate = (appointment: Appointment) => toLocalDateKey(appointment.appointment_date);

  const getAppointmentTime = (appointment: Appointment) => toLocalTimeKey(appointment.appointment_date);
  
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
    return t("appointments.unknownClient");
  };

  const getAnimalName = (appointment: Appointment) => {
    return appointment.animal?.name || "Sans animal";
  };

  const getAnimalSpecies = (appointment: Appointment) => {
    return appointment.animal?.species || "—";
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
  const completedAppointments = appointments.filter((appointment) => appointment.status === "completed");
  const cancelledAppointments = appointments.filter((appointment) => appointment.status === "cancelled");

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
    const matchesDate = matchesListDateFilter(appointment.appointment_date, dateFilter);
    
    return matchesSearch && matchesStatus && matchesType && matchesSpecies && matchesDate;
  });

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    if (!guardWrite()) return;
    try {
      await updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        data: { status: newStatus }
      });
      toast({
        title: t("appointments.statusUpdated"),
        description: `Le rendez-vous est maintenant ${statusLabels[newStatus].toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        title: tc("error"),
        description: tc("somethingWentWrong"),
        variant: "destructive",
      });
    }
  };

  const startVisitFromAppointment = async (appointment: Appointment) => {
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      toast({
        title: t("appointments.cannotStart"),
        description: t("appointments.alreadyDoneOrCancelled"),
        variant: "destructive",
      });
      return;
    }
    try {
      const code = suggestServiceFromAppointmentType(
        appointment.appointment_type,
        appointment.notes
      );
      const def = getServiceDef(code)!;
      const visit = await createVisit.mutateAsync({
        client_id: appointment.client_id,
        animal_id: appointment.animal_id || null,
        appointment_id: appointment.id,
        reason: appointment.notes || getVisitServiceLabel(def, tm),
        visit_date: appointment.appointment_date,
        initial_service: {
          service_code: def.code,
          service_label: getVisitServiceLabel(def, tm),
          amount: resolveServiceAmount(def.code, settings.servicePrices),
        },
      });
      navigate(`/visites/${visit.id}`);
    } catch (e: any) {
      toast({
        title: t("appointments.cannotStartVisit"),
        description: e?.message || t("appointments.unexpectedError"),
        variant: "destructive",
      });
    }
  };

  const handleFieldSave = async () => {
    if (!guardWrite()) return;
    if (!editingField) return;
    const { id, field } = editingField;
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) {
      setEditingField(null);
      return;
    }
    try {
      let data: UpdateAppointmentData = {};
      if (field === "date" || field === "time") {
        const dateKey = field === "date" ? fieldValue : getAppointmentDate(appointment);
        const timeKey = field === "time" ? fieldValue : getAppointmentTime(appointment);
        if (!dateKey || !timeKey) {
          toast({ title: tc("error"), description: t("appointments.invalidDateOrTime"), variant: "destructive" });
          setEditingField(null);
          return;
        }
        data = { appointment_date: localDateTimeToISO(dateKey, timeKey) };
      } else if (field === "reason") {
        data = { notes: fieldValue };
      } else if (field === "status") {
        data = { status: fieldValue as Appointment["status"] };
      }
      await updateAppointmentMutation.mutateAsync({ id, data });
      toast({ title: t("appointments.updated"), description: t("appointments.updated") });
    } catch (error) {
      toast({ title: tc("error"), description: tc("somethingWentWrong"), variant: "destructive" });
    }
    setEditingField(null);
  };

  const handleDelete = async (appointment: Appointment) => {
    if (!guardWrite()) return;
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!guardWrite()) return;
    if (!appointmentToDelete) return;

    const animalName = getAnimalName(appointmentToDelete);
    try {
      await deleteAppointmentMutation.mutateAsync(appointmentToDelete.id);
      toast({
        title: t("appointments.deleted"),
        description: t("appointments.deletedBody"),
      });
      setShowDeleteConfirm(false);
      setAppointmentToDelete(null);
    } catch (error) {
      toast({
        title: tc("error"),
        description: tc("somethingWentWrong"),
        variant: "destructive",
      });
    }
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter((a) => toLocalDateKey(a.appointment_date) === date);
  };

  const getTodayAppointments = () => getAppointmentsForDate(todayLocalKey());

  const todayAppointments = getTodayAppointments();

  const clinicEvents = useMemo(
    () =>
      buildClinicCalendarEvents({
        appointments,
        visits,
        vaccinations,
        antiparasitics,
      }),
    [appointments, visits, vaccinations, antiparasitics]
  );

  const occupiedSlots = useMemo(
    () =>
      appointments
        .filter((a) => a.status !== "cancelled")
        .map((a) => ({
          date: toLocalDateKey(a.appointment_date),
          time: toLocalTimeKey(a.appointment_date),
        })),
    [appointments]
  );

  const openNewAppointment = (date?: string, time?: string) => {
    if (!guardWrite()) return;
    setPrefillDate(date);
    setPrefillTime(time);
    setShowNewAppointment(true);
  };

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
        title={t("appointments.title")}
        description={t("appointments.description")}
        actions={
          canWrite ? (
            <Button onClick={() => openNewAppointment()} className="gap-2 rounded-full">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("appointments.new")}</span>
              <span className="sm:hidden">{t("appointments.newShort")}</span>
            </Button>
          ) : null
        }
      />

      {/* Toggle List / Calendrier */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <div className="flex gap-2">
        <Button variant={viewMode==='list'?'default':'outline'} onClick={()=>setViewMode('list')} size="sm" className="flex-1 sm:flex-none">{t("appointments.list")}</Button>
        <Button variant={viewMode==='calendar'?'default':'outline'} onClick={()=>setViewMode('calendar')} size="sm" className="flex-1 sm:flex-none">{t("appointments.calendar")}</Button>
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
          <span className="hidden sm:inline">{ts("display.modes.cards")}</span>
        </Button>
        <Button 
          size="sm" 
          variant={displayMode === 'table' ? 'default' : 'outline'} 
          onClick={() => setDisplayMode('table')}
          className="gap-1 sm:gap-2 flex-1 sm:flex-none"
        >
          <List className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{ts("display.modes.table")}</span>
        </Button>
        </div>
      )}
      </div>
      {viewMode==='calendar' ? (
      <UnifiedCalendar
        events={clinicEvents}
        onEventClick={(event) => {
          if (event.type === "visit" && event.sourceId) {
            navigate(`/visites/${event.sourceId}`);
            return;
          }
          if (event.type === "vaccination") {
            navigate("/vaccinations");
            return;
          }
          if (event.type === "antiparasitic") {
            navigate("/antiparasites");
            return;
          }
          // RDV: stay on appointments, optionally filter by date
          if (event.date) setSelectedDate(event.date);
        }}
        onDateClick={(date) => {
          setSelectedDate(date);
        }}
        onTimeSlotClick={(date, time) => {
          openNewAppointment(date, time);
        }}
        occupiedSlots={occupiedSlots}
        showTimeSlots={true}
        title={t("appointments.clinicCalendar")}
        icon={<Calendar className="h-5 w-5" />}
      />
      ) : (
      <div className="app-kpi-grid grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <div>
          <p className="text-xs sm:text-sm text-muted-foreground">{t("appointments.kpi.today")}</p>
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
          <p className="text-xs sm:text-sm text-muted-foreground">{t("appointments.kpi.upcoming")}</p>
            <p className="text-lg sm:text-2xl font-bold">{upcomingAppointments.length}</p>
          </div>
          </div>
        </CardContent>
        </Card>
        
        <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("appointments.kpi.completed")}</p>
            <p className="text-lg sm:text-2xl font-bold">{completedAppointments.length}</p>
          </div>
          </div>
        </CardContent>
        </Card>
        
        <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          <div>
          <p className="text-xs sm:text-sm text-muted-foreground">{t("appointments.kpi.cancelled")}</p>
            <p className="text-lg sm:text-2xl font-bold">{cancelledAppointments.length}</p>
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
        {tc("filters")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-2">
          <Label>Recherche</Label>
          <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("appointments.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>{tc("status")}</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("appointments.filters.allStatuses")}</SelectItem>
            <SelectItem value="scheduled">{tc("scheduled")}</SelectItem>
            <SelectItem value="confirmed">{tc("confirmed")}</SelectItem>
            <SelectItem value="completed">{tc("completed")}</SelectItem>
            <SelectItem value="cancelled">{tc("cancelled")}</SelectItem>
            <SelectItem value="no-show">{tc("noShow")}</SelectItem>
          </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>{t("appointments.typeLabel")}</Label>
          <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("appointments.filters.allTypes")}</SelectItem>
            {appointmentTypes.map((type) => (
              <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("appointments.speciesFilter")}</Label>
          <Select value={filterSpecies} onValueChange={setFilterSpecies}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("appointments.allSpecies")}</SelectItem>
            {animalSpecies.map((species) => (
              <SelectItem key={species} value={species}>
                {species}
              </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>
        </div>

        <ListDateFilter
          value={dateFilter}
          onChange={setDateFilter}
          idPrefix="appointments-date"
        />
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
          <p>{t("appointments.empty")}</p>
          <p className="text-sm">{t("appointments.emptyHint")}</p>
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
                <span className="text-muted-foreground">{t("appointments.durationLabel")}:</span>
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
              {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                <Button
                  size="sm"
                  onClick={() => startVisitFromAppointment(appointment)}
                  disabled={createVisit.isPending}
                  className="gap-1 w-full sm:w-auto"
                >
                  <Stethoscope className="h-3 w-3" />
                  Démarrer visite
                </Button>
              )}
              {canWrite && appointment.status === 'scheduled' && (
                <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                  className="gap-1 w-full sm:w-auto"
                >
                  <CheckCircle className="h-3 w-3" />
                  {tc("confirm")}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                  className="gap-1 text-red-600 w-full sm:w-auto"
                >
                  <XCircle className="h-3 w-3" />
                  {tc("cancel")}
                </Button>
                </>
              )}
              
              {canWrite && appointment.status === 'confirmed' && (
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
              
              {canWrite && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDelete(appointment)}
                className="gap-1 text-red-600 w-full sm:w-auto"
              >
                <Trash2 className="h-3 w-3" />
                {tc("delete")}
              </Button>
              )}
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
              <th className="p-2 sm:p-4 font-medium">{t("appointments.columns.client")} / {t("appointments.columns.animal")}</th>
              <th className="p-2 sm:p-4 font-medium">{t("appointments.columns.date")}</th>
              <th className="p-2 sm:p-4 font-medium">{t("appointments.columns.type")}</th>
              <th className="p-2 sm:p-4 font-medium">{t("appointments.columns.status")}</th>
              <th className="p-2 sm:p-4 font-medium">{t("appointments.reason")}</th>
              <th className="p-2 sm:p-4 font-medium">{t("appointments.columns.actions")}</th>
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
                  className={`flex items-center gap-2 ${canWrite ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (!canWrite) return;
                    setEditingField({ id: appointment.id, field: 'date' });
                    setFieldValue(getAppointmentDate(appointment));
                  }}
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
                  className={`flex items-center gap-2 ${canWrite ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (!canWrite) return;
                    setEditingField({ id: appointment.id, field: 'time' });
                    setFieldValue(getAppointmentTime(appointment));
                  }}
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
                  className={canWrite ? 'cursor-pointer' : ''}
                  onClick={() => {
                    if (!canWrite) return;
                    setEditingField({ id: appointment.id, field: 'status' });
                    setFieldValue(appointment.status);
                  }}
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
                    <SelectItem value="scheduled">{tc("scheduled")}</SelectItem>
                    <SelectItem value="confirmed">{tc("confirmed")}</SelectItem>
                    <SelectItem value="completed">{tc("completed")}</SelectItem>
                    <SelectItem value="cancelled">{tc("cancelled")}</SelectItem>
                    <SelectItem value="no-show">{tc("noShow")}</SelectItem>
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
                  className={`max-w-xs ${canWrite ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (!canWrite) return;
                    setEditingField({ id: appointment.id, field: 'reason' });
                    setFieldValue(appointment.notes || '');
                  }}
                >
                  {editingField?.id === appointment.id && editingField.field === 'reason' ? (
                  <Input
                    value={fieldValue}
                    onChange={e => setFieldValue(e.target.value)}
                    onBlur={handleFieldSave}
                    autoFocus
                    placeholder={t("appointments.reasonPlaceholder")}
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
                  {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                    <Button
                      size="sm"
                      onClick={() => startVisitFromAppointment(appointment)}
                      disabled={createVisit.isPending}
                      title={t("appointments.startVisit")}
                    >
                      <Stethoscope className="h-3 w-3" />
                    </Button>
                  )}
                  {canWrite && appointment.status === 'scheduled' && (
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
                  
                  {canWrite && appointment.status === 'confirmed' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(appointment.id, 'completed')}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                  )}
                  
                  {canWrite && (
                  <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(appointment)}
                  className="text-red-600"
                  >
                  <Trash2 className="h-3 w-3" />
                  </Button>
                  )}
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
        onOpenChange={(open) => {
          setShowNewAppointment(open);
          if (!open) {
            setPrefillDate(undefined);
            setPrefillTime(undefined);
          }
        }}
        prefillDate={prefillDate}
        prefillTime={prefillTime}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
        <DialogTitle>{t("appointments.deleteConfirmTitle")}</DialogTitle>
        </DialogHeader>
        {appointmentToDelete && (
        <div className="space-y-4">
          <p className="text-gray-600">
          {t("appointments.deleteConfirmBody", { date: formatDate(appointmentToDelete.appointment_date) })}
          </p>
          <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
            {tc("cancel")}
          </Button>
          <Button variant="destructive" onClick={confirmDeleteAppointment}>
            {tc("delete")}
          </Button>
          </div>
        </div>
        )}
      </DialogContent>
      </Dialog>
    </div>
  );
}
