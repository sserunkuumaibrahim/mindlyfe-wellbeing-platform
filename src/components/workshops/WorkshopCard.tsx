
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface WorkshopCardProps {
  workshop: any;
  onEnroll?: (workshopId: string) => void;
  onView?: (workshop: any) => void;
  showEnrollButton?: boolean;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({ 
  workshop, 
  onEnroll, 
  onView,
  showEnrollButton = true 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(price);
  };

  return (
    <Card className="bg-white border border-blue-100 hover:border-blue-300 transition-colors duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-blue-900 mb-1">
              {workshop.title}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="bg-green-100 text-green-800 text-xs"
            >
              {workshop.workshop_type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(workshop.price_ugx)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {workshop.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {workshop.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            {format(new Date(workshop.scheduled_at), 'PPP')}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            {workshop.duration_minutes} minutes
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-blue-500" />
            Max {workshop.max_participants} participants
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
            Online Workshop
          </div>
        </div>

        {workshop.facilitator && (
          <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
            <Avatar className="h-8 w-8">
              <AvatarImage src={workshop.facilitator.profile_photo_url} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {workshop.facilitator.first_name?.[0]}
                {workshop.facilitator.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {workshop.facilitator.first_name} {workshop.facilitator.last_name}
              </div>
              <div className="text-xs text-gray-500">Facilitator</div>
            </div>
          </div>
        )}

        <div className="flex space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(workshop)}
            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            View Details
          </Button>
          {showEnrollButton && (
            <Button
              size="sm"
              onClick={() => onEnroll?.(workshop.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Enroll Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
