export interface Session {
  id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduled_at: string;
  session_type: string;
  therapist?: {
    first_name: string;
    last_name: string;
  };
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  // Add other profile fields as needed
}

export interface IndividualDashboardData {
  sessions: Session[];
  profile: UserProfile;
  stats: {
    upcoming_sessions: number;
    completed_sessions: number;
    messages: number;
    workshops: number;
  };
}

export interface TherapistDashboardData {
  sessions: Session[];
  stats: {
    active_clients: number;
    monthly_earnings: number;
    average_rating: number;
    reviews_count: number;
    today_sessions_count: number;
  };
}

export interface OrganizationDashboardData {
  stats: {
    total_members: number;
    total_sessions: number;
    sessions_used: number;
    sessions_remaining: number;
    monthly_spend: number;
  };
  members: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    sessions_used: number;
    joined_at: string;
  }[];
}

export interface AdminStats {
  total_users: number;
  total_sessions: number;
  total_revenue: number;
  active_subscriptions: number;
  pending_therapists: number;
}

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
  therapist_details?: {
    status: 'pending' | 'approved' | 'rejected';
    license_number: string;
  };
}

export interface AdminDashboardData {
  stats: AdminStats;
  users: AdminUser[];
}