
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Video, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AppPageLayout from '@/components/ui/AppPageLayout';
import { useOptimizedTherapists } from '@/hooks/useOptimizedTherapists';
import { toast } from '@/lib/toast';
import { apiRequest } from '@/services/apiClient';

export default function BookingSystem() {
  const { therapists, loading, error } = useOptimizedTherapists();
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleBookSession = async (therapistId: string, therapistName: string) => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date and time for the session.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('/api/sessions/book', {
        method: 'POST',
        body: JSON.stringify({
          therapistId,
          scheduledAt: selectedDate.toISOString(),
        }),
      });

      toast({
        title: "Session Booking",
        description: `Session with ${therapistName} has been requested. You will receive a confirmation email shortly.`,
      });
      
      setSelectedTherapist(null);
      setSelectedDate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppPageLayout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppPageLayout>
    );
  }

  if (error) {
    return (
      <AppPageLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Book a Therapy Session</h1>
          <p className="text-gray-600">Choose from our qualified therapists</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {therapists.map((therapist) => (
            <Card key={therapist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={therapist.profile_photo_url} />
                    <AvatarFallback>
                      {therapist.first_name[0]}{therapist.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {therapist.first_name} {therapist.last_name}
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">New Therapist</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {therapist.specializations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-1">
                      {therapist.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-1">Experience</h4>
                  <p className="text-sm text-gray-600">{therapist.years_experience} years</p>
                </div>

                {therapist.languages_spoken.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Languages</h4>
                    <p className="text-sm text-gray-600">
                      {therapist.languages_spoken.join(', ')}
                    </p>
                  </div>
                )}

                {therapist.bio && (
                  <div>
                    <h4 className="font-semibold mb-1">About</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {therapist.bio}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Session Fee</span>
                    <span className="text-lg font-bold">UGX 76,000</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Video className="h-4 w-4" />
                      <span>Virtual session available</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>60 minutes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <input type="datetime-local" onChange={(e) => setSelectedDate(new Date(e.target.value))} />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleBookSession(
                    therapist.id, 
                    `${therapist.first_name} ${therapist.last_name}`
                  )}
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {therapists.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No therapists available</h3>
              <p className="text-gray-600 mb-4">
                Please check back later or contact support for assistance.
              </p>
              <Button variant="outline">Contact Support</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppPageLayout>
  );
}
