import { createClient } from '@supabase/supabase-js'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pkcsgysdwnpisumshlwy.supabase.co'
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrY3NneXNkd25waXN1bXNobHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDA3MTAsImV4cCI6MjA5NTkxNjcxMH0.43sdKoNAqM7mEd_qF-8INmC0Azh-4_TbK7cSe91EppU'

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client for regular user operations (with RLS)
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

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
    .single()

  if (error) {
    console.error('❌ getCurrentUserProfile: Error fetching profile:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error details:', error.details);
    throw error;
  }
  
  console.log('✅ getCurrentUserProfile: Profile found:', data);
  return data;
}

export const signUp = async (email: string, password: string, username: string, fullName: string, role: 'admin' | 'assistant' = 'assistant') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        role
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

  // First check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, create it first
  if (!existingProfile) {
    await createUserProfileIfNotExists(user)
  }

  // Prepare update data, excluding undefined values
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
    // Try upsert as fallback
    const metadata = user.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || '';
    const username = existingProfile?.username || metadata.username || user.email!.split('@')[0];
    const role = (existingProfile?.role as 'admin' | 'assistant') || metadata.role || 'assistant';
    
    const upsertData = {
      id: user.id,
      email: user.email!,
      username: username,
      full_name: fullName,
      role: role,
      ...updateData
    }

    const { data: upsertResult, error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(upsertData)
      .select()
      .single()

    if (upsertError) {
      throw new Error(`Profile update failed: ${upsertError.message}`)
    }

    return upsertResult
  }

  return data
}

// Admin functions (require service role key for RLS bypass)
export const createUserProfileIfNotExists = async (user: SupabaseUser): Promise<UserProfile> => {
  // First try to get existing profile
  const existingProfile = await getCurrentUserProfile();
  if (existingProfile) {
    return existingProfile;
  }

  // Handle different metadata formats for different auth providers
  const metadata = user.user_metadata || {};
  
  // For Google OAuth, full_name might be in 'name' field
  // For regular signup, it's in 'full_name' field
  const fullName = metadata.full_name || metadata.name || '';
  
  // Generate username from email if not provided
  const username = metadata.username || user.email!.split('@')[0];
  
  // Default role to assistant if not provided
  const role = metadata.role || 'assistant';

  // If no profile exists, create one
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: user.id,
      email: user.email!,
      username: username,
      full_name: fullName,
      role: role
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/dashboard`
    }
  })

  if (error) throw error
  return data
}

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/reset-password`
  })

  if (error) throw error
  return data
}