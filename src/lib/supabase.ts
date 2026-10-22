// @ts-nocheck
import type { User as SupabaseUser } from '@supabase/supabase-js'
// IMPORTANT: re-export the single shared Supabase client to avoid having
// two separate auth sessions (one here, one in '@/integrations/supabase/client').
// Having two clients caused RLS failures because inserts went through a client
// instance whose in-memory session was not the one updated at sign-in.
import { supabase } from '@/integrations/supabase/client'
import { appPath } from './appUrl'
export { supabase }

// Database Types
export interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string | null
  role: 'admin' | 'assistant'
  status?: 'pending' | 'approved' | 'rejected' | 'suspended'
  organization_id?: string | null
  approved_by?: string | null
  approved_at?: string | null
  rejection_reason?: string | null
  last_login?: string | null
  permissions?: Record<string, boolean>
  created_at: string
  updated_at: string
  avatar_url: string | null
  // Personal information fields
  phone?: string | null
  address?: string | null
  specialty?: string | null
  experience?: string | null
  bio?: string | null
}

export interface AuthUser {
  id: string
  email: string
  profile: UserProfile
}

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const user = await getCurrentUser()
  if (!user) {
    console.log('❌ getCurrentUserProfile: No authenticated user');
    return null;
  }

  console.log('🔍 getCurrentUserProfile: Fetching profile for user:', user.id);

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('❌ getCurrentUserProfile: Error fetching profile:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error details:', error.details);
    throw error;
  }

  if (!data) {
    console.log('ℹ️ getCurrentUserProfile: No profile row yet');
    return null;
  }

  console.log('✅ getCurrentUserProfile: Profile found:', data);
  return data;
}

export const signUp = async (email: string, password: string, username: string, fullName: string, role: 'admin' | 'assistant' = 'assistant') => {
  const { resolveAppLanguage } = await import('@/i18n')
  const locale = resolveAppLanguage()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        role,
        locale,
      }
    }
  })

  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  // Clear all Supabase-related data from localStorage
  try {
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token')

    // Clear any cookies that might exist
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  } catch (e) {
    // Ignore errors when clearing storage
    console.warn('Error clearing auth storage:', e)
  }
}

export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('No authenticated user')

  const existingProfile = await getCurrentUserProfile()
  if (!existingProfile) {
    throw new Error(
      'Profil introuvable. Terminez l’onboarding avant de modifier le profil.',
    )
  }

  const updateData = Object.entries({
    ...updates,
    updated_at: new Date().toISOString()
  }).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value
    }
    return acc
  }, {} as any)

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Profile update failed: ${error.message}`)
  }

  return data
}

/**
 * Profiles are created only via SECURITY DEFINER RPC `create_user_profile`
 * (onboarding / register). Direct INSERT is blocked by RLS.
 */
export const createUserProfileIfNotExists = async (user: SupabaseUser): Promise<UserProfile> => {
  const existingProfile = await getCurrentUserProfile();
  if (existingProfile) {
    return existingProfile;
  }
  throw new Error(
    'Profil introuvable. Terminez l’onboarding ou inscrivez-vous pour créer votre clinique.',
  );
};

export const signInWithGoogle = async (opts?: { next?: string }) => {
  const next = opts?.next || '/auth/callback'
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: appPath(next),
    },
  })

  if (error) throw error
  return data
}

export const resetPassword = async (email: string) => {
  const { resolveAppLanguage } = await import('@/i18n')
  const { withLng } = await import('./appUrl')
  const locale = resolveAppLanguage()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: withLng('/reset-password', locale),
  })

  if (error) throw error
  return data
}