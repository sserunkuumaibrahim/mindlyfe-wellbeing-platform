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
      individual_profiles: {
        Row: {
          communication_pref: Database["public"]["Enums"]["communication_preference"]
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
          communication_pref?: Database["public"]["Enums"]["communication_preference"]
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
          communication_pref?: Database["public"]["Enums"]["communication_preference"]
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
          organization_type: Database["public"]["Enums"]["organization_type"]
          postal_code: string | null
          registration_number: string
          representative_job_title: string
          representative_name: string
          representative_national_id: string
          service_requirements: Json | null
          state: string | null
          status: Database["public"]["Enums"]["profile_status"]
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
          organization_type?: Database["public"]["Enums"]["organization_type"]
          postal_code?: string | null
          registration_number: string
          representative_job_title: string
          representative_name: string
          representative_national_id: string
          service_requirements?: Json | null
          state?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
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
          organization_type?: Database["public"]["Enums"]["organization_type"]
          postal_code?: string | null
          registration_number?: string
          representative_job_title?: string
          representative_name?: string
          representative_national_id?: string
          service_requirements?: Json | null
          state?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
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
          role: Database["public"]["Enums"]["user_role"]
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
          role?: Database["public"]["Enums"]["user_role"]
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
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
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
          status: Database["public"]["Enums"]["profile_status"]
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
          status?: Database["public"]["Enums"]["profile_status"]
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
          status?: Database["public"]["Enums"]["profile_status"]
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
          id: string
          notes: string | null
          recording_url: string | null
          scheduled_at: string
          session_type: Database["public"]["Enums"]["session_type"]
          status: Database["public"]["Enums"]["session_status"]
          therapist_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_at: string
          session_type?: Database["public"]["Enums"]["session_type"]
          status?: Database["public"]["Enums"]["session_status"]
          therapist_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_at?: string
          session_type?: Database["public"]["Enums"]["session_type"]
          status?: Database["public"]["Enums"]["session_status"]
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
          method: Database["public"]["Enums"]["two_fa_method"]
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
          method: Database["public"]["Enums"]["two_fa_method"]
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
          method?: Database["public"]["Enums"]["two_fa_method"]
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
          purpose: Database["public"]["Enums"]["verification_purpose"]
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          profile_id: string
          purpose: Database["public"]["Enums"]["verification_purpose"]
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          profile_id?: string
          purpose?: Database["public"]["Enums"]["verification_purpose"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
