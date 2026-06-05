export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          birth_date: string | null
          breed: string | null
          client_id: string
          color: string | null
          created_at: string
          death_cause: string | null
          death_date: string | null
          height: number | null
          id: string
          microchip_number: string | null
          name: string
          notes: string | null
          organization_id: string | null
          photo_url: string | null
          sex: string | null
          species: string
          status: string
          sterilization_date: string | null
          sterilized: boolean
          tattoo_number: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          client_id: string
          color?: string | null
          created_at?: string
          death_cause?: string | null
          death_date?: string | null
          height?: number | null
          id?: string
          microchip_number?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          photo_url?: string | null
          sex?: string | null
          species: string
          status?: string
          sterilization_date?: string | null
          sterilized?: boolean
          tattoo_number?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          client_id?: string
          color?: string | null
          created_at?: string
          death_cause?: string | null
          death_date?: string | null
          height?: number | null
          id?: string
          microchip_number?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          photo_url?: string | null
          sex?: string | null
          species?: string
          status?: string
          sterilization_date?: string | null
          sterilized?: boolean
          tattoo_number?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      antiparasitic_protocols: {
        Row: {
          active: boolean
          active_ingredient: string | null
          administration_route: string | null
          age_restriction: string | null
          created_at: string
          dosage_per_kg: string | null
          frequency: string | null
          id: string
          notes: string | null
          organization_id: string | null
          parasite_type: string
          product_name: string
          species: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          active_ingredient?: string | null
          administration_route?: string | null
          age_restriction?: string | null
          created_at?: string
          dosage_per_kg?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          parasite_type: string
          product_name: string
          species: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          active_ingredient?: string | null
          administration_route?: string | null
          age_restriction?: string | null
          created_at?: string
          dosage_per_kg?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          parasite_type?: string
          product_name?: string
          species?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "antiparasitic_protocols_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      antiparasitics: {
        Row: {
          active_ingredient: string | null
          administered_by: string | null
          administration_route: string | null
          animal_id: string
          consultation_id: string | null
          created_at: string
          dosage: string | null
          effectiveness_rating: number | null
          id: string
          next_treatment_date: string | null
          notes: string | null
          organization_id: string | null
          parasite_type: string | null
          product_name: string
          treatment_date: string
          updated_at: string
        }
        Insert: {
          active_ingredient?: string | null
          administered_by?: string | null
          administration_route?: string | null
          animal_id: string
          consultation_id?: string | null
          created_at?: string
          dosage?: string | null
          effectiveness_rating?: number | null
          id?: string
          next_treatment_date?: string | null
          notes?: string | null
          organization_id?: string | null
          parasite_type?: string | null
          product_name: string
          treatment_date?: string
          updated_at?: string
        }
        Update: {
          active_ingredient?: string | null
          administered_by?: string | null
          administration_route?: string | null
          animal_id?: string
          consultation_id?: string | null
          created_at?: string
          dosage?: string | null
          effectiveness_rating?: number | null
          id?: string
          next_treatment_date?: string | null
          notes?: string | null
          organization_id?: string | null
          parasite_type?: string | null
          product_name?: string
          treatment_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "antiparasitics_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "antiparasitics_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "antiparasitics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          setting_category: string
          setting_key: string
          setting_value: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_category: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_category?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          animal_id: string | null
          appointment_date: string
          appointment_type: string
          client_id: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          organization_id: string | null
          reminder_sent: boolean
          status: string
          updated_at: string
          veterinarian_id: string | null
        }
        Insert: {
          animal_id?: string | null
          appointment_date: string
          appointment_type?: string
          client_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          organization_id?: string | null
          reminder_sent?: boolean
          status?: string
          updated_at?: string
          veterinarian_id?: string | null
        }
        Update: {
          animal_id?: string | null
          appointment_date?: string
          appointment_type?: string
          client_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          organization_id?: string | null
          reminder_sent?: boolean
          status?: string
          updated_at?: string
          veterinarian_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string
          client_type: string
          country: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          mobile_phone: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          postal_code: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string
          client_type?: string
          country?: string
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          mobile_phone?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string
          client_type?: string
          country?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          mobile_phone?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          animal_id: string
          client_id: string
          consultation_date: string
          consultation_type: string
          created_at: string
          diagnosis: string | null
          follow_up_date: string | null
          follow_up_notes: string | null
          heart_rate: number | null
          id: string
          notes: string | null
          organization_id: string | null
          photos: string[] | null
          respiratory_rate: number | null
          status: string
          symptoms: string | null
          temperature: number | null
          treatment: string | null
          updated_at: string
          veterinarian_id: string | null
          weight: number | null
        }
        Insert: {
          animal_id: string
          client_id: string
          consultation_date?: string
          consultation_type?: string
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          heart_rate?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          photos?: string[] | null
          respiratory_rate?: number | null
          status?: string
          symptoms?: string | null
          temperature?: number | null
          treatment?: string | null
          updated_at?: string
          veterinarian_id?: string | null
          weight?: number | null
        }
        Update: {
          animal_id?: string
          client_id?: string
          consultation_date?: string
          consultation_type?: string
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          heart_rate?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          photos?: string[] | null
          respiratory_rate?: number | null
          status?: string
          symptoms?: string | null
          temperature?: number | null
          treatment?: string | null
          updated_at?: string
          veterinarian_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_interventions: {
        Row: {
          animal_count: number | null
          cost: number | null
          created_at: string
          description: string | null
          diagnosis: string | null
          farm_id: string
          follow_up_date: string | null
          id: string
          intervention_date: string
          intervention_type: string
          medications_used: string[] | null
          notes: string | null
          organization_id: string | null
          treatment: string | null
          updated_at: string
          veterinarian_id: string | null
        }
        Insert: {
          animal_count?: number | null
          cost?: number | null
          created_at?: string
          description?: string | null
          diagnosis?: string | null
          farm_id: string
          follow_up_date?: string | null
          id?: string
          intervention_date?: string
          intervention_type: string
          medications_used?: string[] | null
          notes?: string | null
          organization_id?: string | null
          treatment?: string | null
          updated_at?: string
          veterinarian_id?: string | null
        }
        Update: {
          animal_count?: number | null
          cost?: number | null
          created_at?: string
          description?: string | null
          diagnosis?: string | null
          farm_id?: string
          follow_up_date?: string | null
          id?: string
          intervention_date?: string
          intervention_type?: string
          medications_used?: string[] | null
          notes?: string | null
          organization_id?: string | null
          treatment?: string | null
          updated_at?: string
          veterinarian_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_interventions_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_interventions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          active: boolean
          address: string | null
          certifications: string[] | null
          client_id: string
          created_at: string
          email: string | null
          farm_name: string
          farm_type: string | null
          herd_size: number | null
          id: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          registration_number: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          certifications?: string[] | null
          client_id: string
          created_at?: string
          email?: string | null
          farm_name: string
          farm_type?: string | null
          herd_size?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          certifications?: string[] | null
          client_id?: string
          created_at?: string
          email?: string | null
          farm_name?: string
          farm_type?: string | null
          herd_size?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          billing_cycle: string
          cancel_at_period_end: boolean
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string
          extra_users: number
          id: string
          organization_id: string
          plan_code: string
          status: string
          storage_addon_mb: number
          storage_quota_mb: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string
          extra_users?: number
          id?: string
          organization_id: string
          plan_code?: string
          status?: string
          storage_addon_mb?: number
          storage_quota_mb?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string
          extra_users?: number
          id?: string
          organization_id?: string
          plan_code?: string
          status?: string
          storage_addon_mb?: number
          storage_quota_mb?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["code"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prescription_medications: {
        Row: {
          created_at: string
          dosage: string | null
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          medication_name: string
          prescription_id: string
          quantity: number
          route: string | null
          stock_item_id: string | null
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medication_name: string
          prescription_id: string
          quantity?: number
          route?: string | null
          stock_item_id?: string | null
        }
        Update: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medication_name?: string
          prescription_id?: string
          quantity?: number
          route?: string | null
          stock_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_medications_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_medications_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          animal_id: string
          client_id: string
          consultation_id: string | null
          created_at: string
          diagnosis: string | null
          id: string
          notes: string | null
          organization_id: string | null
          prescription_date: string
          refill_count: number
          status: string
          updated_at: string
          valid_until: string | null
          veterinarian_id: string | null
        }
        Insert: {
          animal_id: string
          client_id: string
          consultation_id?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          prescription_date?: string
          refill_count?: number
          status?: string
          updated_at?: string
          valid_until?: string | null
          veterinarian_id?: string | null
        }
        Update: {
          animal_id?: string
          client_id?: string
          consultation_id?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          prescription_date?: string
          refill_count?: number
          status?: string
          updated_at?: string
          valid_until?: string | null
          veterinarian_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_items: {
        Row: {
          active: boolean
          batch_number: string | null
          category: string
          created_at: string
          current_quantity: number
          description: string | null
          expiration_date: string | null
          id: string
          location: string | null
          maximum_quantity: number | null
          minimum_quantity: number
          name: string
          organization_id: string | null
          requires_prescription: boolean
          selling_price: number | null
          supplier: string | null
          unit: string
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          batch_number?: string | null
          category: string
          created_at?: string
          current_quantity?: number
          description?: string | null
          expiration_date?: string | null
          id?: string
          location?: string | null
          maximum_quantity?: number | null
          minimum_quantity?: number
          name: string
          organization_id?: string | null
          requires_prescription?: boolean
          selling_price?: number | null
          supplier?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          batch_number?: string | null
          category?: string
          created_at?: string
          current_quantity?: number
          description?: string | null
          expiration_date?: string | null
          id?: string
          location?: string | null
          maximum_quantity?: number | null
          minimum_quantity?: number
          name?: string
          organization_id?: string | null
          requires_prescription?: boolean
          selling_price?: number | null
          supplier?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          movement_date: string
          movement_type: string
          notes: string | null
          organization_id: string | null
          performed_by: string | null
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          stock_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movement_date?: string
          movement_type: string
          notes?: string | null
          organization_id?: string | null
          performed_by?: string | null
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          stock_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movement_date?: string
          movement_type?: string
          notes?: string | null
          organization_id?: string | null
          performed_by?: string | null
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          stock_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_usage: {
        Row: {
          bytes_used: number
          category: string
          created_at: string
          files_count: number
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          bytes_used?: number
          category?: string
          created_at?: string
          files_count?: number
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          bytes_used?: number
          category?: string
          created_at?: string
          files_count?: number
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_order: number
          features: Json
          id: string
          is_active: boolean
          is_highlighted: boolean
          limits: Json
          max_animals: number | null
          max_clients: number | null
          max_users: number
          name: string
          prices: Json
          storage_mb: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          limits?: Json
          max_animals?: number | null
          max_clients?: number | null
          max_users?: number
          name: string
          prices?: Json
          storage_mb?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          limits?: Json
          max_animals?: number | null
          max_clients?: number | null
          max_users?: number
          name?: string
          prices?: Json
          storage_mb?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          experience: string | null
          full_name: string | null
          id: string
          last_login: string | null
          organization_id: string | null
          permissions: Json | null
          phone: string | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["app_role"]
          specialty: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          username: string
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          experience?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          specialty?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          username: string
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          specialty?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccination_protocols: {
        Row: {
          active: boolean
          age_recommendation: string | null
          created_at: string
          duration_days: number | null
          frequency: string | null
          id: string
          notes: string | null
          organization_id: string | null
          species: string
          updated_at: string
          vaccine_name: string
          vaccine_type: string
        }
        Insert: {
          active?: boolean
          age_recommendation?: string | null
          created_at?: string
          duration_days?: number | null
          frequency?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          species: string
          updated_at?: string
          vaccine_name: string
          vaccine_type: string
        }
        Update: {
          active?: boolean
          age_recommendation?: string | null
          created_at?: string
          duration_days?: number | null
          frequency?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          species?: string
          updated_at?: string
          vaccine_name?: string
          vaccine_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_protocols_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccinations: {
        Row: {
          administered_by: string | null
          animal_id: string
          batch_number: string | null
          consultation_id: string | null
          created_at: string
          id: string
          manufacturer: string | null
          next_due_date: string | null
          notes: string | null
          organization_id: string | null
          reminder_sent: boolean
          updated_at: string
          vaccination_date: string
          vaccine_name: string
          vaccine_type: string | null
        }
        Insert: {
          administered_by?: string | null
          animal_id: string
          batch_number?: string | null
          consultation_id?: string | null
          created_at?: string
          id?: string
          manufacturer?: string | null
          next_due_date?: string | null
          notes?: string | null
          organization_id?: string | null
          reminder_sent?: boolean
          updated_at?: string
          vaccination_date?: string
          vaccine_name: string
          vaccine_type?: string | null
        }
        Update: {
          administered_by?: string | null
          animal_id?: string
          batch_number?: string | null
          consultation_id?: string | null
          created_at?: string
          id?: string
          manufacturer?: string | null
          next_due_date?: string | null
          notes?: string | null
          organization_id?: string | null
          reminder_sent?: boolean
          updated_at?: string
          vaccination_date?: string
          vaccine_name?: string
          vaccine_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_profile: {
        Args: {
          p_clinic_address?: string
          p_clinic_name?: string
          p_email: string
          p_full_name: string
          p_organization_code?: string
          p_phone?: string
          p_role: string
          p_user_id: string
        }
        Returns: Json
      }
      get_organization_quota: { Args: never; Returns: Json }
      get_user_org: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_storage_change: {
        Args: {
          p_bytes_delta: number
          p_category: string
          p_files_delta?: number
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "assistant"
      user_status: "pending" | "approved" | "rejected" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "assistant"],
      user_status: ["pending", "approved", "rejected", "suspended"],
    },
  },
} as const
