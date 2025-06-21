export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          profile_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          profile_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          profile_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          event_type: string | null
          google_calendar_id: string | null
          id: string
          profile_id: string | null
          related_id: string | null
          reminder_minutes: number | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          google_calendar_id?: string | null
          id?: string
          profile_id?: string | null
          related_id?: string | null
          reminder_minutes?: number | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          google_calendar_id?: string | null
          id?: string
          profile_id?: string | null
          related_id?: string | null
          reminder_minutes?: number | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          required_for_role: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          required_for_role?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          required_for_role?: string[] | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category_id: string | null
          created_at: string | null
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          profile_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          profile_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          profile_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_session_enrollments: {
        Row: {
          enrolled_at: string
          group_session_id: string | null
          id: string
          profile_id: string | null
          status: string
        }
        Insert: {
          enrolled_at?: string
          group_session_id?: string | null
          id?: string
          profile_id?: string | null
          status?: string
        }
        Update: {
          enrolled_at?: string
          group_session_id?: string | null
          id?: string
          profile_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_session_enrollments_group_session_id_fkey"
            columns: ["group_session_id"]
            isOneToOne: false
            referencedRelation: "group_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_session_enrollments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          facilitator_id: string | null
          google_meet_url: string | null
          id: string
          max_participants: number
          organization_id: string | null
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          facilitator_id?: string | null
          google_meet_url?: string | null
          id?: string
          max_participants?: number
          organization_id?: string | null
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          facilitator_id?: string | null
          google_meet_url?: string | null
          id?: string
          max_participants?: number
          organization_id?: string | null
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_sessions_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_profiles: {
        Row: {
          communication_pref:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          mental_health_history: string | null
          opt_in_newsletter: boolean
          opt_in_sms: boolean
          preferred_therapist_gender:
            | Database["public"]["Enums"]["gender_type"]
            | null
          therapy_goals: string[] | null
          updated_at: string
        }
        Insert: {
          communication_pref?:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id: string
          mental_health_history?: string | null
          opt_in_newsletter?: boolean
          opt_in_sms?: boolean
          preferred_therapist_gender?:
            | Database["public"]["Enums"]["gender_type"]
            | null
          therapy_goals?: string[] | null
          updated_at?: string
        }
        Update: {
          communication_pref?:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          mental_health_history?: string | null
          opt_in_newsletter?: boolean
          opt_in_sms?: boolean
          preferred_therapist_gender?:
            | Database["public"]["Enums"]["gender_type"]
            | null
          therapy_goals?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string | null
          id: string
          paid_at: string | null
          payment_type: string | null
          profile_id: string | null
          session_id: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          payment_type?: string | null
          profile_id?: string | null
          session_id?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          payment_type?: string | null
          profile_id?: string | null
          session_id?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_url: string | null
          id: string
          is_read: boolean
          message_type: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean
          message_type?: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean
          message_type?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          profile_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          profile_id: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          profile_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          organization_id: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          organization_id?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          organization_id?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invoices: {
        Row: {
          amount_ugx: number
          billing_period_end: string
          billing_period_start: string
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          num_users: number
          organization_id: string | null
          paid_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_ugx: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          num_users: number
          organization_id?: string | null
          paid_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_ugx?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          num_users?: number
          organization_id?: string | null
          paid_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          annual_sessions_limit: number | null
          annual_sessions_used: number | null
          id: string
          joined_at: string
          organization_id: string
          profile_id: string
          role: string
          sessions_reset_date: string | null
          sessions_used: number
        }
        Insert: {
          annual_sessions_limit?: number | null
          annual_sessions_used?: number | null
          id?: string
          joined_at?: string
          organization_id: string
          profile_id: string
          role?: string
          sessions_reset_date?: string | null
          sessions_used?: number
        }
        Update: {
          annual_sessions_limit?: number | null
          annual_sessions_used?: number | null
          id?: string
          joined_at?: string
          organization_id?: string
          profile_id?: string
          role?: string
          sessions_reset_date?: string | null
          sessions_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_profiles: {
        Row: {
          address: string | null
          billing_contact_email: string | null
          billing_contact_phone: string | null
          city: string | null
          created_at: string
          date_of_establishment: string | null
          id: string
          num_employees: number
          official_website: string | null
          organization_name: string
          organization_type:
            | Database["public"]["Enums"]["organization_type"]
            | null
          postal_code: string | null
          registration_number: string
          representative_job_title: string
          representative_name: string
          representative_national_id: string
          service_requirements: Json | null
          state: string | null
          tax_id_number: string
          updated_at: string
          uploaded_documents: Json | null
        }
        Insert: {
          address?: string | null
          billing_contact_email?: string | null
          billing_contact_phone?: string | null
          city?: string | null
          created_at?: string
          date_of_establishment?: string | null
          id: string
          num_employees?: number
          official_website?: string | null
          organization_name: string
          organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          postal_code?: string | null
          registration_number: string
          representative_job_title: string
          representative_name: string
          representative_national_id: string
          service_requirements?: Json | null
          state?: string | null
          tax_id_number: string
          updated_at?: string
          uploaded_documents?: Json | null
        }
        Update: {
          address?: string | null
          billing_contact_email?: string | null
          billing_contact_phone?: string | null
          city?: string | null
          created_at?: string
          date_of_establishment?: string | null
          id?: string
          num_employees?: number
          official_website?: string | null
          organization_name?: string
          organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          postal_code?: string | null
          registration_number?: string
          representative_job_title?: string
          representative_name?: string
          representative_national_id?: string
          service_requirements?: Json | null
          state?: string | null
          tax_id_number?: string
          updated_at?: string
          uploaded_documents?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          billing_cycle: string
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          plan_type: string
          price_ugx: number
          sessions_included: number | null
        }
        Insert: {
          billing_cycle: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          plan_type: string
          price_ugx: number
          sessions_included?: number | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          plan_type?: string
          price_ugx?: number
          sessions_included?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_uid: string
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          failed_login_attempts: number
          first_name: string
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_active: boolean
          is_email_verified: boolean
          is_phone_verified: boolean
          last_login_at: string | null
          last_name: string
          locked_until: string | null
          password_changed_at: string
          phone_number: string | null
          preferred_language: string
          profile_photo_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          auth_uid: string
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          failed_login_attempts?: number
          first_name: string
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_active?: boolean
          is_email_verified?: boolean
          is_phone_verified?: boolean
          last_login_at?: string | null
          last_name: string
          locked_until?: string | null
          password_changed_at?: string
          phone_number?: string | null
          preferred_language?: string
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          auth_uid?: string
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          failed_login_attempts?: number
          first_name?: string
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_active?: boolean
          is_email_verified?: boolean
          is_phone_verified?: boolean
          last_login_at?: string | null
          last_name?: string
          locked_until?: string | null
          password_changed_at?: string
          phone_number?: string | null
          preferred_language?: string
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      session_feedback: {
        Row: {
          client_id: string | null
          created_at: string
          feedback_text: string | null
          id: string
          rating: number | null
          session_id: string | null
          therapist_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating?: number | null
          session_id?: string | null
          therapist_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating?: number | null
          session_id?: string | null
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_feedback_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_feedback_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_pricing: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price_ugx: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_ugx: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_ugx?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_ugx: number
          billing_type: string | null
          created_at: string
          end_date: string
          id: string
          num_users: number | null
          organization_id: string | null
          plan_type: string
          profile_id: string | null
          sessions_included: number
          sessions_used: number
          start_date: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_ugx: number
          billing_type?: string | null
          created_at?: string
          end_date: string
          id?: string
          num_users?: number | null
          organization_id?: string | null
          plan_type: string
          profile_id?: string | null
          sessions_included?: number
          sessions_used?: number
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_ugx?: number
          billing_type?: string | null
          created_at?: string
          end_date?: string
          id?: string
          num_users?: number | null
          organization_id?: string | null
          plan_type?: string
          profile_id?: string | null
          sessions_included?: number
          sessions_used?: number
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_availability: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_time: string
          id: string
          is_available: boolean
          is_recurring: boolean
          specific_date: string | null
          start_time: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_time: string
          id?: string
          is_available?: boolean
          is_recurring?: boolean
          specific_date?: string | null
          start_time: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_available?: boolean
          is_recurring?: boolean
          specific_date?: string | null
          start_time?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_availability_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_profiles: {
        Row: {
          bio: string | null
          certifications: string[] | null
          created_at: string
          education_background: string | null
          id: string
          id_document_url: string | null
          insurance_document_url: string | null
          insurance_expiry_date: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          languages_spoken: string[]
          license_body: string
          license_document_url: string | null
          license_expiry_date: string | null
          license_number: string
          national_id_number: string
          other_documents_urls: string | null
          specializations: string[]
          status: Database["public"]["Enums"]["profile_status"] | null
          updated_at: string
          years_experience: number
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          education_background?: string | null
          id: string
          id_document_url?: string | null
          insurance_document_url?: string | null
          insurance_expiry_date?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          languages_spoken?: string[]
          license_body: string
          license_document_url?: string | null
          license_expiry_date?: string | null
          license_number: string
          national_id_number: string
          other_documents_urls?: string | null
          specializations?: string[]
          status?: Database["public"]["Enums"]["profile_status"] | null
          updated_at?: string
          years_experience?: number
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          education_background?: string | null
          id?: string
          id_document_url?: string | null
          insurance_document_url?: string | null
          insurance_expiry_date?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          languages_spoken?: string[]
          license_body?: string
          license_document_url?: string | null
          license_expiry_date?: string | null
          license_number?: string
          national_id_number?: string
          other_documents_urls?: string | null
          specializations?: string[]
          status?: Database["public"]["Enums"]["profile_status"] | null
          updated_at?: string
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "therapist_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_sessions: {
        Row: {
          client_id: string
          created_at: string
          duration_minutes: number
          google_meet_url: string | null
          id: string
          notes: string | null
          recording_url: string | null
          scheduled_at: string
          session_type: Database["public"]["Enums"]["session_type"] | null
          status: Database["public"]["Enums"]["session_status"] | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_minutes?: number
          google_meet_url?: string | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_at: string
          session_type?: Database["public"]["Enums"]["session_type"] | null
          status?: Database["public"]["Enums"]["session_status"] | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_minutes?: number
          google_meet_url?: string | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_at?: string
          session_type?: Database["public"]["Enums"]["session_type"] | null
          status?: Database["public"]["Enums"]["session_status"] | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapy_sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa_methods: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          is_enabled: boolean
          is_verified: boolean
          profile_id: string
          secret: string | null
          updated_at: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          is_verified?: boolean
          profile_id: string
          secret?: string | null
          updated_at?: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          is_verified?: boolean
          profile_id?: string
          secret?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_2fa_methods_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          profile_id: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          profile_id: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          profile_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_codes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_enrollments: {
        Row: {
          enrolled_at: string | null
          id: string
          payment_status: string | null
          profile_id: string | null
          status: string | null
          workshop_id: string | null
        }
        Insert: {
          enrolled_at?: string | null
          id?: string
          payment_status?: string | null
          profile_id?: string | null
          status?: string | null
          workshop_id?: string | null
        }
        Update: {
          enrolled_at?: string | null
          id?: string
          payment_status?: string | null
          profile_id?: string | null
          status?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_enrollments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_enrollments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          facilitator_id: string | null
          google_meet_url: string | null
          id: string
          materials_urls: string[] | null
          max_participants: number | null
          organization_id: string | null
          price_ugx: number | null
          scheduled_at: string
          status: string | null
          title: string
          updated_at: string | null
          workshop_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          facilitator_id?: string | null
          google_meet_url?: string | null
          id?: string
          materials_urls?: string[] | null
          max_participants?: number | null
          organization_id?: string | null
          price_ugx?: number | null
          scheduled_at: string
          status?: string | null
          title: string
          updated_at?: string | null
          workshop_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          facilitator_id?: string | null
          google_meet_url?: string | null
          id?: string
          materials_urls?: string[] | null
          max_participants?: number | null
          organization_id?: string | null
          price_ugx?: number | null
          scheduled_at?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          workshop_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshops_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshops_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_session_payment_required: {
        Args: { user_profile_id: string }
        Returns: Json
      }
      get_organization_dashboard_stats: {
        Args: { org_id: string }
        Returns: Json
      }
      get_user_conversations: {
        Args: { user_id_param: string }
        Returns: {
          conversation_id: string
          other_user_id: string
          other_user_name: string
          other_user_photo: string
          last_message: string
          last_message_time: string
          unread_count: number
        }[]
      }
    }
    Enums: {
      communication_preference: "email" | "sms" | "both"
      gender_type: "male" | "female"
      organization_type:
        | "private_company"
        | "school"
        | "ngo"
        | "government"
        | "healthcare"
        | "other"
      profile_status: "pending_review" | "approved" | "rejected" | "suspended"
      session_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      session_type: "virtual" | "in_person"
      two_fa_method: "totp" | "sms" | "email"
      user_role: "individual" | "therapist" | "org_admin"
      verification_purpose:
        | "email_verification"
        | "phone_verification"
        | "password_reset"
        | "two_fa_setup"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      communication_preference: ["email", "sms", "both"],
      gender_type: ["male", "female"],
      organization_type: [
        "private_company",
        "school",
        "ngo",
        "government",
        "healthcare",
        "other",
      ],
      profile_status: ["pending_review", "approved", "rejected", "suspended"],
      session_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      session_type: ["virtual", "in_person"],
      two_fa_method: ["totp", "sms", "email"],
      user_role: ["individual", "therapist", "org_admin"],
      verification_purpose: [
        "email_verification",
        "phone_verification",
        "password_reset",
        "two_fa_setup",
      ],
    },
  },
} as const
