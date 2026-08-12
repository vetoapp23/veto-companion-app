import React, { createContext, useContext, useEffect, ReactNode, useRef, useState } from 'react';
import { useAuthSession, useLogin, useLogout, useRefreshProfile, User } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '../hooks/useAuth';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading: queryLoading, error } = useAuthSession();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshProfileMutation = useRefreshProfile();
  const queryClient = useQueryClient();
  
  // Track initialization state to prevent infinite loading
  const [isInitialized, setIsInitialized] = useState(false);
  const authStateSetup = useRef(false);
  const previousUserId = useRef<string | null>(null);

  // Set up realtime sync only when user is authenticated
  useRealtimeSync();

  // Clear cache when user changes (switching accounts)
  useEffect(() => {
    const currentUserId = user?.id || null;
    
    // If user ID changed (switched accounts), clear all cache
    if (previousUserId.current !== null && previousUserId.current !== currentUserId) {
      console.log('👤 User changed, clearing all cached data...');
      queryClient.clear();
    }
    
    previousUserId.current = currentUserId;
  }, [user?.id, queryClient]);

  useEffect(() => {
    if (authStateSetup.current) return;
    authStateSetup.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔔 Auth state change:', event, 'Session:', !!session);
        
        // Handle auth state changes more precisely
        if (event === 'SIGNED_OUT') {
          console.log('🔓 User signed out, clearing all cache...');
          queryClient.clear();
          queryClient.setQueryData(authKeys.session(), null);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('🔐 User signed in — refreshing session query');
          // Email confirmation / OAuth land here without going through loginMutation
          queryClient.invalidateQueries({ queryKey: authKeys.session() });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed, invalidating query');
          // Invalidate on token refresh to get updated data
          queryClient.invalidateQueries({ queryKey: authKeys.session() });
        }
        
        // Mark as initialized after first auth event
        if (!isInitialized) {
          console.log('✅ Auth initialized');
          setIsInitialized(true);
        }
      }
    );

    // Set timeout fallback for initial load
    const initTimeout = setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 2000); // 2 second fallback

    return () => {
      subscription.unsubscribe();
      clearTimeout(initTimeout);
      authStateSetup.current = false;
    };
  }, [queryClient, isInitialized]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
      // Clear ALL cached data on logout to prevent data leakage between accounts
      console.log('🧹 Clearing all cached data on logout...');
      queryClient.clear();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if mutation fails
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.clear();
    }
    try {
      const { clearDemoReadOnlySession } = await import("@/lib/demoMode");
      const { DEMO_TOUR_STORAGE_KEY } = await import("@/lib/demoTour/types");
      clearDemoReadOnlySession();
      sessionStorage.removeItem(DEMO_TOUR_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const refreshProfile = async (): Promise<void> => {
    await refreshProfileMutation.mutateAsync();
  };

  // Simplified loading state - just use query loading directly
  // If we have user data, we're not loading (even if query is refetching in background)
  const isActuallyLoading = queryLoading && !user;

  // Log auth state changes (only when they change)
  useEffect(() => {
    console.log('🔍 AuthContext state:', { 
      isInitialized, 
      queryLoading, 
      hasError: !!error, 
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      isActuallyLoading,
      isAuthenticated: !!user
    });
  }, [isInitialized, queryLoading, error, user, isActuallyLoading]);

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated: !!user, // Simplified - just check if user exists
    isLoading: isActuallyLoading, // Removed mutationLoading
    login,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
