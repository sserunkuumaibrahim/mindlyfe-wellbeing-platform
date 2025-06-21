
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AvailabilitySlot {
  id?: string;
  day_of_week?: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string;
  is_available: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);

  useEffect(() => {
    if (user?.role === 'therapist') {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', user?.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      const formattedSlots = data?.map(slot => ({
        id: slot.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_recurring: slot.is_recurring,
        specific_date: slot.specific_date,
        is_available: slot.is_available,
      })) || [];

      setAvailabilitySlots(formattedSlots);
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

  const handleSaveSlot = async (slot: AvailabilitySlot) => {
    try {
      const slotData = {
        therapist_id: user?.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_recurring: slot.is_recurring,
        specific_date: slot.specific_date,
        is_available: slot.is_available,
      };

      if (slot.id) {
        // Update existing slot
        const { error } = await supabase
          .from('therapist_availability')
          .update(slotData)
          .eq('id', slot.id);

        if (error) throw error;
      } else {
        // Create new slot
        const { error } = await supabase
          .from('therapist_availability')
          .insert([slotData]);

        if (error) throw error;
      }

      await fetchAvailability();
      setEditingSlot(null);
      
      toast({
        title: "Success",
        description: slot.id ? "Availability updated" : "Availability added",
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('therapist_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      await fetchAvailability();
      
      toast({
        title: "Success",
        description: "Availability deleted",
      });
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast({
        title: "Error",
        description: "Failed to delete availability",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== 'therapist') {
    return (
      <div className="text-center p-8">
        <p>This page is only available for therapists.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading availability...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Manage Availability</h1>
        </div>
        <Button onClick={() => setEditingSlot({
          start_time: '09:00',
          end_time: '17:00',
          is_recurring: true,
          is_available: true
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Availability
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availabilitySlots.map((slot) => (
          <Card key={slot.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {slot.is_recurring && slot.day_of_week !== undefined
                  ? DAYS_OF_WEEK.find(d => d.value === slot.day_of_week)?.label
                  : slot.specific_date}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{slot.start_time} - {slot.end_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs ${
                    slot.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {slot.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSlot(slot)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => slot.id && handleDeleteSlot(slot.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingSlot && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSlot.id ? 'Edit Availability' : 'Add Availability'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingSlot.is_recurring}
                    onCheckedChange={(checked) =>
                      setEditingSlot({ ...editingSlot, is_recurring: checked })
                    }
                  />
                  <span>{editingSlot.is_recurring ? 'Recurring' : 'Specific Date'}</span>
                </div>
              </div>

              {editingSlot.is_recurring ? (
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={editingSlot.day_of_week?.toString()}
                    onValueChange={(value) =>
                      setEditingSlot({ ...editingSlot, day_of_week: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Specific Date</Label>
                  <Input
                    type="date"
                    value={editingSlot.specific_date || ''}
                    onChange={(e) =>
                      setEditingSlot({ ...editingSlot, specific_date: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={editingSlot.start_time}
                  onChange={(e) =>
                    setEditingSlot({ ...editingSlot, start_time: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={editingSlot.end_time}
                  onChange={(e) =>
                    setEditingSlot({ ...editingSlot, end_time: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingSlot.is_available}
                    onCheckedChange={(checked) =>
                      setEditingSlot({ ...editingSlot, is_available: checked })
                    }
                  />
                  <span>{editingSlot.is_available ? 'Available' : 'Unavailable'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setEditingSlot(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleSaveSlot(editingSlot)}>
                {editingSlot.id ? 'Update' : 'Add'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
