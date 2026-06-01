import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthSession, useLogin, useLogout, useRefreshProfile, User } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

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
  const { data: user, isLoading, isError, refetch } = useAuthSession();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshProfileMutation = useRefreshProfile();

  // Listen for auth state changes and refetch when they occur
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refetch();
        } else if (event === 'SIGNED_OUT') {
          await refetch();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [refetch]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      await refreshProfileMutation.mutateAsync();
    } catch (error) {
      console.error('Refresh profile failed:', error);
    }
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
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
