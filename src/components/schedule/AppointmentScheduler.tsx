import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Video, 
  MapPin, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addWeeks, subWeeks, startOfDay, endOfDay } from 'date-fns';

interface Appointment {
  id: string;
  client_id: string;
  therapist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: 'individual' | 'group' | 'family' | 'couples' | 'assessment';
  session_format: 'in_person' | 'video_call' | 'phone_call';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  location?: string;
  session_notes?: string;
  session_fee?: number;
  reminder_sent?: boolean;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    profile_photo_url?: string;
  };
  therapist?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_photo_url?: string;
  };
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  appointment?: Appointment;
}

interface AppointmentFormData {
  client_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: Appointment['session_type'];
  session_format: Appointment['session_format'];
  location: string;
  session_notes: string;
  session_fee: number;
}

interface SessionData {
  client_id: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    profile_photo_url?: string;
  };
}

interface AppointmentSchedulerProps {
  className?: string;
  viewMode?: 'calendar' | 'list';
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ 
  className,
  viewMode: initialViewMode = 'calendar'
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    profile_photo_url?: string;
  }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>(initialViewMode);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Form state
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>({
    client_id: '',
    scheduled_at: '',
    duration_minutes: 60,
    session_type: 'individual',
    session_format: 'video_call',
    location: '',
    session_notes: '',
    session_fee: 0
  });

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchClients();
    }
  }, [user, currentWeek]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const weekStart = startOfWeek(currentWeek);
      const weekEnd = endOfWeek(currentWeek);
      
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select(`
          id,
          client_id,
          therapist_id,
          scheduled_at,
          actual_duration_minutes,
          session_type,
          session_format,
          status,
          location,
          session_notes,
          session_fee,
          reminder_sent,
          client:profiles!client_id(
            id,
            first_name,
            last_name,
            email,
            phone,
            profile_photo_url
          ),
          therapist:profiles!therapist_id(
            id,
            first_name,
            last_name,
            email,
            profile_photo_url
          )
        `)
        .eq('therapist_id', user.id)
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      const formattedAppointments: Appointment[] = data?.map(appointment => ({
        id: appointment.id,
        client_id: appointment.client_id,
        therapist_id: appointment.therapist_id,
        scheduled_at: appointment.scheduled_at,
        duration_minutes: appointment.actual_duration_minutes || 60,
        session_type: appointment.session_type as Appointment['session_type'],
        session_format: appointment.session_format as Appointment['session_format'] || 'video_call',
        status: appointment.status as Appointment['status'],
        location: appointment.location,
        session_notes: appointment.session_notes,
        session_fee: appointment.session_fee,
        reminder_sent: appointment.reminder_sent,
        client: appointment.client,
        therapist: appointment.therapist
      })) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    if (!user) return;

    try {
      // Get unique clients from therapy sessions
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select(`
          client_id,
          client:profiles!client_id(
            id,
            first_name,
            last_name,
            email,
            phone,
            profile_photo_url
          )
        `)
        .eq('therapist_id', user.id);

      if (error) throw error;

      // Remove duplicates and extract client data
      const uniqueClients = data?.reduce((acc: typeof clients, session: SessionData) => {
        const existingClient = acc.find(client => client.id === session.client_id);
        if (!existingClient && session.client) {
          acc.push(session.client);
        }
        return acc;
      }, [] as typeof clients) || [];

      setClients(uniqueClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleCreateAppointment = async () => {
    if (!user || !appointmentForm.client_id || !appointmentForm.scheduled_at) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .insert({
          client_id: appointmentForm.client_id,
          therapist_id: user.id,
          scheduled_at: appointmentForm.scheduled_at,
          actual_duration_minutes: appointmentForm.duration_minutes,
          session_type: appointmentForm.session_type,
          session_format: appointmentForm.session_format,
          status: 'scheduled',
          location: appointmentForm.location,
          session_notes: appointmentForm.session_notes,
          session_fee: appointmentForm.session_fee
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({
          scheduled_at: appointmentForm.scheduled_at,
          actual_duration_minutes: appointmentForm.duration_minutes,
          session_type: appointmentForm.session_type,
          session_format: appointmentForm.session_format,
          location: appointmentForm.location,
          session_notes: appointmentForm.session_notes,
          session_fee: appointmentForm.session_fee
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setSelectedAppointment(null);
      resetForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment marked as completed",
      });
      
      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast({
        title: "Error",
        description: "Failed to complete appointment",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setAppointmentForm({
      client_id: '',
      scheduled_at: '',
      duration_minutes: 60,
      session_type: 'individual',
      session_format: 'video_call',
      location: '',
      session_notes: '',
      session_fee: 0
    });
  };

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      client_id: appointment.client_id,
      scheduled_at: appointment.scheduled_at,
      duration_minutes: appointment.duration_minutes,
      session_type: appointment.session_type,
      session_format: appointment.session_format,
      location: appointment.location || '',
      session_notes: appointment.session_notes || '',
      session_fee: appointment.session_fee || 0
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video_call':
        return <Video className="h-4 w-4" />;
      case 'phone_call':
        return <Phone className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    const slotDuration = 60; // 60 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + slotDuration);

      const appointment = appointments.find(apt => 
        isSameDay(new Date(apt.scheduled_at), date) &&
        new Date(apt.scheduled_at).getHours() === hour
      );

      slots.push({
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_available: !appointment,
        appointment
      });
    }

    return slots;
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek);
    return eachDayOfInterval({
      start,
      end: endOfWeek(start)
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      `${appointment.client.first_name} ${appointment.client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = typeFilter === 'all' || appointment.session_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const AppointmentCard: React.FC<{ appointment: Appointment; compact?: boolean }> = ({ appointment, compact = false }) => (
    <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", compact && "p-2")}>
      <CardContent className={cn("p-4", compact && "p-2")}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className={cn("h-10 w-10", compact && "h-8 w-8")}>
              <AvatarImage src={appointment.client.profile_photo_url} />
              <AvatarFallback className={compact ? "text-xs" : ""}>
                {appointment.client.first_name[0]}{appointment.client.last_name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h4 className={cn("font-medium", compact && "text-sm")}>
                {appointment.client.first_name} {appointment.client.last_name}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                {getSessionTypeIcon(appointment.session_format)}
                <span className={cn("text-gray-600", compact ? "text-xs" : "text-sm")}>
                  {appointment.session_type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className={cn("text-gray-600", compact ? "text-xs" : "text-sm")}>
                {format(new Date(appointment.scheduled_at), 'h:mm a')} • {appointment.duration_minutes}min
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.replace('_', ' ').toUpperCase()}
            </Badge>
            
            {!compact && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => openEditDialog(appointment)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    {appointment.status === 'scheduled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleCompleteAppointment(appointment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    
                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        
        {appointment.session_notes && !compact && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            {appointment.session_notes}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CalendarView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-semibold">
              {format(startOfWeek(currentWeek), 'MMMM d')} - {format(endOfWeek(currentWeek), 'MMMM d, yyyy')}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayAppointments = appointments.filter(apt => 
              isSameDay(new Date(apt.scheduled_at), day)
            );
            
            return (
              <div key={index} className="space-y-2">
                <div className="text-center">
                  <h4 className="font-medium">{format(day, 'EEE')}</h4>
                  <p className={cn(
                    "text-sm",
                    isSameDay(day, new Date()) ? "text-blue-600 font-semibold" : "text-gray-600"
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
                
                <div className="space-y-2 min-h-[400px]">
                  {dayAppointments.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-8">
                      No appointments
                    </div>
                  ) : (
                    dayAppointments.map(appointment => (
                      <AppointmentCard 
                        key={appointment.id} 
                        appointment={appointment} 
                        compact 
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ListView = () => (
    <div className="space-y-4">
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? "No appointments match your filters"
                  : "You don't have any appointments scheduled"
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );

  const AppointmentForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium mb-1">Client</label>
          <Select
            value={appointmentForm.client_id}
            onValueChange={(value) => setAppointmentForm({ ...appointmentForm, client_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date & Time</label>
          <Input
            type="datetime-local"
            value={appointmentForm.scheduled_at ? format(new Date(appointmentForm.scheduled_at), "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => setAppointmentForm({ 
              ...appointmentForm, 
              scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : ''
            })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <Select
            value={appointmentForm.duration_minutes.toString()}
            onValueChange={(value) => setAppointmentForm({ ...appointmentForm, duration_minutes: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Session Type</label>
          <Select
            value={appointmentForm.session_type}
            onValueChange={(value) => setAppointmentForm({ ...appointmentForm, session_type: value as Appointment['session_type'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="couples">Couples</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Session Format</label>
          <Select
            value={appointmentForm.session_format}
            onValueChange={(value) => setAppointmentForm({ ...appointmentForm, session_format: value as Appointment['session_format'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video_call">Video Call</SelectItem>
              <SelectItem value="phone_call">Phone Call</SelectItem>
              <SelectItem value="in_person">In Person</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Input
            value={appointmentForm.location}
            onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
            placeholder="Meeting room, video link, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Session Fee (UGX)</label>
          <Input
            type="number"
            value={appointmentForm.session_fee}
            onChange={(e) => setAppointmentForm({ ...appointmentForm, session_fee: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Session Notes</label>
        <Textarea
          value={appointmentForm.session_notes}
          onChange={(e) => setAppointmentForm({ ...appointmentForm, session_notes: e.target.value })}
          placeholder="Add any notes or special instructions"
          rows={3}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointment Scheduler</h1>
          <p className="text-gray-600">Manage your therapy sessions and appointments</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <AppointmentForm />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateAppointment}>
                  Schedule Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="couples">Couples</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {viewMode === 'calendar' ? <CalendarView /> : <ListView />}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm isEdit />
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedAppointment(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAppointment}>
              Update Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentScheduler;