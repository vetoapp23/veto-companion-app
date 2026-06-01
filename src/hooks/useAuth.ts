import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, UserProfile, signIn, signOut, getCurrentUserProfile, createUserProfileIfNotExists, signInWithGoogle, resetPassword } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  profile: UserProfile
  organization_id?: string | null
}

// Auth query keys - simplified and consistent
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
}

// Centralized auth session fetcher
const fetchAuthSession = async (): Promise<User | null> => {
  try {
    console.log('🔍 fetchAuthSession: Starting...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return null;
    }
    
    if (!session?.user) {
      console.log('ℹ️ No session found');
      return null;
    }

    console.log('✅ Session exists for user:', session.user.email);

    // Get or create user profile with better error handling
    let profile: UserProfile | null = null;
    
    try {
      profile = await getCurrentUserProfile();
      console.log('✅ Profile loaded from database:', profile);
    } catch (profileError: any) {
      console.error('❌ Error loading profile:', profileError);
      console.error('❌ Error details:', profileError?.message, profileError?.code);
      
      // Try to create profile if it doesn't exist
      try {
        console.log('🔄 Attempting to create profile...');
        profile = await createUserProfileIfNotExists(session.user);
        console.log('✅ Profile created:', profile);
      } catch (createError: any) {
        console.error('❌ Failed to create user profile:', createError);
        console.error('❌ Create error details:', createError?.message, createError?.code);
        // CRITICAL: Return null instead of throwing - let user try to login again
        return null;
      }
    }

    if (!profile) {
      console.log('❌ No profile found or created');
      return null;
    }

    console.log('✅ Auth session complete:', { id: session.user.id, email: session.user.email, role: profile.role });

    return {
      id: session.user.id,
      email: session.user.email!,
      profile,
      organization_id: profile.organization_id
    };
  } catch (error: any) {
    console.error('❌ Unexpected error in fetchAuthSession:', error);
    console.error('❌ Error details:', error?.message, error?.code);
    return null;
  }
}

// Optimized auth session hook - SIMPLIFIED for speed
export const useAuthSession = () => {
  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      console.log('🔄 useAuthSession: Fetching auth session...');
      const result = await fetchAuthSession();
      console.log('🔄 useAuthSession: Result:', result ? '✅ User found' : '❌ No user');
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Fail fast
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Use cached data - don't refetch after login
    refetchOnReconnect: false,
  });

  console.log('🔄 useAuthSession state:', {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    hasData: !!query.data,
    userEmail: query.data?.email
  });

  return query;
}

// Login mutation with improved error handling and caching
export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log('🔑 Starting login process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Login error:', error);
        // Map common Supabase auth errors to user-friendly messages
        const errorMessages: { [key: string]: string } = {
          'Invalid login credentials': 'Email ou mot de passe incorrect',
          'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
          'Too many requests': 'Trop de tentatives de connexion. Veuillez réessayer plus tard'
        }
        
        const userMessage = errorMessages[error.message] || error.message
        throw new Error(userMessage)
      }

      if (!data.user || !data.session) {
        throw new Error('Échec de connexion - session invalide')
      }

      console.log('✅ Auth successful, fetching user profile...');
      
      // Fetch user profile immediately after login
      const profile = await fetchAuthSession()
      
      console.log('✅ User profile fetched:', profile);
      
      return { user: data.user, profile }
    },
    onSuccess: async (data) => {
      console.log('✅ Login mutation success, setting query data...');
      // Set the auth session data immediately
      queryClient.setQueryData(authKeys.session(), data.profile)
      console.log('✅ Query data set, user should be authenticated now');
    },
    onError: (error) => {
      console.error('❌ Login mutation error:', error);
      // Clear any stale auth data on login error
      queryClient.setQueryData(authKeys.session(), null)
    }
  })
}

// Logout mutation with better cleanup
export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await signOut()
    },
    onSuccess: () => {
      // Clear auth data immediately
      queryClient.setQueryData(authKeys.session(), null)
      // Remove from cache entirely
      queryClient.removeQueries({ queryKey: authKeys.session() })
    }
  })
}

// Refresh profile mutation
export const useRefreshProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const profile = await getCurrentUserProfile()
      if (!profile) {
        throw new Error('Could not refresh profile')
      }
      return profile
    },
    onSuccess: () => {
      // Invalidate session to refetch with new profile
      queryClient.invalidateQueries({ queryKey: authKeys.session() })
    }
  })
}

// Google login mutation (via Lovable Cloud managed OAuth)
import { lovable } from '../integrations/lovable'

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: async () => {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/dashboard`,
      })
      if (result.error) throw result.error
      return result
    }
  })
}


// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await resetPassword(email)
    }
  })
}
