
import React from 'react';
import { SessionCard } from './SessionCard';
import { useSessions } from '@/hooks/useSessions';
import { Skeleton } from '@/components/ui/skeleton';

interface SessionsListProps {
  status?: string;
  onJoinSession?: (session: any) => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({ 
  status, 
  onJoinSession 
}) => {
  const { sessions, loading, cancelSession, rescheduleSession } = useSessions(status);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {status ? `No ${status} sessions found` : 'No sessions found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onJoin={onJoinSession}
          onCancel={cancelSession}
          onReschedule={(sessionId) => {
            // For now, just show a message - implement proper reschedule modal later
            console.log('Reschedule session:', sessionId);
          }}
        />
      ))}
    </div>
  );
};
