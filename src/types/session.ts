
export interface TherapySession {
  id: string;
  client_id: string;
  therapist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: 'individual' | 'couple' | 'group';
  status: 'scheduled' | 'completed' | 'cancelled';
  google_meet_url?: string;
  notes?: string;
  client?: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
  therapist?: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

export interface SessionFeedback {
  id: string;
  session_id: string;
  therapist_id: string;
  client_id: string;
  rating: number;
  comments?: string;
}
