// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getAnimals,
  getAnimalsByClient,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  searchClients,
  searchAnimals,
  getClientStats,
  getAppointments,
  getAppointmentsByAnimal,
  getAppointmentsByClient,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getVaccinations,
  getVaccinationsByAnimal,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  getVaccinationProtocols,
  getVaccinationProtocolsBySpecies,
  createVaccinationProtocol,
  updateVaccinationProtocol,
  deleteVaccinationProtocol,
  getAntiparasitics,
  getAntiparasiticsByAnimal,
  createAntiparasitic,
  updateAntiparasitic,
  deleteAntiparasitic,
  getAntiparasiticProtocols,
  getAntiparasiticProtocolsBySpecies,
  createAntiparasiticProtocol,
  updateAntiparasiticProtocol,
  deleteAntiparasiticProtocol,
  getFarms,
  getFarmById,
  getFarmsByClient,
  createFarm,
  updateFarm,
  deleteFarm,
  getFarmInterventions,
  getFarmInterventionsByFarm,
  createFarmIntervention,
  updateFarmIntervention,
  deleteFarmIntervention,
  type Client,
  type Animal,
  type Appointment,
  type Consultation,
  type Vaccination,
  type VaccinationProtocol,
  type Antiparasitic,
  type AntiparasiticProtocol,
  type Farm,
  type FarmIntervention,
  type CreateClientData,
  type CreateAnimalData,
  type CreateConsultationData,
  type CreateAppointmentData,
  type CreateVaccinationData,
  type CreateAntiparasiticData,
  type CreateFarmData,
  type CreateFarmInterventionData,
  type UpdateAppointmentData
} from '../lib/database'
import {
  getCurrentUserProfile,
  updateUserProfile,
  type UserProfile
} from '../lib/supabase'
import {
  getPrescriptions,
  getPrescriptionsByAnimal,
  createPrescription,
  getStockItems,
  type Prescription,
  type CreatePrescriptionData,
  type StockItem
} from '../lib/database'

// =============================================
// QUERY KEYS
// =============================================

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: string) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  search: (query: string) => [...clientKeys.all, 'search', query] as const,
}

export const animalKeys = {
  all: ['animals'] as const,
  lists: () => [...animalKeys.all, 'list'] as const,
  list: (filters: string) => [...animalKeys.lists(), { filters }] as const,
  details: () => [...animalKeys.all, 'detail'] as const,
  detail: (id: string) => [...animalKeys.details(), id] as const,
  byClient: (clientId: string) => [...animalKeys.all, 'client', clientId] as const,
  search: (query: string) => [...animalKeys.all, 'search', query] as const,
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: string) => [...appointmentKeys.lists(), { filters }] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  byAnimal: (animalId: string) => [...appointmentKeys.all, 'animal', animalId] as const,
  byClient: (clientId: string) => [...appointmentKeys.all, 'client', clientId] as const,
}

export const farmKeys = {
  all: ['farms'] as const,
  lists: () => [...farmKeys.all, 'list'] as const,
  list: (filters: string) => [...farmKeys.lists(), { filters }] as const,
  details: () => [...farmKeys.all, 'detail'] as const,
  detail: (id: string) => [...farmKeys.details(), id] as const,
  byClient: (clientId: string) => [...farmKeys.all, 'client', clientId] as const,
}

export const farmInterventionKeys = {
  all: ['farmInterventions'] as const,
  lists: () => [...farmInterventionKeys.all, 'list'] as const,
  list: (filters: string) => [...farmInterventionKeys.lists(), { filters }] as const,
  details: () => [...farmInterventionKeys.all, 'detail'] as const,
  detail: (id: string) => [...farmInterventionKeys.details(), id] as const,
  byFarm: (farmId: string) => [...farmInterventionKeys.all, 'farm', farmId] as const,
}

export const statsKeys = {
  all: ['stats'] as const,
  clients: () => [...statsKeys.all, 'clients'] as const,
}

export const userProfileKeys = {
  all: ['userProfile'] as const,
  profile: () => [...userProfileKeys.all, 'profile'] as const,
}

// =============================================
// CLIENT HOOKS
// =============================================

export const useClients = () => {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: getClients,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useClient = (id: string) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClientById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useSearchClients = (query: string) => {
  return useQuery({
    queryKey: clientKeys.search(query),
    queryFn: () => searchClients(query),
    enabled: query.length > 2,
    staleTime: 30 * 1000, // 30 seconds for search results
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createClient,
    onSuccess: (newClient) => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      
      // Add the new client to the cache
      queryClient.setQueryData(clientKeys.detail(newClient.id), newClient)
      
      // Update stats
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
      queryClient.invalidateQueries({ queryKey: ["org-counts"] })
      queryClient.invalidateQueries({ queryKey: ["plan-quota"] })
    },
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) => 
      updateClient(id, data),
    onSuccess: (updatedClient) => {
      // Update the client in the cache
      queryClient.setQueryData(clientKeys.detail(updatedClient.id), updatedClient)
      
      // Invalidate clients list to refresh
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
    },
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: clientKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: animalKeys.byClient(deletedId) })
      
      // Update stats
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
    },
  })
}

// =============================================
// ANIMAL HOOKS
// =============================================

export const useAnimals = () => {
  return useQuery({
    queryKey: animalKeys.lists(),
    queryFn: getAnimals,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAnimal = (id: string) => {
  return useQuery({
    queryKey: animalKeys.detail(id),
    queryFn: () => getAnimalById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useAnimalsByClient = (clientId: string) => {
  return useQuery({
    queryKey: animalKeys.byClient(clientId),
    queryFn: () => getAnimalsByClient(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useSearchAnimals = (query: string) => {
  return useQuery({
    queryKey: animalKeys.search(query),
    queryFn: () => searchAnimals(query),
    enabled: query.length > 2,
    staleTime: 30 * 1000, // 30 seconds for search results
  })
}

export const useCreateAnimal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAnimal,
    onSuccess: (newAnimal) => {
      // Invalidate and refetch animals list
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() })
      
      // Add the new animal to the cache
      queryClient.setQueryData(animalKeys.detail(newAnimal.id), newAnimal)
      
      // Update client's animals list
      queryClient.invalidateQueries({ 
        queryKey: animalKeys.byClient(newAnimal.client_id) 
      })
      
      // Update stats
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
      queryClient.invalidateQueries({ queryKey: ["org-counts"] })
      queryClient.invalidateQueries({ queryKey: ["plan-quota"] })
    },
  })
}

export const useUpdateAnimal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAnimalData> }) => 
      updateAnimal(id, data),
    onSuccess: (updatedAnimal) => {
      // Update the animal in the cache
      queryClient.setQueryData(animalKeys.detail(updatedAnimal.id), updatedAnimal)
      
      // Invalidate animals list to refresh
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() })
      
      // Update client's animals list
      queryClient.invalidateQueries({ 
        queryKey: animalKeys.byClient(updatedAnimal.client_id) 
      })
    },
  })
}

export const useDeleteAnimal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteAnimal,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: animalKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() })
      
      // Update stats
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
    },
  })
}

// =============================================
// CONSULTATION HOOKS
// =============================================

export const useConsultations = () => {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      try {
        // Dynamic query that adapts to the actual database schema
        const { data, error } = await supabase
          .from('consultations')
          .select(`
            id,
            animal_id,
            client_id,
            veterinarian_id,
            consultation_date,
            consultation_type,
            symptoms,
            diagnosis,
            treatment,
            notes,
            weight,
            temperature,
            heart_rate,
            respiratory_rate,
            photos,
            follow_up_date,
            follow_up_notes,
            status,
            created_at,
            updated_at,
            animal:animals(
              id,
              name,
              species,
              breed,
              color,
              sex,
              weight,
              birth_date,
              microchip_number,
              status
            ),
            client:clients(
              id,
              first_name,
              last_name,
              email,
              phone,
              mobile_phone,
              address,
              city,
              client_type
            )
          `)
          .order('consultation_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching consultations:', error);
          throw error;
        }
        
        // Return data with dynamic field mapping to ensure UI compatibility
        return (data || []).map(consultation => ({
          ...consultation,
          // Ensure backward compatibility with any missing fields
          followUp: consultation.follow_up_notes || null,
          cost: null, // This field isn't in the current schema but UI expects it
          // Fix the joined data to be objects instead of arrays
          animal: Array.isArray(consultation.animal) ? consultation.animal[0] : consultation.animal,
          client: Array.isArray(consultation.client) ? consultation.client[0] : consultation.client,
        }));
      } catch (error) {
        console.error('Failed to fetch consultations:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useConsultationsByAnimal = (animalId: string) => {
  return useQuery({
    queryKey: ['consultations', 'animal', animalId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select(`
            id,
            animal_id,
            client_id,
            veterinarian_id,
            consultation_date,
            consultation_type,
            symptoms,
            diagnosis,
            treatment,
            notes,
            weight,
            temperature,
            heart_rate,
            respiratory_rate,
            photos,
            follow_up_date,
            follow_up_notes,
            status,
            created_at,
            updated_at,
            animal:animals(
              id,
              name,
              species,
              breed,
              color,
              sex,
              weight,
              birth_date,
              microchip_number,
              status
            ),
            client:clients(
              id,
              first_name,
              last_name,
              email,
              phone,
              mobile_phone,
              address,
              city,
              client_type
            )
          `)
          .eq('animal_id', animalId)
          .order('consultation_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching consultations by animal:', error);
          throw error;
        }
        
        return (data || []).map(consultation => ({
          ...consultation,
          followUp: consultation.follow_up_notes || null,
          cost: null, // UI compatibility
          // Fix the joined data to be objects instead of arrays
          animal: Array.isArray(consultation.animal) ? consultation.animal[0] : consultation.animal,
          client: Array.isArray(consultation.client) ? consultation.client[0] : consultation.client,
        }));
      } catch (error) {
        console.error('Failed to fetch consultations by animal:', error);
        throw error;
      }
    },
    enabled: !!animalId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// Create consultation hook
export const useCreateConsultation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateConsultationData & { consultation_date?: string }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.organization_id) {
          throw new Error('User profile or organization not found');
        }

        // Dynamic data preparation that adapts to the actual schema
        const consultationData: Record<string, unknown> = {
          animal_id: data.animal_id,
          client_id: data.client_id,
          veterinarian_id: user.id,
          organization_id: profile.organization_id,
          consultation_date: data.consultation_date || new Date().toISOString(),
          consultation_type: data.consultation_type,
          symptoms: data.symptoms || null,
          diagnosis: data.diagnosis || null,
          treatment: data.treatment || null,
          notes: data.notes || null,
          weight: data.weight || null,
          temperature: data.temperature || null,
          heart_rate: data.heart_rate || null,
          respiratory_rate: data.respiratory_rate || null,
          photos: data.photos || null,
          follow_up_date: data.follow_up_date || null,
          follow_up_notes: data.follow_up_notes || null,
          status: data.status || 'completed',
        };
        if ((data as any).visit_id) {
          consultationData.visit_id = (data as any).visit_id;
        }

        const { data: consultation, error } = await supabase
          .from('consultations')
          .insert(consultationData)
          .select(`
            id,
            animal_id,
            client_id,
            veterinarian_id,
            consultation_date,
            consultation_type,
            symptoms,
            diagnosis,
            treatment,
            notes,
            weight,
            temperature,
            heart_rate,
            respiratory_rate,
            photos,
            follow_up_date,
            follow_up_notes,
            status,
            created_at,
            updated_at,
            animal:animals(
              id,
              name,
              species,
              breed,
              color,
              sex,
              weight,
              birth_date,
              microchip_number,
              status
            ),
            client:clients(
              id,
              first_name,
              last_name,
              email,
              phone,
              mobile_phone,
              address,
              city,
              client_type
            )
          `)
          .single();
        
        if (error) {
          console.error('Error creating consultation:', error);
          throw error;
        }
        
        return {
          ...consultation,
          followUp: consultation.follow_up_notes || null,
          cost: null, // UI compatibility
        };
      } catch (error) {
        console.error('Failed to create consultation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// Update consultation hook
export const useUpdateConsultation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateConsultationData> }) => {
      const { data: consultation, error } = await supabase
        .from('consultations')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          animal:animals(*),
          client:clients(*)
        `)
        .single();
      
      if (error) throw error;
      return consultation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// Delete consultation hook - Dynamic approach
export const useDeleteConsultation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // Step 1: Check for and handle related records dynamically
        const relatedTables = [
          { table: 'prescriptions', field: 'consultation_id' },
          { table: 'vaccinations', field: 'consultation_id' },
          { table: 'lab_results', field: 'consultation_id' },
          { table: 'antiparasitics', field: 'consultation_id' }
        ];
        
        for (const relation of relatedTables) {
          try {
            const { data: relatedRecords, error: checkError } = await supabase
              .from(relation.table)
              .select('id')
              .eq(relation.field, id);
              
            if (checkError) {
              console.warn(`Could not check ${relation.table}: ${checkError.message}`);
              continue;
            }
            
            if (relatedRecords && relatedRecords.length > 0) {
              
              // For prescriptions, we also need to delete prescription_medications
              if (relation.table === 'prescriptions') {
                for (const prescription of relatedRecords) {
                  const { error: medError } = await supabase
                    .from('prescription_medications')
                    .delete()
                    .eq('prescription_id', prescription.id);
                    
                  if (medError) {
                    console.warn(`Could not delete prescription medications: ${medError.message}`);
                  }
                }
              }
              
              // Delete the related records
              const { error: deleteError } = await supabase
                .from(relation.table)
                .delete()
                .eq(relation.field, id);
                
              if (deleteError) {
                console.warn(`Could not delete from ${relation.table}: ${deleteError.message}`);
              } else {
              }
            }
          } catch (relationError) {
            console.warn(`Error handling ${relation.table}:`, relationError);
            // Continue with deletion even if some relations fail
          }
        }
        
        // Step 2: Delete the main consultation record
        const { error: mainError } = await supabase
          .from('consultations')
          .delete()
          .eq('id', id);
        
        if (mainError) {
          console.error(`Database error during consultation deletion: ${mainError.message}`);
          throw new Error(`Failed to delete consultation: ${mainError.message}`);
        }
        
        // Successfully deleted consultation
        return { success: true, id };
        
      } catch (error: any) {
        console.error(`Dynamic deletion failed:`, error);
        throw new Error(`Deletion failed: ${error.message || 'Unknown error'}`);
      }
    },
    onSuccess: () => {
      // Invalidate all related queries dynamically
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      queryClient.invalidateQueries({ queryKey: ['lab-results'] });
    },
    retry: 1, // Retry once if deletion fails
  });
};

// =============================================
// VACCINATION HOOKS
// =============================================

export const useVaccinations = () => {
  return useQuery({
    queryKey: ['vaccinations'],
    queryFn: () => getVaccinations(),
  });
};

export const useVaccinationsByAnimal = (animalId: string) => {
  return useQuery({
    queryKey: ['vaccinations', 'animal', animalId],
    queryFn: () => getVaccinationsByAnimal(animalId),
    enabled: !!animalId,
  });
};

export const useCreateVaccination = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVaccination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};

export const useUpdateVaccination = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVaccinationData> }) => 
      updateVaccination(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
};

export const useDeleteVaccination = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVaccination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
};

// =============================================
// VACCINATION PROTOCOL HOOKS
// =============================================

export const useVaccinationProtocols = () => {
  return useQuery({
    queryKey: ['vaccination-protocols'],
    queryFn: () => getVaccinationProtocols(),
  });
};

export const useVaccinationProtocolsBySpecies = (species: string) => {
  return useQuery({
    queryKey: ['vaccination-protocols', 'species', species],
    queryFn: () => getVaccinationProtocolsBySpecies(species),
    enabled: !!species,
  });
};

export const useCreateVaccinationProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVaccinationProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccination-protocols'] });
    },
  });
};

export const useUpdateVaccinationProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VaccinationProtocol> }) => 
      updateVaccinationProtocol(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccination-protocols'] });
    },
  });
};

export const useDeleteVaccinationProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVaccinationProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccination-protocols'] });
    },
  });
};

// =============================================
// ANTIPARASITIC HOOKS
// =============================================

export const useAntiparasitics = () => {
  return useQuery({
    queryKey: ['antiparasitics'],
    queryFn: getAntiparasitics,
  });
};

export const useAntiparasiticsByAnimal = (animalId?: string) => {
  return useQuery({
    queryKey: ['antiparasitics', 'by-animal', animalId],
    queryFn: () => animalId ? getAntiparasiticsByAnimal(animalId) : Promise.resolve([]),
    enabled: !!animalId,
  });
};

export const useCreateAntiparasitic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAntiparasitic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antiparasitics'] });
    },
  });
};

export const useUpdateAntiparasitic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateAntiparasiticData> }) =>
      updateAntiparasitic(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antiparasitics'] });
    },
  });
};

export const useDeleteAntiparasitic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAntiparasitic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antiparasitics'] });
    },
  });
};

// Antiparasitic Protocol Hooks
export const useAntiparasiticProtocols = () => {
  return useQuery({
    queryKey: ['antiparasitic-protocols'],
    queryFn: getAntiparasiticProtocols,
  });
};

export const useAntiparasiticProtocolsBySpecies = (species?: string) => {
  return useQuery({
    queryKey: ['antiparasitic-protocols', 'by-species', species],
    queryFn: () => species ? getAntiparasiticProtocolsBySpecies(species) : Promise.resolve([]),
    enabled: !!species,
  });
};

export const useCreateAntiparasiticProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAntiparasiticProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antiparasitic-protocols'] });
    },
  });
};

export const useUpdateAntiparasiticProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<Omit<AntiparasiticProtocol, 'id' | 'created_at' | 'updated_at'>> 
    }) => updateAntiparasiticProtocol(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antiparasitic-protocols'] });
    },
  });
};

export const useDeleteAntiparasiticProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAntiparasiticProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antiparasitic-protocols'] });
    },
  });
};

// =============================================
// STATISTICS HOOKS FOR DASHBOARD
// =============================================

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [animalsResult, clientsResult, consultationsResult] = await Promise.all([
        supabase.from('animals').select('id, species, status').eq('status', 'vivant'),
        supabase.from('clients').select('id, status').eq('status', 'actif'),
        supabase.from('consultations').select('id, consultation_date').gte('consultation_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()),
      ]);

      if (animalsResult.error || clientsResult.error || consultationsResult.error) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const animalsBySpecies = animalsResult.data?.reduce((acc, animal) => {
        acc[animal.species] = (acc[animal.species] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalAnimals: animalsResult.data?.length || 0,
        totalClients: clientsResult.data?.length || 0,
        consultationsThisMonth: consultationsResult.data?.length || 0,
        animalsBySpecies: animalsBySpecies || {},
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useClientStats = () => {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: async () => {
      const [clientsResult, animalsResult] = await Promise.all([
        supabase.from('clients').select('id, status'),
        supabase.from('animals').select('id, status')
      ]);

      if (clientsResult.error || animalsResult.error) {
        throw new Error('Failed to fetch client stats');
      }

      const activeClients = clientsResult.data?.filter(c => c.status === 'actif').length || 0;
      const totalClients = clientsResult.data?.length || 0;
      const totalAnimals = animalsResult.data?.length || 0;
      const animalsByStatus = animalsResult.data?.reduce((acc, animal) => {
        acc[animal.status] = (acc[animal.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        totalClients: activeClients,
        totalAnimals,
        animalsByStatus,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =============================================
// PRESCRIPTION HOOKS
// =============================================

export const usePrescriptions = () => {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      try {
        
        const { data, error } = await supabase
          .from('prescriptions')
          .select(`
            id,
            consultation_id,
            animal_id,
            client_id,
            veterinarian_id,
            prescription_date,
            diagnosis,
            notes,
            status,
            refill_count,
            valid_until,
            created_at,
            updated_at,
            animal:animals(
              id,
              name,
              species,
              breed,
              color,
              sex,
              weight,
              birth_date,
              microchip_number,
              status
            ),
            client:clients(
              id,
              first_name,
              last_name,
              email,
              phone,
              mobile_phone,
              address,
              city,
              client_type
            ),
            medications:prescription_medications(
              id,
              prescription_id,
              stock_item_id,
              medication_name,
              dosage,
              frequency,
              duration,
              quantity,
              instructions,
              route,
              created_at
            )
          `)
          .order('prescription_date', { ascending: false });

        if (error) {
          console.error('Error fetching prescriptions:', error);
          throw error;
        }

        return (data || []).map(prescription => ({
          ...prescription,
          // Fix the joined data to be objects instead of arrays
          animal: Array.isArray(prescription.animal) ? prescription.animal[0] : prescription.animal,
          client: Array.isArray(prescription.client) ? prescription.client[0] : prescription.client,
        }));
      } catch (error) {
        console.error('Dynamic prescription fetch failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const usePrescriptionsByAnimal = (animalId: string) => {
  return useQuery({
    queryKey: ['prescriptions', 'animal', animalId],
    queryFn: async () => {
      try {
        
        const { data, error } = await supabase
          .from('prescriptions')
          .select(`
            id,
            consultation_id,
            animal_id,
            client_id,
            veterinarian_id,
            prescription_date,
            diagnosis,
            notes,
            status,
            refill_count,
            valid_until,
            created_at,
            updated_at,
            animal:animals(
              id,
              name,
              species,
              breed,
              color,
              sex,
              weight,
              birth_date,
              microchip_number,
              status
            ),
            client:clients(
              id,
              first_name,
              last_name,
              email,
              phone,
              mobile_phone,
              address,
              city,
              client_type
            ),
            medications:prescription_medications(
              id,
              prescription_id,
              stock_item_id,
              medication_name,
              dosage,
              frequency,
              duration,
              quantity,
              instructions,
              route,
              created_at
            )
          `)
          .eq('animal_id', animalId)
          .order('prescription_date', { ascending: false });

        if (error) {
          console.error('Error fetching prescriptions by animal:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Dynamic prescription fetch by animal failed:', error);
        throw error;
      }
    },
    enabled: !!animalId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prescriptionData: CreatePrescriptionData) => {
      try {
        // Creating prescription dynamically
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.organization_id) {
          throw new Error('User profile or organization not found');
        }

        // Dynamic data preparation that adapts to the actual schema
        const { medications, ...prescriptionDataWithoutMedications } = prescriptionData;

        // Prepare prescription data dynamically
        const dynamicPrescriptionData: Record<string, unknown> = {
          consultation_id: prescriptionDataWithoutMedications.consultation_id || null,
          animal_id: prescriptionDataWithoutMedications.animal_id,
          client_id: prescriptionDataWithoutMedications.client_id,
          veterinarian_id: prescriptionDataWithoutMedications.veterinarian_id || user.id,
          organization_id: profile.organization_id,
          prescription_date: prescriptionDataWithoutMedications.prescription_date || new Date().toISOString(),
          diagnosis: prescriptionDataWithoutMedications.diagnosis || null,
          notes: prescriptionDataWithoutMedications.notes || null,
          status: prescriptionDataWithoutMedications.status || 'active',
          refill_count: prescriptionDataWithoutMedications.refill_count || 0,
          valid_until: prescriptionDataWithoutMedications.valid_until || null,
        };
        // visit_id only if column exists / provided — ignore insert errors by stripping if needed
        if ((prescriptionDataWithoutMedications as any).visit_id) {
          dynamicPrescriptionData.visit_id = (prescriptionDataWithoutMedications as any).visit_id;
        }

        // Create the prescription first
        let prescriptionResult: any = null;
        let prescriptionError: any = null;
        {
          const first = await supabase
            .from('prescriptions')
            .insert(dynamicPrescriptionData)
            .select(`
            id,
            consultation_id,
            animal_id,
            client_id,
            veterinarian_id,
            prescription_date,
            diagnosis,
            notes,
            status,
            refill_count,
            valid_until,
            created_at,
            updated_at,
            animal:animals(
              id,
              name,
              species,
              breed,
              color,
              sex,
              weight,
              birth_date,
              microchip_number,
              status
            ),
            client:clients(
              id,
              first_name,
              last_name,
              email,
              phone,
              mobile_phone,
              address,
              city,
              client_type
            )
          `)
            .single();
          prescriptionResult = first.data;
          prescriptionError = first.error;

          // Retry without visit_id if column not migrated yet
          if (
            prescriptionError &&
            dynamicPrescriptionData.visit_id &&
            /visit_id|schema cache|column/i.test(prescriptionError.message || "")
          ) {
            const { visit_id: _drop, ...withoutVisit } = dynamicPrescriptionData;
            const retry = await supabase
              .from('prescriptions')
              .insert(withoutVisit)
              .select(`
            id,
            consultation_id,
            animal_id,
            client_id,
            veterinarian_id,
            prescription_date,
            diagnosis,
            notes,
            status,
            refill_count,
            valid_until,
            created_at,
            updated_at,
            animal:animals(id, name, species, breed),
            client:clients(id, first_name, last_name, email, phone)
          `)
              .single();
            prescriptionResult = retry.data;
            prescriptionError = retry.error;
          }
        }

        if (prescriptionError) {
          console.error('Error creating prescription:', prescriptionError);
          throw new Error(`Error creating prescription: ${prescriptionError.message}`);
        }

        // Then create the medications dynamically if they exist
        if (medications && medications.length > 0) {
          const medicationsWithPrescriptionId = medications.map(med => ({
            prescription_id: prescriptionResult.id,
            stock_item_id: med.stock_item_id || null,
            medication_name: med.medication_name,
            dosage: med.dosage || null,
            frequency: med.frequency || null,
            duration: med.duration || null,
            quantity: med.quantity || 1,
            instructions: med.instructions || null,
            route: med.route || null,
          }));

          const { data: medicationsResult, error: medicationsError } = await supabase
            .from('prescription_medications')
            .insert(medicationsWithPrescriptionId)
            .select();

          if (medicationsError) {
            console.error('Error creating prescription medications:', medicationsError);
            // Try to cleanup the prescription if medications failed
            await supabase.from('prescriptions').delete().eq('id', prescriptionResult.id);
            throw new Error(`Error creating prescription medications: ${medicationsError.message}`);
          }

          // Stock decrement: for each medication linked to a stock item, record an "out" movement and decrement
          for (const med of medications) {
            if (!med.stock_item_id || !med.quantity || med.quantity <= 0) continue;
            const { data: stockItem, error: stockErr } = await supabase
              .from('stock_items')
              .select('id, current_quantity, organization_id, name')
              .eq('id', med.stock_item_id)
              .single();
            if (stockErr || !stockItem) {
              throw new Error(`Stock introuvable pour ${med.medication_name}`);
            }
            const available = Number(stockItem.current_quantity || 0);
            if (available < Number(med.quantity)) {
              throw new Error(
                `Stock insuffisant pour ${med.medication_name} (disponible: ${available}, demandé: ${med.quantity})`
              );
            }

            const newQty = available - Number(med.quantity);
            const { error: updErr } = await supabase
              .from('stock_items')
              .update({ current_quantity: newQty, updated_at: new Date().toISOString() })
              .eq('id', stockItem.id);
            if (updErr) throw new Error(`Impossible de décrémenter le stock: ${updErr.message}`);

            const { error: movErr } = await supabase.from('stock_movements').insert({
              stock_item_id: stockItem.id,
              organization_id: stockItem.organization_id,
              movement_type: 'out',
              quantity: med.quantity,
              reason: 'Prescription',
              reference_id: prescriptionResult.id,
              reference_type: 'prescription',
              performed_by: user.id,
              notes: `Médicament: ${med.medication_name}`,
            });
            if (movErr) console.warn('Stock movement log failed', movErr);
          }
          // Successfully created prescription medications
        }

        // Successfully created prescription
        return {
          ...prescriptionResult,
          medications: medications || []
        };
        
      } catch (error: any) {
        console.error('Dynamic prescription creation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all related queries dynamically
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
    retry: 1,
  });
};

// =============================================
// STOCK HOOKS
// =============================================

export const useStockItems = () => {
  return useQuery({
    queryKey: ['stock-items'],
    queryFn: async () => {
      try {
        // Fetching stock items dynamically
        
        const { data, error } = await supabase
          .from('stock_items')
          .select(`
            id,
            name,
            description,
            category,
            unit,
            current_quantity,
            minimum_quantity,
            maximum_quantity,
            unit_cost,
            selling_price,
            supplier,
            batch_number,
            expiration_date,
            location,
            requires_prescription,
            active,
            created_at,
            updated_at
          `)
          .eq('active', true)
          .order('name');

        if (error) {
          console.error('Error fetching stock items:', error);
          throw error;
        }

        // Successfully fetched stock items
        return data || [];
      } catch (error) {
        console.error('Dynamic stock items fetch failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// =============================================
// USER PROFILE HOOKS
// =============================================

export const useUserProfile = () => {
  return useQuery({
    queryKey: userProfileKeys.profile(),
    queryFn: getCurrentUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateUserProfile(data),
    onSuccess: (updatedProfile) => {
      // Update the profile in the cache
      queryClient.setQueryData(userProfileKeys.profile(), updatedProfile)
      
      // Also invalidate auth session to get updated user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
    },
  })
}

// =============================================
// APPOINTMENT HOOKS
// =============================================

export const useAppointments = () => {
  return useQuery({
    queryKey: appointmentKeys.lists(),
    queryFn: getAppointments,
    staleTime: 2 * 60 * 1000, // 2 minutes for real-time-ish data
  })
}

export const useAppointmentsByAnimal = (animalId: string) => {
  return useQuery({
    queryKey: appointmentKeys.byAnimal(animalId),
    queryFn: () => getAppointmentsByAnimal(animalId),
    enabled: !!animalId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useAppointmentsByClient = (clientId: string) => {
  return useQuery({
    queryKey: appointmentKeys.byClient(clientId),
    queryFn: () => getAppointmentsByClient(clientId),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: (newAppointment) => {
      // Invalidate and refetch appointments list
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      
      // Invalidate related animal and client queries
      if (newAppointment.animal_id) {
        queryClient.invalidateQueries({ queryKey: appointmentKeys.byAnimal(newAppointment.animal_id) })
      }
      if (newAppointment.client_id) {
        queryClient.invalidateQueries({ queryKey: appointmentKeys.byClient(newAppointment.client_id) })
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(newAppointment.client_id) })
      }
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
    },
  })
}

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentData }) => 
      updateAppointment(id, data),
    onSuccess: (updatedAppointment) => {
      // Invalidate and refetch appointments list
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      // Linked visits may have had visit_date synced
      queryClient.invalidateQueries({ queryKey: ["visits"] })
      
      // Update the specific appointment in cache
      queryClient.setQueryData(appointmentKeys.lists(), (old: Appointment[] | undefined) => {
        if (!old) return []
        return old.map(appointment => 
          appointment.id === updatedAppointment.id ? updatedAppointment : appointment
        )
      })
      
      // Invalidate related queries
      if (updatedAppointment.animal_id) {
        queryClient.invalidateQueries({ queryKey: appointmentKeys.byAnimal(updatedAppointment.animal_id) })
      }
      if (updatedAppointment.client_id) {
        queryClient.invalidateQueries({ queryKey: appointmentKeys.byClient(updatedAppointment.client_id) })
      }
    },
  })
}

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: (_, deletedId) => {
      // Remove from appointments list cache
      queryClient.setQueryData(appointmentKeys.lists(), (old: Appointment[] | undefined) => {
        if (!old) return []
        return old.filter(appointment => appointment.id !== deletedId)
      })
      
      // Invalidate related queries  
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
    },
  })
}

// =============================================
// FARM HOOKS
// =============================================

export const useFarms = () => {
  return useQuery({
    queryKey: farmKeys.lists(),
    queryFn: getFarms,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useFarm = (id: string) => {
  return useQuery({
    queryKey: farmKeys.detail(id),
    queryFn: () => getFarmById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useFarmsByClient = (clientId: string) => {
  return useQuery({
    queryKey: farmKeys.byClient(clientId),
    queryFn: () => getFarmsByClient(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateFarm = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createFarm,
    onSuccess: (newFarm) => {
      queryClient.setQueryData(farmKeys.lists(), (old: Farm[] | undefined) => {
        if (!old) return [newFarm]
        return [...old, newFarm]
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() })
      queryClient.invalidateQueries({ queryKey: farmKeys.byClient(newFarm.client_id) })
    },
  })
}

export const useUpdateFarm = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFarmData> }) => 
      updateFarm(id, data),
    onSuccess: (updatedFarm) => {
      queryClient.setQueryData(farmKeys.detail(updatedFarm.id), updatedFarm)
      queryClient.setQueryData(farmKeys.lists(), (old: Farm[] | undefined) => {
        if (!old) return [updatedFarm]
        return old.map(farm => farm.id === updatedFarm.id ? updatedFarm : farm)
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() })
      queryClient.invalidateQueries({ queryKey: farmKeys.byClient(updatedFarm.client_id) })
    },
  })
}

export const useDeleteFarm = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteFarm,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(farmKeys.lists(), (old: Farm[] | undefined) => {
        if (!old) return []
        return old.filter(farm => farm.id !== deletedId)
      })
      
      // Invalidate related queries  
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() })
    },
  })
}

// =============================================
// FARM INTERVENTION HOOKS
// =============================================

export const useFarmInterventions = () => {
  return useQuery({
    queryKey: farmInterventionKeys.lists(),
    queryFn: getFarmInterventions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useFarmInterventionsByFarm = (farmId: string) => {
  return useQuery({
    queryKey: farmInterventionKeys.byFarm(farmId),
    queryFn: () => getFarmInterventionsByFarm(farmId),
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateFarmIntervention = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createFarmIntervention,
    onSuccess: (newIntervention) => {
      queryClient.setQueryData(farmInterventionKeys.lists(), (old: FarmIntervention[] | undefined) => {
        if (!old) return [newIntervention]
        return [...old, newIntervention]
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: farmInterventionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: farmInterventionKeys.byFarm(newIntervention.farm_id) })
    },
  })
}

export const useUpdateFarmIntervention = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFarmInterventionData> }) => 
      updateFarmIntervention(id, data),
    onSuccess: (updatedIntervention) => {
      queryClient.setQueryData(farmInterventionKeys.lists(), (old: FarmIntervention[] | undefined) => {
        if (!old) return [updatedIntervention]
        return old.map(intervention => intervention.id === updatedIntervention.id ? updatedIntervention : intervention)
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: farmInterventionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: farmInterventionKeys.byFarm(updatedIntervention.farm_id) })
    },
  })
}

export const useDeleteFarmIntervention = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteFarmIntervention,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(farmInterventionKeys.lists(), (old: FarmIntervention[] | undefined) => {
        if (!old) return []
        return old.filter(intervention => intervention.id !== deletedId)
      })
      
      // Invalidate related queries  
      queryClient.invalidateQueries({ queryKey: farmInterventionKeys.lists() })
    },
  })
}

// Re-export types for convenience
export type { 
  Client, 
  Animal, 
  Appointment, 
  Farm,
  FarmIntervention,
  CreateClientData, 
  CreateAnimalData, 
  CreateAppointmentData,
  CreateFarmData,
  CreateFarmInterventionData,
  UpdateAppointmentData,
  Consultation,
  Prescription,
  CreatePrescriptionData,
  StockItem
} from '../lib/database'