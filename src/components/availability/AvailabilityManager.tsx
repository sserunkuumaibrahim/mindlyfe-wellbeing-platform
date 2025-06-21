
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string;
  is_available: boolean;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState<AvailabilitySlot>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    is_recurring: true,
    is_available: true,
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    if (!user) return;

    try {
      // Use direct SQL query since the table is not in the generated types yet
      const { data, error } = await supabase
        .rpc('get_therapist_availability', { therapist_id_param: user.id });

      if (error) {
        console.error('RPC call failed, falling back to direct query');
        // Fallback to direct query
        const response = await fetch('/api/therapist-availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ therapist_id: user.id }),
        });
        const result = await response.json();
        if (response.ok) {
          setAvailabilitySlots(result.data || []);
        } else {
          throw new Error(result.error);
        }
      } else {
        setAvailabilitySlots(data || []);
      }
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

  const handleSaveSlot = async () => {
    if (!user) return;

    try {
      const slotData = {
        ...formData,
        therapist_id: user.id,
      };

      // Use API endpoint since direct Supabase calls won't work with missing types
      const response = await fetch('/api/save-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slot: slotData,
          isEdit: !!editingSlot?.id,
          slotId: editingSlot?.id
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: `Availability ${editingSlot ? 'updated' : 'added'} successfully`,
      });

      setDialogOpen(false);
      setEditingSlot(null);
      resetForm();
      fetchAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      const response = await fetch('/api/delete-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slotId: id }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Availability slot deleted",
      });

      fetchAvailability();
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast({
        title: "Error",
        description: "Failed to delete availability",
        variant: "destructive",
      });
    }
  };

  const handleToggleAvailability = async (slot: AvailabilitySlot) => {
    if (!slot.id) return;

    try {
      const response = await fetch('/api/toggle-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          slotId: slot.id, 
          isAvailable: !slot.is_available 
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }

      fetchAvailability();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
      is_recurring: true,
      is_available: true,
    });
  };

  const openEditDialog = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setFormData(slot);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingSlot(null);
    resetForm();
    setDialogOpen(true);
  };

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? 'Edit Availability' : 'Add Availability'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="day_of_week">Day of Week</Label>
                <Select
                  value={formData.day_of_week.toString()}
                  onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                />
                <Label htmlFor="is_recurring">Recurring weekly</Label>
              </div>

              {!formData.is_recurring && (
                <div>
                  <Label htmlFor="specific_date">Specific Date</Label>
                  <Input
                    id="specific_date"
                    type="date"
                    value={formData.specific_date || ''}
                    onChange={(e) => setFormData({ ...formData, specific_date: e.target.value })}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="is_available">Available for booking</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSlot}>
                  {editingSlot ? 'Update' : 'Add'} Availability
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {DAYS_OF_WEEK.map((day, dayIndex) => {
          const daySlots = availabilitySlots.filter(slot => slot.day_of_week === dayIndex);
          
          return (
            <Card key={dayIndex}>
              <CardHeader>
                <CardTitle className="text-lg">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                {daySlots.length === 0 ? (
                  <p className="text-muted-foreground">No availability set</p>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{slot.start_time} - {slot.end_time}</span>
                          </div>
                          <Badge variant={slot.is_available ? "default" : "secondary"}>
                            {slot.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                          {slot.is_recurring && (
                            <Badge variant="outline">Recurring</Badge>
                          )}
                          {slot.specific_date && (
                            <Badge variant="outline">{slot.specific_date}</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={slot.is_available}
                            onCheckedChange={() => handleToggleAvailability(slot)}
                          />
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(slot)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => slot.id && handleDeleteSlot(slot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
