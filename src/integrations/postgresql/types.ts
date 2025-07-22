// PostgreSQL Database Types for MindLyfe
// This replaces the Supabase generated types

export type Json = 
  | string 
  | number 
  | boolean 
  | null 
  | { [key: string]: Json } 
  | Json[];

export type PublicTableName = 
  | "audit_logs"
  | "availability"
  | "billing_history"
  | "conversations"
  | "documents"
  | "individual_profiles"
  | "messages"
  | "notifications"
  | "organization_profiles"
  | "payments"
  | "profiles"
  | "sessions"
  | "subscriptions"
  | "therapist_profiles"
  | "workshops"
  | "workshop_participants"
  | "analytics_events";

export type PublicViewName = 
  | "user_profile_view"
  | "therapist_availability_view"
  | "session_details_view";

export enum UserRole {
  Admin = 'admin',
  Therapist = 'therapist',
  Individual = 'individual',
  Organization = 'organization'
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending'
}

export enum AvailabilityStatus {
  Available = 'available',
  Unavailable = 'unavailable',
  Booked = 'booked'
}

export enum PaymentStatus {
  Paid = 'paid',
  Unpaid = 'unpaid',
  Failed = 'failed'
}

export type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Settings = {
  notifications: {
    email: boolean;
    sms: boolean;
  };
  theme: string;
};

export type MedicalHistory = {
  conditions: string[];
  allergies: string[];
  medications: string[];
};

export enum GenderEnum {
  Male = "male",
  Female = "female",
  Other = "other",
}

export enum NotificationType {
  SessionReminder = "session_reminder",
  NewMessage = "new_message",
  BillingUpdate = "billing_update",
  NewFeature = "new_feature",
}

export enum SessionStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELED = "canceled",
  NO_SHOW = "no_show",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  PAST_DUE = "past_due",
  INCOMPLETE = "incomplete",
}

export type Preferences = {
  communication: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  language: string;
};

export type Attachments = {
  files: {
    name: string;
    url: string;
    size: number;
  }[];
};

export type Data = {
  [key: string]: unknown;
};

export type OldData = {
  [key: string]: unknown;
};

export type NewData = {
  [key: string]: unknown;
};

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          table_name: string
          operation: string
          old_data: OldData | null
          new_data: NewData | null
          user_id: string | null
          timestamp: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          table_name: string
          operation: string
          old_data?: OldData | null
          new_data?: NewData | null
          user_id?: string | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          table_name?: string
          operation?: string
          old_data?: OldData | null
          new_data?: NewData | null
          user_id?: string | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      availability: {
        Row: {
          id: string
          therapist_id: string
          day_of_week: number
          start_time: string
          end_time: string
          status: AvailabilityStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          day_of_week: number
          start_time: string
          end_time: string
          status?: AvailabilityStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          therapist_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          status?: AvailabilityStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      billing_history: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          description: string | null
          payment_method: string | null
          status: PaymentStatus
          transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          description?: string | null
          payment_method?: string | null
          status?: PaymentStatus
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          description?: string | null
          payment_method?: string | null
          status?: PaymentStatus
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          session_id: string | null
          participants: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          participants: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          participants?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          file_url: string | null
          file_type: string | null
          file_size: number | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      individual_profiles: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string | null
          gender: GenderEnum | null
          phone_number: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_history: Json | null
          preferences: Preferences | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date_of_birth?: string | null
          gender?: GenderEnum | null
          phone_number?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: Json | null
          preferences?: Preferences | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date_of_birth?: string | null
          gender?: GenderEnum | null
          phone_number?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: MedicalHistory | null
          preferences?: Preferences | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: string
          attachments: Json | null
          read_by: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          message_type?: string
          attachments?: Json | null
          read_by?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          message_type?: string
          attachments?: Attachments | null
          read_by?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          data: Data | null
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          data?: Data | null
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: NotificationType
          data?: Data | null
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_profiles: {
        Row: {
          id: string
          user_id: string
          organization_name: string
          organization_type: string | null
          tax_id: string | null
          address: Address | null
          contact_person: string | null
          phone_number: string | null
          website: string | null
          description: string | null
          settings: Settings | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_name: string
          organization_type?: string | null
          tax_id?: string | null
          address?: Address | null
          contact_person?: string | null
          phone_number?: string | null
          website?: string | null
          description?: string | null
          settings?: Settings | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_name?: string
          organization_type?: string | null
          tax_id?: string | null
          address?: Address | null
          contact_person?: string | null
          phone_number?: string | null
          website?: string | null
          description?: string | null
          settings?: Settings | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          amount: number
          currency: string
          status: PaymentStatus
          payment_method: string | null
          transaction_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          amount: number
          currency?: string
          status?: PaymentStatus
          payment_method?: string | null
          transaction_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          amount?: number
          currency?: string
          status?: PaymentStatus
          payment_method?: string | null
          transaction_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          is_active: boolean
          last_login: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          last_login?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          last_login?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          client_id: string
          therapist_id: string
          scheduled_at: string
          duration_minutes: number
          status: SessionStatus
          session_type: string
          notes: string | null
          recording_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          therapist_id: string
          scheduled_at: string
          duration_minutes?: number
          status?: SessionStatus
          session_type?: string
          notes?: string | null
          recording_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          therapist_id?: string
          scheduled_at?: string
          duration_minutes?: number
          status?: SessionStatus
          session_type?: string
          notes?: string | null
          recording_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          status: SubscriptionStatus
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_name: string
          status?: SubscriptionStatus
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string
          status?: SubscriptionStatus
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      therapist_profiles: {
        Row: {
          id: string
          user_id: string
          license_number: string | null
          specializations: string[]
          years_of_experience: number | null
          education: Json | null
          certifications: Json | null
          bio: string | null
          hourly_rate: number | null
          languages: string[]
          timezone: string | null
          is_verified: boolean
          verification_documents: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          license_number?: string | null
          specializations?: string[]
          years_of_experience?: number | null
          education?: Json | null
          certifications?: Json | null
          bio?: string | null
          hourly_rate?: number | null
          languages?: string[]
          timezone?: string | null
          is_verified?: boolean
          verification_documents?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          license_number?: string | null
          specializations?: string[]
          years_of_experience?: number | null
          education?: Json | null
          certifications?: Json | null
          bio?: string | null
          hourly_rate?: number | null
          languages?: string[]
          timezone?: string | null
          is_verified?: boolean
          verification_documents?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      workshop_participants: {
        Row: {
          id: string
          workshop_id: string
          user_id: string
          registered_at: string
          attended: boolean
          feedback: string | null
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workshop_id: string
          user_id: string
          registered_at?: string
          attended?: boolean
          feedback?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workshop_id?: string
          user_id?: string
          registered_at?: string
          attended?: boolean
          feedback?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_participants_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          }
        ]
      }
      workshops: {
        Row: {
          id: string
          title: string
          description: string | null
          facilitator_id: string
          scheduled_at: string
          duration_minutes: number
          max_participants: number | null
          current_participants: number
          price: number | null
          is_public: boolean
          materials: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          facilitator_id: string
          scheduled_at: string
          duration_minutes?: number
          max_participants?: number | null
          current_participants?: number
          price?: number | null
          is_public?: boolean
          materials?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          facilitator_id?: string
          scheduled_at?: string
          duration_minutes?: number
          max_participants?: number | null
          current_participants?: number
          price?: number | null
          is_public?: boolean
          materials?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshops_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          event_name: string
          properties: Json | null
          timestamp: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_name: string
          properties?: Json | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_name?: string
          properties?: Json | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      analytics_dashboard_view: {
        Row: {
          event_name: string | null
          event_count: number | null
          unique_users: number | null
          avg_session_duration: number | null
          date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      insert_analytics_event: {
        Args: {
          events: Json
        }
        Returns: undefined
      }
      get_analytics_events: {
        Args: {
          days_back: number
        }
        Returns: {
          id: string
          user_id: string | null
          session_id: string | null
          event_name: string
          properties: Json | null
          timestamp: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }[]
      }
      get_user_analytics_summary: {
        Args: {
          target_user_id: string
          days_back: number
        }
        Returns: {
          total_events: number
          unique_sessions: number
          first_seen: string
          last_seen: string
          top_events: Json
        }[]
      }
      get_popular_pages: {
        Args: {
          days_back: number
          limit_count: number
        }
        Returns: {
          page: string
          views: number
          unique_users: number
        }[]
      }
      get_user_actions_summary: {
        Args: {
          days_back: number
        }
        Returns: {
          action: string
          count: number
          unique_users: number
        }[]
      }
      get_daily_analytics_stats: {
        Args: {
          days_back: number
        }
        Returns: {
          date: string
          total_events: number
          unique_users: number
          unique_sessions: number
        }[]
      }
      cleanup_old_analytics_events: {
        Args: {
          days_to_keep: number
        }
        Returns: number
      }
    }

    CompositeTypes: {
      [_ in unknown]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type Views<
  PublicViewNameOrOptions extends
    | keyof PublicSchema["Views"]
    | { schema: keyof Database },
  ViewName extends PublicViewNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicViewNameOrOptions["schema"]]["Views"]
    : never = never,
> = PublicViewNameOrOptions extends { schema: keyof Database }
  ? Database[PublicViewNameOrOptions["schema"]]["Views"][ViewName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicViewNameOrOptions extends keyof PublicSchema["Views"]
    ? PublicSchema["Views"][PublicViewNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never



// Export commonly used types
export type Profile = Tables<'profiles'>
export type IndividualProfile = Tables<'individual_profiles'>
export type TherapistProfile = Tables<'therapist_profiles'>
export type OrganizationProfile = Tables<'organization_profiles'>
export type Session = Tables<'sessions'>
export type Message = Tables<'messages'>
export type Conversation = Tables<'conversations'>
export type Notification = Tables<'notifications'>
export type Payment = Tables<'payments'>
export type Subscription = Tables<'subscriptions'>
export type BillingHistory = Tables<'billing_history'>
export type AuditLog = Tables<'audit_logs'>
export type Document = Tables<'documents'>
export type Workshop = Tables<'workshops'>
export type WorkshopParticipant = Tables<'workshop_participants'>
export type Availability = Tables<'availability'>
export type AnalyticsEvent = Tables<'analytics_events'>