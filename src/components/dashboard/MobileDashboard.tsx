
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  MessageCircle, 
  Video, 
  FileText, 
  Bell,
  Plus,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface MobileDashboardProps {
  userStats?: any;
  upcomingSessions?: any[];
  recentMessages?: any[];
  notifications?: any[];
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  userStats,
  upcomingSessions = [],
  recentMessages = [],
  notifications = []
}) => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">
            Good morning, {profile?.first_name}!
          </h1>
          <p className="text-blue-600 text-sm">
            {format(new Date(), 'EEEE, MMMM do')}
          </p>
        </div>
        <div className="relative">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-blue-600" />
            {notifications.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                {notifications.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold">{userStats?.total_sessions || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Upcoming</p>
                <p className="text-2xl font-bold">{userStats?.upcoming_sessions || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-900 text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Book Session</span>
            </Button>
            <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Messages</span>
            </Button>
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Join Call</span>
            </Button>
            <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card className="border border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-900 text-lg">Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.therapist?.profile_photo_url} />
                    <AvatarFallback className="bg-blue-200 text-blue-600">
                      {session.therapist?.first_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 truncate">
                      {session.therapist?.first_name} {session.therapist?.last_name}
                    </p>
                    <p className="text-xs text-blue-600">
                      {format(new Date(session.scheduled_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Join
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming sessions</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card className="border border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-900 text-lg">Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMessages.length > 0 ? (
            <div className="space-y-3">
              {recentMessages.slice(0, 3).map((message) => (
                <div key={message.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender?.profile_photo_url} />
                    <AvatarFallback className="bg-green-200 text-green-600">
                      {message.sender?.first_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {message.sender?.first_name} {message.sender?.last_name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent messages</p>
          )}
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <Card className="border border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-900 text-lg flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>This Month's Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Sessions Completed</span>
                <span className="text-blue-600 font-medium">
                  {userStats?.completed_sessions || 0}/4
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((userStats?.completed_sessions || 0) / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Wellness Goals</span>
                <span className="text-green-600 font-medium">3/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
