// @ts-nocheck
import React from 'react';
import { ClientProvider, useClients } from '@/contexts/ClientContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const SimpleTestContent: React.FC = () => {
  const { 
    clients, 
    consultations, 
    vaccinations, 
    antiparasitics, 
    appointments,
    addConsultation,
    addVaccination,
    addAntiparasitic,
    updateClientStats
  } = useClients();

  const handleAddTestConsultation = () => {
    if (clients.length > 0) {
      const client = clients[0];
      const pet = client.pets[0];
      
      if (pet) {
        addConsultation({
          clientId: client.id,
          clientName: client.name,
          petId: pet.id,
          petName: pet.name,
          date: new Date().toISOString().split('T')[0],
          symptoms: 'Test consultation',
          diagnosis: 'Test diagnosis',
          treatment: 'Test treatment',
          cost: '50',
          notes: 'Test consultation for stats update',
          photos: []
        });
      }
    }
  };

  const handleAddTestVaccination = () => {
    if (clients.length > 0) {
      const client = clients[0];
      const pet = client.pets[0];
      
      if (pet) {
        addVaccination({
          clientId: client.id,
          clientName: client.name,
          petId: pet.id,
          petName: pet.name,
          vaccineName: 'Test Vaccine',
          vaccineType: 'Test Type',
          dateGiven: new Date().toISOString().split('T')[0],
          nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          veterinarian: 'Dr. Test',
          cost: '30',
          notes: 'Test vaccination for stats update',
          status: 'completed'
        });
      }
    }
  };

  const handleAddTestAntiparasitic = () => {
    if (clients.length > 0) {
      const client = clients[0];
      const pet = client.pets[0];
      
      if (pet) {
        addAntiparasitic({
          clientId: client.id,
          clientName: client.name,
          petId: pet.id,
          petName: pet.name,
          productName: 'Test Product',
          productType: 'Test Type',
          dateGiven: new Date().toISOString().split('T')[0],
          nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          targetParasites: 'Test Parasites',
          veterinarian: 'Dr. Test',
          cost: '25',
          notes: 'Test antiparasitic for stats update',
          status: 'completed'
        });
      }
    }
  };

  const handleUpdateStats = () => {
    if (clients.length > 0) {
      clients.forEach(client => {
        updateClientStats(client.id);
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <h2 className="text-2xl font-bold">Test Simple des Statistiques</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions de Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleAddTestConsultation} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Consultation Test
            </Button>
            <Button onClick={handleAddTestVaccination} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Vaccination Test
            </Button>
            <Button onClick={handleAddTestAntiparasitic} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Antiparasite Test
            </Button>
            <Button onClick={handleUpdateStats} variant="outline" className="w-full">
              Mettre à jour Stats
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques Globales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Clients:</strong> {clients.length}</p>
            <p><strong>Consultations:</strong> {consultations.length}</p>
            <p><strong>Vaccinations:</strong> {vaccinations.length}</p>
            <p><strong>Antiparasites:</strong> {antiparasitics.length}</p>
            <p><strong>Rendez-vous:</strong> {appointments.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Détails des Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.map(client => (
              <div key={client.id} className="border-b pb-2">
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-600">
                  Total visites: {client.totalVisits} | 
                  Dernière visite: {new Date(client.lastVisit).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SimpleTest = () => {
  return (
    <ClientProvider>
      <SimpleTestContent />
    </ClientProvider>
  );
};

export default SimpleTest;
