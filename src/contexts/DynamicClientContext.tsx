import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthSession } from '../hooks/useAuth';

// ================================
// TYPE DEFINITIONS
// ================================

export interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_visit?: string;
  total_spent: number;
  is_active: boolean;
}

export interface Animal {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: 'male' | 'female' | 'unknown';
  date_of_birth?: string;
  age_years?: number;
  age_months?: number;
  weight?: number;
  color?: string;
  microchip_number?: string;
  passport_number?: string;
  insurance_number?: string;
  notes?: string;
  avatar_url?: string;
  is_sterilized: boolean;
  is_vaccinated: boolean;
  allergies?: string[];
  medical_conditions?: string[];
  behavioral_notes?: string;
  created_at: string;
  updated_at: string;
  last_visit?: string;
  is_active: boolean;
  // Client info (joined)
  client?: Client;
}

export interface Appointment {
  id: string;
  user_id: string;
  client_id: string;
  animal_id?: string;
  title: string;
  description?: string;
  appointment_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  appointment_type: 'consultation' | 'vaccination' | 'surgery' | 'emergency' | 'checkup' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  cost?: number;
  payment_status: 'pending' | 'paid' | 'partial' | 'cancelled';
  veterinarian_name?: string;
  location?: string;
  reminder_sent: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: Client;
  animal?: Animal;
}

export interface CreateClientInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string;
}

export interface CreateAnimalInput {
  client_id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: 'male' | 'female' | 'unknown';
  date_of_birth?: string;
  age_years?: number;
  age_months?: number;
  weight?: number;
  color?: string;
  microchip_number?: string;
  passport_number?: string;
  insurance_number?: string;
  notes?: string;
  is_sterilized?: boolean;
  is_vaccinated?: boolean;
  allergies?: string[];
  medical_conditions?: string[];
  behavioral_notes?: string;
}

export interface UpdateAnimalInput extends Partial<CreateAnimalInput> {
  id: string;
}

// ================================
// QUERY KEYS
// ================================

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}

export const animalKeys = {
  all: ['animals'] as const,
  lists: () => [...animalKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...animalKeys.lists(), filters] as const,
  details: () => [...animalKeys.all, 'detail'] as const,
  detail: (id: string) => [...animalKeys.details(), id] as const,
  byClient: (clientId: string) => [...animalKeys.all, 'byClient', clientId] as const,
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
}

// ================================
// HOOK DEFINITIONS
// ================================

export const useClients = (filters: Record<string, any> = {}) => {
  const { data: user } = useAuthSession();
  
  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: async (): Promise<Client[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('User profile or organization not found');
      }

      let query = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch clients: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClient = (id: string) => {
  const { data: user } = useAuthSession();
  
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: async (): Promise<Client | null> => {
      if (!user?.id || !id) {
        return null;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch client: ${error.message}`);
      }

      return data;
    },
    enabled: !!user?.id && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAnimals = (filters: Record<string, any> = {}) => {
  const { data: user } = useAuthSession();
  
  return useQuery({
    queryKey: animalKeys.list(filters),
    queryFn: async (): Promise<Animal[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('User profile or organization not found');
      }

      let query = supabase
        .from('animals')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,species.ilike.%${filters.search}%,breed.ilike.%${filters.search}%`);
      }
      
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      if (filters.species) {
        query = query.eq('species', filters.species);
      }

      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch animals: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAnimalsByClient = (clientId: string) => {
  const { data: user } = useAuthSession();
  
  return useQuery({
    queryKey: animalKeys.byClient(clientId),
    queryFn: async (): Promise<Animal[]> => {
      if (!user?.id || !clientId) {
        return [];
      }

      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch animals: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!user?.id && !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAppointments = (filters: Record<string, any> = {}) => {
  const { data: user } = useAuthSession();
  
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: async (): Promise<Appointment[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:clients(*),
          animal:animals(*)
        `)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.date_from) {
        query = query.gte('appointment_date', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('appointment_date', filters.date_to);
      }

      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch appointments: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes for appointments
  });
};

// ================================
// MUTATION HOOKS
// ================================

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthSession();

  return useMutation({
    mutationFn: async (input: CreateClientInput): Promise<Client> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create client: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthSession();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateClientInput): Promise<Client> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('clients')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update client: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.setQueryData(clientKeys.detail(data.id), data);
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthSession();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Soft delete - set is_active to false
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to delete client: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
  });
};

export const useCreateAnimal = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthSession();

  return useMutation({
    mutationFn: async (input: CreateAnimalInput): Promise<Animal> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('animals')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select(`
          *,
          client:clients(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create animal: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
  });
};

export const useUpdateAnimal = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthSession();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateAnimalInput): Promise<Animal> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('animals')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          client:clients(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update animal: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
      queryClient.setQueryData(animalKeys.detail(data.id), data);
    },
  });
};

export const useDeleteAnimal = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthSession();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Soft delete - set is_active to false
      const { error } = await supabase
        .from('animals')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to delete animal: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
  });
};

// ================================
// CONTEXT DEFINITION
// ================================

interface DynamicClientContextType {
  // Client operations
  clients: Client[];
  clientsLoading: boolean;
  clientsError: Error | null;
  createClient: ReturnType<typeof useCreateClient>['mutate'];
  updateClient: ReturnType<typeof useUpdateClient>['mutate'];
  deleteClient: ReturnType<typeof useDeleteClient>['mutate'];
  
  // Animal operations
  animals: Animal[];
  animalsLoading: boolean;
  animalsError: Error | null;
  createAnimal: ReturnType<typeof useCreateAnimal>['mutate'];
  updateAnimal: ReturnType<typeof useUpdateAnimal>['mutate'];
  deleteAnimal: ReturnType<typeof useDeleteAnimal>['mutate'];
  
  // Appointments
  appointments: Appointment[];
  appointmentsLoading: boolean;
  appointmentsError: Error | null;
}

const DynamicClientContext = createContext<DynamicClientContextType | undefined>(undefined);

export const DynamicClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Fetch all data
  const {
    data: clients = [],
    isLoading: clientsLoading,
    error: clientsError,
  } = useClients();

  const {
    data: animals = [],
    isLoading: animalsLoading,
    error: animalsError,
  } = useAnimals();

  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useAppointments();

  // Mutations
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  
  const createAnimalMutation = useCreateAnimal();
  const updateAnimalMutation = useUpdateAnimal();
  const deleteAnimalMutation = useDeleteAnimal();

  const value: DynamicClientContextType = {
    clients,
    clientsLoading,
    clientsError: clientsError as Error | null,
    createClient: createClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    
    animals,
    animalsLoading,
    animalsError: animalsError as Error | null,
    createAnimal: createAnimalMutation.mutate,
    updateAnimal: updateAnimalMutation.mutate,
    deleteAnimal: deleteAnimalMutation.mutate,
    
    appointments,
    appointmentsLoading,
    appointmentsError: appointmentsError as Error | null,
  };

  return (
    <DynamicClientContext.Provider value={value}>
      {children}
    </DynamicClientContext.Provider>
  );
};

export const useDynamicClientContext = () => {
  const context = useContext(DynamicClientContext);
  if (context === undefined) {
    throw new Error('useDynamicClientContext must be used within a DynamicClientProvider');
  }
  return context;
};

// ================================
// CONVENIENCE HOOKS (backward compatibility)
// ================================

export const useClientData = () => {
  const { clients, clientsLoading, clientsError } = useDynamicClientContext();
  return { clients, loading: clientsLoading, error: clientsError };
};

export const useAnimalData = () => {
  const { animals, animalsLoading, animalsError } = useDynamicClientContext();
  return { animals, loading: animalsLoading, error: animalsError };
};

export const useAppointmentData = () => {
  const { appointments, appointmentsLoading, appointmentsError } = useDynamicClientContext();
  return { appointments, loading: appointmentsLoading, error: appointmentsError };
};
