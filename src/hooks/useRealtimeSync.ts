// @ts-nocheck
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthSession } from './useAuth';

/**
 * Hook to sync data in real-time across all users in the same organization
 * Listens to INSERT, UPDATE, DELETE events and invalidates React Query cache
 */
export const useRealtimeSync = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthSession();

  // Clear all cache when user changes (logout or switch account)
  useEffect(() => {
    if (!user?.id) {
      // User logged out - clear ALL cached data
      console.log('🧹 Clearing all cached data on logout...');
      queryClient.clear();
      return;
    }

    console.log('🔄 Setting up realtime subscriptions for user:', user.id);

    // Subscribe to animals table changes
    const animalsChannel = supabase
      .channel('animals-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'animals',
        },
        (payload) => {
          console.log('🐾 Animals change detected:', payload.eventType);
          // Invalidate all animal queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['animals'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to clients table changes
    const clientsChannel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        (payload) => {
          console.log('👥 Clients change detected:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to consultations table changes
    const consultationsChannel = supabase
      .channel('consultations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations',
        },
        (payload) => {
          console.log('📋 Consultations change detected:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['consultations'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to appointments table changes
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('📅 Appointments change detected:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to prescriptions table changes
    const prescriptionsChannel = supabase
      .channel('prescriptions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prescriptions',
        },
        (payload) => {
          console.log('💊 Prescriptions change detected:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        }
      )
      .subscribe();

    // Subscribe to vaccinations table changes
    const vaccinationsChannel = supabase
      .channel('vaccinations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vaccinations',
        },
        (payload) => {
          console.log('💉 Vaccinations change detected:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
        }
      )
      .subscribe();

    // Subscribe to invoices table changes
    const invoicesChannel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
        },
        (payload) => {
          console.log('🧾 Invoices change detected:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
        }
      )
      .subscribe();

    // Subscribe to stock_items table changes
    const stockChannel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_items',
        },
        (payload) => {
          console.log('📦 Stock change detected:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['stock'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔌 Cleaning up realtime subscriptions...');
      supabase.removeChannel(animalsChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(consultationsChannel);
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(prescriptionsChannel);
      supabase.removeChannel(vaccinationsChannel);
      supabase.removeChannel(invoicesChannel);
      supabase.removeChannel(stockChannel);
    };
  }, [user?.id, queryClient]);
};