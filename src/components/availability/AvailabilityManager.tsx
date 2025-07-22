
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/services/apiClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    if (!user) return;

    try {
      const data = await apiRequest<AvailabilitySlot[]>(`/api/availability?therapistId=${user.id}`);
      setSlots(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (day: number, startTime: string, endTime: string) => {
    if (!user) return;

    try {
      const newSlot = await apiRequest<AvailabilitySlot>('/api/availability', 'POST', {
        therapist_id: user.id,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        is_available: true,
      });
      setSlots([...slots, newSlot]);
    } catch (error) {
      console.error('Error adding slot:', error);
      toast({
        title: "Error",
        description: "Failed to add availability slot",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await apiRequest(`/api/availability/${slotId}`, 'DELETE');
      setSlots(slots.filter(slot => slot.id !== slotId));
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast({
        title: "Error",
        description: "Failed to delete availability slot",
        variant: "destructive",
      });
    }
  };

  const addTimeSlot = async () => {
    if (!user || !selectedDate) return;

    const dayOfWeek = selectedDate.getDay();
    const startTime = '09:00';
    const endTime = '10:00';

    try {
      const { error } = await supabase
        .from('therapist_availability')
        .insert({
          therapist_id: user.id,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot added successfully",
      });

      fetchAvailability();
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast({
        title: "Error",
        description: "Failed to add time slot",
        variant: "destructive",
      });
    }
  };

  const removeTimeSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('therapist_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot removed successfully",
      });

      fetchAvailability();
    } catch (error) {
      console.error('Error removing time slot:', error);
      toast({
        title: "Error",
        description: "Failed to remove time slot",
        variant: "destructive",
      });
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          <Button 
            onClick={() => selectedDate && handleAddSlot(selectedDate.getDay(), '09:00', '17:00')}
            className="w-full mt-4"
            disabled={!selectedDate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Default Slot for {selectedDate && getDayName(selectedDate.getDay())}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slots.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No availability slots set. Add some to start accepting bookings.
              </p>
            ) : (
              slots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{getDayName(slot.day_of_week)}</p>
                      <p className="text-sm text-gray-500">
                        {slot.start_time} - {slot.end_time}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSlot(slot.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
