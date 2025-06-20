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
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          profile_id: string | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          profile_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          profile_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
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
      consent_records: {
        Row: {
          consent_text: string
          consent_type: string
          consent_version: string
          consented_at: string | null
          id: string
          ip_address: unknown | null
          profile_id: string | null
          user_agent: string | null
        }
        Insert: {
          consent_text: string
          consent_type: string
          consent_version: string
          consented_at?: string | null
          id?: string
          ip_address?: unknown | null
          profile_id?: string | null
          user_agent?: string | null
        }
        Update: {
          consent_text?: string
          consent_type?: string
          consent_version?: string
          consented_at?: string | null
          id?: string
          ip_address?: unknown | null
          profile_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_profiles: {
        Row: {
          communication_pref:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          mental_health_history: string | null
          opt_in_newsletter: boolean | null
          opt_in_sms: boolean | null
          preferred_therapist_gender:
            | Database["public"]["Enums"]["gender_type"]
            | null
          session_preferences: Json | null
          therapy_goals: string[] | null
          updated_at: string | null
        }
        Insert: {
          communication_pref?:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id: string
          mental_health_history?: string | null
          opt_in_newsletter?: boolean | null
          opt_in_sms?: boolean | null
          preferred_therapist_gender?:
            | Database["public"]["Enums"]["gender_type"]
            | null
          session_preferences?: Json | null
          therapy_goals?: string[] | null
          updated_at?: string | null
        }
        Update: {
          communication_pref?:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          mental_health_history?: string | null
          opt_in_newsletter?: boolean | null
          opt_in_sms?: boolean | null
          preferred_therapist_gender?:
            | Database["public"]["Enums"]["gender_type"]
            | null
          session_preferences?: Json | null
          therapy_goals?: string[] | null
          updated_at?: string | null
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
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          organization_id: string | null
          permissions: Json | null
          profile_id: string | null
          role_within_org: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          organization_id?: string | null
          permissions?: Json | null
          profile_id?: string | null
          role_within_org: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          organization_id?: string | null
          permissions?: Json | null
          profile_id?: string | null
          role_within_org?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          auth_letter_url: string | null
          billing_contact_email: string | null
          billing_contact_phone: string | null
          city: string | null
          created_at: string | null
          date_of_establishment: string
          id: string
          num_employees: number
          official_website: string | null
          org_structure_url: string | null
          organization_name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          postal_code: string | null
          proof_registration_url: string | null
          registration_number: string
          representative_job_title: string
          representative_name: string
          representative_national_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_requirements: Json | null
          state_province: string | null
          status: Database["public"]["Enums"]["profile_status"] | null
          tax_certificate_url: string | null
          tax_id_number: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          auth_letter_url?: string | null
          billing_contact_email?: string | null
          billing_contact_phone?: string | null
          city?: string | null
          created_at?: string | null
          date_of_establishment: string
          id: string
          num_employees: number
          official_website?: string | null
          org_structure_url?: string | null
          organization_name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          postal_code?: string | null
          proof_registration_url?: string | null
          registration_number: string
          representative_job_title: string
          representative_name: string
          representative_national_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_requirements?: Json | null
          state_province?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          tax_certificate_url?: string | null
          tax_id_number: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          auth_letter_url?: string | null
          billing_contact_email?: string | null
          billing_contact_phone?: string | null
          city?: string | null
          created_at?: string | null
          date_of_establishment?: string
          id?: string
          num_employees?: number
          official_website?: string | null
          org_structure_url?: string | null
          organization_name?: string
          organization_type?: Database["public"]["Enums"]["organization_type"]
          postal_code?: string | null
          proof_registration_url?: string | null
          registration_number?: string
          representative_job_title?: string
          representative_name?: string
          representative_national_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_requirements?: Json | null
          state_province?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          tax_certificate_url?: string | null
          tax_id_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_profiles_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      password_history: {
        Row: {
          changed_at: string | null
          id: string
          password_hash: string
          profile_id: string | null
        }
        Insert: {
          changed_at?: string | null
          id?: string
          password_hash: string
          profile_id?: string | null
        }
        Update: {
          changed_at?: string | null
          id?: string
          password_hash?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "password_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_uid: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          failed_login_attempts: number | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_active: boolean | null
          is_email_verified: boolean | null
          is_phone_verified: boolean | null
          last_login_at: string | null
          locked_until: string | null
          password_changed_at: string | null
          phone_number: string | null
          preferred_language: string | null
          profile_photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          auth_uid?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          failed_login_attempts?: number | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_active?: boolean | null
          is_email_verified?: boolean | null
          is_phone_verified?: boolean | null
          last_login_at?: string | null
          locked_until?: string | null
          password_changed_at?: string | null
          phone_number?: string | null
          preferred_language?: string | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          auth_uid?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          failed_login_attempts?: number | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_active?: boolean | null
          is_email_verified?: boolean | null
          is_phone_verified?: boolean | null
          last_login_at?: string | null
          locked_until?: string | null
          password_changed_at?: string | null
          phone_number?: string | null
          preferred_language?: string | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      therapist_profiles: {
        Row: {
          availability: Json | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          currency: string | null
          education_background: string | null
          hourly_rate: number | null
          id: string
          id_document_url: string | null
          insurance_document_url: string | null
          insurance_expiry_date: string
          insurance_policy_number: string
          insurance_provider: string
          languages_spoken: string[]
          license_body: string
          license_document_url: string | null
          license_expiry_date: string
          license_number: string
          national_id_number: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specializations: string[]
          status: Database["public"]["Enums"]["profile_status"] | null
          updated_at: string | null
          years_experience: number
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          currency?: string | null
          education_background?: string | null
          hourly_rate?: number | null
          id: string
          id_document_url?: string | null
          insurance_document_url?: string | null
          insurance_expiry_date: string
          insurance_policy_number: string
          insurance_provider: string
          languages_spoken: string[]
          license_body: string
          license_document_url?: string | null
          license_expiry_date: string
          license_number: string
          national_id_number: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specializations: string[]
          status?: Database["public"]["Enums"]["profile_status"] | null
          updated_at?: string | null
          years_experience: number
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          currency?: string | null
          education_background?: string | null
          hourly_rate?: number | null
          id?: string
          id_document_url?: string | null
          insurance_document_url?: string | null
          insurance_expiry_date?: string
          insurance_policy_number?: string
          insurance_provider?: string
          languages_spoken?: string[]
          license_body?: string
          license_document_url?: string | null
          license_expiry_date?: string
          license_number?: string
          national_id_number?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specializations?: string[]
          status?: Database["public"]["Enums"]["profile_status"] | null
          updated_at?: string | null
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
          {
            foreignKeyName: "therapist_profiles_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_sessions: {
        Row: {
          client_id: string
          client_rating: number | null
          created_at: string | null
          duration_minutes: number
          id: string
          meeting_url: string | null
          organization_id: string | null
          recording_url: string | null
          scheduled_at: string
          session_notes: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          status: Database["public"]["Enums"]["session_status"]
          therapist_id: string
          therapist_notes: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          client_rating?: number | null
          created_at?: string | null
          duration_minutes?: number
          id?: string
          meeting_url?: string | null
          organization_id?: string | null
          recording_url?: string | null
          scheduled_at: string
          session_notes?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          status?: Database["public"]["Enums"]["session_status"]
          therapist_id: string
          therapist_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          client_rating?: number | null
          created_at?: string | null
          duration_minutes?: number
          id?: string
          meeting_url?: string | null
          organization_id?: string | null
          recording_url?: string | null
          scheduled_at?: string
          session_notes?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          status?: Database["public"]["Enums"]["session_status"]
          therapist_id?: string
          therapist_notes?: string | null
          updated_at?: string | null
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
            foreignKeyName: "therapy_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
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
          created_at: string | null
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          method: Database["public"]["Enums"]["two_fa_method"]
          profile_id: string | null
          secret: string | null
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          method: Database["public"]["Enums"]["two_fa_method"]
          profile_id?: string | null
          secret?: string | null
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          method?: Database["public"]["Enums"]["two_fa_method"]
          profile_id?: string | null
          secret?: string | null
          verified_at?: string | null
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
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity_at: string | null
          profile_id: string | null
          refresh_token: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          profile_id?: string | null
          refresh_token?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          profile_id?: string | null
          refresh_token?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          max_attempts: number | null
          profile_id: string | null
          purpose: Database["public"]["Enums"]["verification_purpose"]
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          max_attempts?: number | null
          profile_id?: string | null
          purpose: Database["public"]["Enums"]["verification_purpose"]
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          max_attempts?: number | null
          profile_id?: string | null
          purpose?: Database["public"]["Enums"]["verification_purpose"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upload_document: {
        Args: { file_path: string; file_type: string; profile_type: string }
        Returns: Json
      }
    }
    Enums: {
      communication_preference: "email" | "sms" | "both"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      organization_type:
        | "private_company"
        | "school"
        | "ngo"
        | "government"
        | "healthcare"
        | "other"
      profile_status:
        | "pending_review"
        | "approved"
        | "rejected"
        | "active"
        | "inactive"
      session_status: "scheduled" | "completed" | "canceled" | "no_show"
      session_type: "virtual" | "in_person"
      two_fa_method: "email" | "sms" | "authenticator"
      user_role:
        | "individual"
        | "therapist"
        | "org_admin"
        | "sys_admin"
        | "super_admin"
      verification_purpose: "signup" | "password_reset" | "2fa" | "login"
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
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      organization_type: [
        "private_company",
        "school",
        "ngo",
        "government",
        "healthcare",
        "other",
      ],
      profile_status: [
        "pending_review",
        "approved",
        "rejected",
        "active",
        "inactive",
      ],
      session_status: ["scheduled", "completed", "canceled", "no_show"],
      session_type: ["virtual", "in_person"],
      two_fa_method: ["email", "sms", "authenticator"],
      user_role: [
        "individual",
        "therapist",
        "org_admin",
        "sys_admin",
        "super_admin",
      ],
      verification_purpose: ["signup", "password_reset", "2fa", "login"],
    },
  },
} as const
