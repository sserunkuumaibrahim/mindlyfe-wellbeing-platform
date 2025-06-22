import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, Video, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import AppPageLayout from '@/components/ui/AppPageLayout';

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  specializations: string[];
  languages_spoken: string[];
  years_experience: number;
  bio?: string;
}

interface AvailabilitySlot {
  therapist_id: string;
  date: string;
  time: string;
  available: boolean;
}

export const BookingSystem: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          profile_photo_url,
          therapist_profiles!inner(
            specializations,
            languages_spoken,
            years_experience,
            bio
          )
        `)
        .eq('role', 'therapist');

      if (error) throw error;

      const formattedTherapists = data.map(therapist => ({
        id: therapist.id,
        first_name: therapist.first_name,
        last_name: therapist.last_name,
        profile_photo_url: therapist.profile_photo_url,
        specializations: therapist.therapist_profiles?.specializations || [],
        languages_spoken: therapist.therapist_profiles?.languages_spoken || [],
        years_experience: therapist.therapist_profiles?.years_experience || 0,
        bio: therapist.therapist_profiles?.bio,
      }));

      setTherapists(formattedTherapists);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      toast({
        title: "Error",
        description: "Failed to load therapists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (therapistId: string) => {
    try {
      // Call edge function to get available slots
      const { data, error } = await supabase.functions.invoke('get-availability', {
        body: { therapist_id: therapistId }
      });

      if (error) throw error;
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    }
  };

  const handleTherapistSelect = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setSelectedSlot(null);
    fetchAvailability(therapist.id);
  };

  const handleBooking = async () => {
    if (!selectedTherapist || !selectedSlot || !user) return;

    setBooking(true);
    try {
      const { data, error } = await supabase.functions.invoke('book-session', {
        body: {
          therapist_id: selectedTherapist.id,
          client_id: user.id,
          scheduled_at: `${selectedSlot.date}T${selectedSlot.time}:00`,
          duration_minutes: 60,
          session_type: 'virtual'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session booked successfully!",
      });

      // Reset selection
      setSelectedTherapist(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <AppPageLayout>
        <div className="flex justify-center p-8">Loading therapists...</div>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout>
      <div className={`${isMobile ? 'p-4' : 'container mx-auto p-6'} space-y-6`}>
        <div className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>Book a Session</h1>
        </div>

        {!selectedTherapist ? (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
            {therapists.map((therapist) => (
              <Card key={therapist.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleTherapistSelect(therapist)}>
                <CardHeader className="text-center">
                  <Avatar className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} mx-auto mb-4`}>
                    <AvatarImage src={therapist.profile_photo_url} />
                    <AvatarFallback>
                      {therapist.first_name[0]}{therapist.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className={isMobile ? 'text-lg' : ''}>{therapist.first_name} {therapist.last_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {therapist.years_experience} years experience
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Specializations:</p>
                      <div className="flex flex-wrap gap-1">
                        {therapist.specializations.slice(0, isMobile ? 2 : 3).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Languages:</p>
                      <div className="flex flex-wrap gap-1">
                        {therapist.languages_spoken.slice(0, 2).map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {therapist.bio && !isMobile && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {therapist.bio}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-3 gap-6'}`}>
            <Card className={isMobile ? '' : 'lg:col-span-1'}>
              <CardHeader>
                <Button variant="outline" onClick={() => setSelectedTherapist(null)} size={isMobile ? 'sm' : 'default'}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <Avatar className={`${isMobile ? 'w-20 h-20' : 'w-24 h-24'} mx-auto`}>
                    <AvatarImage src={selectedTherapist.profile_photo_url} />
                    <AvatarFallback>
                      {selectedTherapist.first_name[0]}{selectedTherapist.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>
                      {selectedTherapist.first_name} {selectedTherapist.last_name}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedTherapist.years_experience} years experience
                    </p>
                  </div>
                  {selectedTherapist.bio && (
                    <p className="text-sm text-muted-foreground">
                      {selectedTherapist.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={isMobile ? '' : 'lg:col-span-2'}>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3`}>
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedSlot === slot ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col"
                      onClick={() => setSelectedSlot(slot)}
                      disabled={!slot.available}
                      size={isMobile ? 'sm' : 'default'}
                    >
                      <div className="text-sm font-medium">{slot.date}</div>
                      <div className="text-xs">{slot.time}</div>
                    </Button>
                  ))}
                </div>

                {selectedSlot && (
                  <div className="mt-6 p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Session Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{selectedTherapist.first_name} {selectedTherapist.last_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedSlot.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{selectedSlot.time} (60 minutes)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4" />
                        <span>Virtual Session</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>UGX 76,000</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleBooking}
                      disabled={booking}
                      size={isMobile ? 'sm' : 'default'}
                    >
                      {booking ? 'Booking...' : 'Book Session'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppPageLayout>
  );
};
