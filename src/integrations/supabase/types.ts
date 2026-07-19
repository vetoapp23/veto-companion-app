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
      accounting_templates: {
        Row: {
          amount: number
          created_at: string
          description: string
          frequency: string
          id: string
          is_active: boolean
          source: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          frequency: string
          id?: string
          is_active?: boolean
          source: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          frequency?: string
          id?: string
          is_active?: boolean
          source?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_impersonation_sessions: {
        Row: {
          actor_id: string
          ended_at: string | null
          expires_at: string
          id: string
          is_active: boolean
          reason: string | null
          started_at: string
          target_organization_id: string
        }
        Insert: {
          actor_id: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          started_at?: string
          target_organization_id: string
        }
        Update: {
          actor_id?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          started_at?: string
          target_organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_impersonation_sessions_target_organization_id_fkey"
            columns: ["target_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_pedigree: {
        Row: {
          animal_id: string
          created_at: string
          father_animal_id: string | null
          father_breed: string | null
          father_name: string | null
          father_registration: string | null
          id: string
          maternal_grandfather_breed: string | null
          maternal_grandfather_name: string | null
          maternal_grandmother_breed: string | null
          maternal_grandmother_name: string | null
          mother_animal_id: string | null
          mother_breed: string | null
          mother_name: string | null
          mother_registration: string | null
          notes: string | null
          organization_id: string
          paternal_grandfather_breed: string | null
          paternal_grandfather_name: string | null
          paternal_grandmother_breed: string | null
          paternal_grandmother_name: string | null
          pedigree_origin: string | null
          registration_number: string | null
          titles: string | null
          updated_at: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          father_animal_id?: string | null
          father_breed?: string | null
          father_name?: string | null
          father_registration?: string | null
          id?: string
          maternal_grandfather_breed?: string | null
          maternal_grandfather_name?: string | null
          maternal_grandmother_breed?: string | null
          maternal_grandmother_name?: string | null
          mother_animal_id?: string | null
          mother_breed?: string | null
          mother_name?: string | null
          mother_registration?: string | null
          notes?: string | null
          organization_id: string
          paternal_grandfather_breed?: string | null
          paternal_grandfather_name?: string | null
          paternal_grandmother_breed?: string | null
          paternal_grandmother_name?: string | null
          pedigree_origin?: string | null
          registration_number?: string | null
          titles?: string | null
          updated_at?: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          father_animal_id?: string | null
          father_breed?: string | null
          father_name?: string | null
          father_registration?: string | null
          id?: string
          maternal_grandfather_breed?: string | null
          maternal_grandfather_name?: string | null
          maternal_grandmother_breed?: string | null
          maternal_grandmother_name?: string | null
          mother_animal_id?: string | null
          mother_breed?: string | null
          mother_name?: string | null
          mother_registration?: string | null
          notes?: string | null
          organization_id?: string
          paternal_grandfather_breed?: string | null
          paternal_grandfather_name?: string | null
          paternal_grandmother_breed?: string | null
          paternal_grandmother_name?: string | null
          pedigree_origin?: string | null
          registration_number?: string | null
          titles?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_pedigree_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: true
            referencedRelation: "animal_medical_summary"
            referencedColumns: ["animal_id"]
          },
          {
            foreignKeyName: "animal_pedigree_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: true
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_pedigree_father_animal_id_fkey"
            columns: ["father_animal_id"]
            isOneToOne: false
            referencedRelation: "animal_medical_summary"
            referencedColumns: ["animal_id"]
          },
          {
            foreignKeyName: "animal_pedigree_father_animal_id_fkey"
            columns: ["father_animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_pedigree_mother_animal_id_fkey"
            columns: ["mother_animal_id"]
            isOneToOne: false
            referencedRelation: "animal_medical_summary"
            referencedColumns: ["animal_id"]
          },
          {
            foreignKeyName: "animal_pedigree_mother_animal_id_fkey"
            columns: ["mother_animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_pedigree_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
          organization_id: string
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
          organization_id: string
          parasite_type?: string | null
          product_name: string
          treatment_date: string
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
          organization_id?: string
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
            referencedRelation: "animal_medical_summary"
            referencedColumns: ["animal_id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          setting_category?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string
          reminder_sent: boolean
          status: string
          updated_at: string
          veterinarian_id: string | null
        }
        Insert: {
          animal_id?: string | null
          appointment_date: string
          appointment_type: string
          client_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          organization_id: string
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
          organization_id?: string
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
            referencedRelation: "animal_medical_summary"
            referencedColumns: ["animal_id"]
          },
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
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
          cost: number | null
          created_at: string
          diagnosis: string | null
          follow_up_date: string | null
          follow_up_notes: string | null
          heart_rate: number | null
          id: string
          notes: string | null
          organization_id: string
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
          consultation_type: string
          cost?: number | null
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          heart_rate?: number | null
          id?: string
          notes?: string | null
          organization_id: string
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
          cost?: number | null
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          heart_rate?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
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
            referencedRelation: "animal_medical_summary"
            referencedColumns: ["animal_id"]
          },
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
      custom_dropdown_values: {
        Row: {
          created_at: string
          field_key: string
          id: string
          organization_id: string
          updated_at: string
          usage_count: number
          value: string
        }
        Insert: {
          created_at?: string
          field_key: string
          id?: string
          organization_id: string
          updated_at?: string
          usage_count?: number
          value: string
        }
        Update: {
          created_at?: string
          field_key?: string
          id?: string
          organization_id?: string
          updated_at?: string
          usage_count?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_dropdown_values_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          attachment_url: string | null
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          is_deductible: boolean
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          receipt_number: string | null
          status: string
          subcategory: string | null
          supplier_name: string | null
          tax_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          category: string
          created_at?: string
          description: string
          expense_date: string
          id?: string
          is_deductible?: boolean
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          status?: string
          subcategory?: string | null
          supplier_name?: string | null
          tax_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          is_deductible?: boolean
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          status?: string
          subcategory?: string | null
          supplier_name?: string | null
          tax_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_batch_health_events: {
        Row: {
          affected_count: number | null
          batch_id: string | null
          cost: number | null
          created_at: string
          dose: string | null
          event_date: string
          event_type: string
          farm_id: string
          id: string
          intervention_id: string | null
          metadata: Json
          notes: string | null
          organization_id: string
          product: string | null
          updated_at: string
        }
        Insert: {
          affected_count?: number | null
          batch_id?: string | null
          cost?: number | null
          created_at?: string
          dose?: string | null
          event_date: string
          event_type: string
          farm_id: string
          id?: string
          intervention_id?: string | null
          metadata?: Json
          notes?: string | null
          organization_id: string
          product?: string | null
          updated_at?: string
        }
        Update: {
          affected_count?: number | null
          batch_id?: string | null
          cost?: number | null
          created_at?: string
          dose?: string | null
          event_date?: string
          event_type?: string
          farm_id?: string
          id?: string
          intervention_id?: string | null
          metadata?: Json
          notes?: string | null
          organization_id?: string
          product?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_batch_health_events_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "farm_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_batch_health_events_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_batch_health_events_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "farm_interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_batch_health_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_batches: {
        Row: {
          animal_count: number
          birth_period: string | null
          category: string | null
          created_at: string
          farm_id: string
          farm_type: string | null
          id: string
          location: string | null
          metadata: Json
          name: string
          notes: string | null
          organization_id: string
          species: string | null
          status: string
          updated_at: string
        }
        Insert: {
          animal_count?: number
          birth_period?: string | null
          category?: string | null
          created_at?: string
          farm_id: string
          farm_type?: string | null
          id?: string
          location?: string | null
          metadata?: Json
          name: string
          notes?: string | null
          organization_id: string
          species?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          animal_count?: number
          birth_period?: string | null
          category?: string | null
          created_at?: string
          farm_id?: string
          farm_type?: string | null
          id?: string
          location?: string | null
          metadata?: Json
          name?: string
          notes?: string | null
          organization_id?: string
          species?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_batches_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_infrastructures: {
        Row: {
          capacity: number | null
          created_at: string
          farm_id: string
          id: string
          infra_type: string
          location: string | null
          metadata: Json
          name: string
          notes: string | null
          organization_id: string
          photos: string[] | null
          surface_sqm: number | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          farm_id: string
          id?: string
          infra_type: string
          location?: string | null
          metadata?: Json
          name: string
          notes?: string | null
          organization_id: string
          photos?: string[] | null
          surface_sqm?: number | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          farm_id?: string
          id?: string
          infra_type?: string
          location?: string | null
          metadata?: Json
          name?: string
          notes?: string | null
          organization_id?: string
          photos?: string[] | null
          surface_sqm?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_infrastructures_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_infrastructures_organization_id_fkey"
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
          intervention_date: string
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
          organization_id: string
          phone: string | null
          registration_number: string | null
          updated_at: string
          user_id: string | null
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
          organization_id: string
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id?: string | null
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
          organization_id?: string
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id?: string | null
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
      invoices: {
        Row: {
          client_id: string
          created_at: string
          discount_amount: number | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          organization_id: string | null
          payment_date: string | null
          payment_method: string | null
          status: string
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          organization_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          organization_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_support_notes: {
        Row: {
          author_email: string | null
          author_id: string | null
          body: string
          created_at: string
          id: string
          organization_id: string
        }
        Insert: {
          author_email?: string | null
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          organization_id: string
        }
        Update: {
          author_email?: string | null
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_support_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          pedigree_depth: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          pedigree_depth?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          pedigree_depth?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
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
          plan_code: string
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
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          active: boolean
          business_hours: Json | null
          clinic_address: string | null
          clinic_name: string
          created_at: string
          email: string | null
          id: string
          invitation_code: string | null
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_hours?: Json | null
          clinic_address?: string | null
          clinic_name: string
          created_at?: string
          email?: string | null
          id?: string
          invitation_code?: string | null
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_hours?: Json | null
          clinic_address?: string | null
          clinic_name?: string
          created_at?: string
          email?: string | null
          id?: string
          invitation_code?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          reference_number: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date: string
          payment_method: string
          reference_number?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
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
            referencedRelation: "animal_medical_summary"
            referencedColumns: ["animal_id"]
          },
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
      revenue: {
        Row: {
          amount: number
          category: string | null
          client_id: string | null
          created_at: string
          description: string
          id: string
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          reference_id: string | null
          reference_type: string | null
          revenue_date: string
          source: string
          tax_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          revenue_date: string
          source: string
          tax_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          revenue_date?: string
          source?: string
          tax_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          item_id: string
          item_name: string
          message: string
          severity: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          item_id: string
          item_name: string
          message: string
          severity?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          item_id?: string
          item_name?: string
          message?: string
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
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
          organization_id: string
          requires_prescription: boolean
          selling_price: number | null
          supplier: string | null
          supplier_id: string | null
          unit: string
          unit_cost: number | null
          updated_at: string
          user_id: string
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
          organization_id: string
          requires_prescription?: boolean
          selling_price?: number | null
          supplier?: string | null
          supplier_id?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string
          user_id: string
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
          organization_id?: string
          requires_prescription?: boolean
          selling_price?: number | null
          supplier?: string | null
          supplier_id?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          item_name: string | null
          movement_date: string
          movement_type: string
          notes: string | null
          performed_by: string | null
          quantity: number
          reason: string | null
          reference: string | null
          stock_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name?: string | null
          movement_date?: string
          movement_type: string
          notes?: string | null
          performed_by?: string | null
          quantity: number
          reason?: string | null
          reference?: string | null
          stock_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string | null
          movement_date?: string
          movement_type?: string
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          reason?: string | null
          reference?: string | null
          stock_item_id?: string
        }
        Relationships: [
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
        Relationships: [
          {
            foreignKeyName: "storage_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      suppliers: {
        Row: {
          active: boolean
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string | null
          organization_id: string | null
          permissions: Json | null
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invitation_token: string
          invited_by?: string | null
          organization_id?: string | null
          permissions?: Json | null
          role: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          organization_id?: string | null
          permissions?: Json | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          role: string
          specialty: string | null
          status: string
          updated_at: string
          username: string | null
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
          role: string
          specialty?: string | null
          status?: string
          updated_at?: string
          username?: string | null
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
          role?: string
          specialty?: string | null
          status?: string
          updated_at?: string
          username?: string | null
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
          species?: string
          updated_at?: string
          vaccine_name?: string
          vaccine_type?: string
        }
        Relationships: []
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
          vaccination_date: string
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
            referencedRelation: "animal_medical_summary"
            referencedColumns: ["animal_id"]
          },
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
      admin_dashboard_stats: {
        Row: {
          pending_users: number | null
          total_animals: number | null
          total_clients: number | null
          total_users: number | null
        }
        Relationships: []
      }
      animal_medical_summary: {
        Row: {
          active_prescriptions: number | null
          animal_id: string | null
          animal_name: string | null
          breed: string | null
          last_consultation: string | null
          last_vaccination: string | null
          owner_name: string | null
          species: string | null
          total_consultations: number | null
          total_vaccinations: number | null
          upcoming_appointments: number | null
        }
        Relationships: []
      }
      financial_dashboard: {
        Row: {
          net_income: number | null
          total_expenses: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      vaccination_reminders: {
        Row: {
          animal_name: string | null
          email: string | null
          id: string | null
          next_due_date: string | null
          owner_name: string | null
          phone: string | null
          reminder_status: string | null
          vaccine_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_update_user_profile: {
        Args: { p_patch: Json; p_user_id: string }
        Returns: Json
      }
      admin_upsert_subscription: {
        Args: { p_organization_id: string; p_payload: Json }
        Returns: Json
      }
      approve_user: {
        Args: { approved_by_param: string; user_id_param: string }
        Returns: undefined
      }
      check_quota_limit: { Args: { p_kind: string }; Returns: Json }
      create_user_profile: {
        Args: {
          p_clinic_address?: string
          p_clinic_name?: string
          p_email: string
          p_full_name: string
          p_organization_code?: string
          p_phone?: string
          p_role?: string
          p_user_id: string
        }
        Returns: Json
      }
      current_organization_id: { Args: never; Returns: string }
      end_impersonation: { Args: never; Returns: Json }
      generate_stock_alerts: { Args: never; Returns: undefined }
      get_access_status: { Args: never; Returns: Json }
      get_active_impersonation: { Args: never; Returns: Json }
      get_all_orgs_storage: {
        Args: never
        Returns: {
          bytes_used: number
          files_count: number
          organization_id: string
        }[]
      }
      get_all_orgs_usage_stats: {
        Args: never
        Returns: {
          animals_count: number
          clients_count: number
          organization_id: string
          users_count: number
        }[]
      }
      get_effective_plan_for_org: {
        Args: { p_org_id: string }
        Returns: {
          features: Json
          limits: Json
          max_animals: number
          max_clients: number
          max_users: number
          plan_code: string
          plan_name: string
          storage_total_mb: number
        }[]
      }
      get_org_admin_detail: { Args: { p_org_id: string }; Returns: Json }
      get_organization_quota: { Args: never; Returns: Json }
      get_super_admin_billing_overview: { Args: never; Returns: Json }
      get_user_org: { Args: { _user_id: string }; Returns: string }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_org_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action: string
          p_after?: Json
          p_before?: Json
          p_metadata?: Json
          p_organization_id?: string
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: string
      }
      recompute_storage_usage: { Args: never; Returns: Json }
      record_storage_change: {
        Args: {
          p_bytes_delta: number
          p_category: string
          p_files_delta?: number
        }
        Returns: Json
      }
      reject_user: {
        Args: {
          reason_param: string
          rejected_by_param: string
          user_id_param: string
        }
        Returns: undefined
      }
      start_impersonation: {
        Args: { p_org_id: string; p_reason?: string }
        Returns: Json
      }
      update_user_permissions: {
        Args: {
          permissions_param: Json
          updated_by_param: string
          user_id_param: string
        }
        Returns: undefined
      }
      user_belongs_to_org: { Args: { org_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
