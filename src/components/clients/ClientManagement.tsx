import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Calendar, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  Star,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_photo_url?: string;
  created_at: string;
  last_session_at?: string;
  total_sessions: number;
  status: 'active' | 'inactive' | 'on_hold';
  notes?: string;
  sessions?: TherapySession[];
  documents?: ClientDocument[];
}

interface TherapySession {
  id: string;
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  session_type: string;
  duration_minutes?: number;
  session_notes?: string;
  session_fee?: number;
}

interface ClientDocument {
  id: string;
  title: string;
  document_type: 'assessment' | 'treatment_plan' | 'progress_note' | 'consent_form' | 'other';
  file_url: string;
  uploaded_at: string;
}

interface ClientProgress {
  client_id: string;
  assessment_date: string;
  mood_score: number;
  anxiety_score: number;
  depression_score: number;
  overall_wellbeing: number;
  goals_progress: string;
  notes: string;
}

interface ClientManagementProps {
  className?: string;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({ className }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form state for adding new client
  const [newClientForm, setNewClientForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: ''
  });

  // Progress tracking form
  const [progressForm, setProgressForm] = useState({
    mood_score: 5,
    anxiety_score: 5,
    depression_score: 5,
    overall_wellbeing: 5,
    goals_progress: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter]);

  const fetchClients = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all therapy sessions for this therapist to identify clients
      const { data: sessions, error: sessionsError } = await supabase
        .from('therapy_sessions')
        .select(`
          client_id,
          scheduled_at,
          status,
          session_type,
          actual_duration_minutes,
          session_notes,
          session_fee,
          client:profiles!client_id(
            id,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            profile_photo_url,
            created_at
          )
        `)
        .eq('therapist_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Group sessions by client and create client objects
      const clientMap = new Map<string, Client>();
      
      sessions?.forEach(session => {
        const clientId = (session as any).client_id;
        const clientData = (session as any).client;
        
        if (!clientMap.has(clientId)) {
          const lastSession = sessions
            .filter(s => (s as any).client_id === clientId && (s as any).status === 'completed')
            .sort((a, b) => new Date((b as any).scheduled_at).getTime() - new Date((a as any).scheduled_at).getTime())[0];
          
          const totalSessions = sessions.filter(s => (s as any).client_id === clientId).length;
          
          clientMap.set(clientId, {
            ...clientData,
            total_sessions: totalSessions,
            last_session_at: (lastSession as any)?.scheduled_at,
            status: 'active', // Default status
            sessions: [],
            documents: []
          });
        }
        
        // Add session to client's sessions array
        const client = clientMap.get(clientId)!;
        client.sessions!.push({
          id: (session as any).id || '',
          scheduled_at: (session as any).scheduled_at,
          status: (session as any).status,
          session_type: (session as any).session_type,
          duration_minutes: (session as any).actual_duration_minutes,
          session_notes: (session as any).session_notes,
          session_fee: (session as any).session_fee
        });
      });

      const clientsArray = Array.from(clientMap.values());
      setClients(clientsArray);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(client => 
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  };

  const handleAddClient = async () => {
    try {
      // In a real implementation, you would create a new user account
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Client invitation sent successfully",
      });
      
      setIsAddClientDialogOpen(false);
      resetNewClientForm();
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
    }
  };

  const handleAddProgress = async () => {
    if (!selectedClient) return;

    try {
      const { data, error } = await supabase
        .from('client_progress')
        .insert({
          client_id: selectedClient.id,
          therapist_id: user?.id,
          assessment_date: new Date().toISOString(),
          ...progressForm
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Progress entry added successfully",
      });
      
      setIsProgressDialogOpen(false);
      resetProgressForm();
    } catch (error) {
      console.error('Error adding progress:', error);
      toast({
        title: "Error",
        description: "Failed to add progress entry",
        variant: "destructive",
      });
    }
  };

  const resetNewClientForm = () => {
    setNewClientForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: ''
    });
  };

  const resetProgressForm = () => {
    setProgressForm({
      mood_score: 5,
      anxiety_score: 5,
      depression_score: 5,
      overall_wellbeing: 5,
      goals_progress: '',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ClientCard: React.FC<{ client: Client }> = ({ client }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedClient(client)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={client.profile_photo_url} />
              <AvatarFallback>
                {client.first_name[0]}{client.last_name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-lg">
                {client.first_name} {client.last_name}
              </h3>
              <p className="text-sm text-gray-600">{client.email}</p>
              {client.phone && (
                <p className="text-sm text-gray-600">{client.phone}</p>
              )}
            </div>
          </div>
          
          <Badge className={getStatusColor(client.status)}>
            {client.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total Sessions</p>
            <p className="font-semibold">{client.total_sessions}</p>
          </div>
          
          <div>
            <p className="text-gray-500">Last Session</p>
            <p className="font-semibold">
              {client.last_session_at 
                ? formatDistanceToNow(new Date(client.last_session_at), { addSuffix: true })
                : 'Never'
              }
            </p>
          </div>
          
          <div>
            <p className="text-gray-500">Client Since</p>
            <p className="font-semibold">
              {format(new Date(client.created_at), 'MMM yyyy')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ClientDetailView: React.FC<{ client: Client }> = ({ client }) => (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={client.profile_photo_url} />
            <AvatarFallback className="text-lg">
              {client.first_name[0]}{client.last_name[0]}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-2xl font-bold">
              {client.first_name} {client.last_name}
            </h2>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={getStatusColor(client.status)}>
                {client.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">
                Client since {format(new Date(client.created_at), 'MMMM yyyy')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsProgressDialogOpen(true)}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Add Progress
          </Button>
        </div>
      </div>

      {/* Client Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{client.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.date_of_birth && (
                  <div>
                    <span className="text-sm text-gray-500">Date of Birth</span>
                    <p>{format(new Date(client.date_of_birth), 'MMMM d, yyyy')}</p>
                  </div>
                )}
                {client.gender && (
                  <div>
                    <span className="text-sm text-gray-500">Gender</span>
                    <p className="capitalize">{client.gender}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Emergency Contact */}
            {(client.emergency_contact_name || client.emergency_contact_phone) && (
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {client.emergency_contact_name && (
                    <div>
                      <span className="text-sm text-gray-500">Name</span>
                      <p>{client.emergency_contact_name}</p>
                    </div>
                  )}
                  {client.emergency_contact_phone && (
                    <div>
                      <span className="text-sm text-gray-500">Phone</span>
                      <p>{client.emergency_contact_phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Session Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Session Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Total Sessions</span>
                    <p className="text-2xl font-bold">{client.total_sessions}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Completed</span>
                    <p className="text-2xl font-bold text-green-600">
                      {client.sessions?.filter(s => s.status === 'completed').length || 0}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Last Session</span>
                  <p>
                    {client.last_session_at 
                      ? format(new Date(client.last_session_at), 'MMMM d, yyyy')
                      : 'No sessions yet'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Session History</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>
          
          <div className="space-y-3">
            {client.sessions?.map((session, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{session.session_type.replace('_', ' ').toUpperCase()}</h4>
                        <Badge className={getSessionStatusColor(session.status)}>
                          {session.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(session.scheduled_at), 'MMMM d, yyyy \\at h:mm a')}
                      </p>
                      {session.duration_minutes && (
                        <p className="text-sm text-gray-600">
                          Duration: {session.duration_minutes} minutes
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {session.session_fee && (
                        <span className="text-sm font-medium">
                          UGX {session.session_fee.toLocaleString()}
                        </span>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {session.session_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm">{session.session_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No sessions recorded yet</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Progress Tracking</h3>
            <Button size="sm" onClick={() => setIsProgressDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Progress tracking feature coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Documents</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No documents uploaded yet</p>
          </div>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Clinical Notes</h3>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Notes
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <Textarea
                value={client.notes || ''}
                placeholder="Add clinical notes, observations, or treatment plans..."
                rows={10}
                readOnly
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
      {!selectedClient ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Client Management</h1>
              <p className="text-gray-600">Manage your client relationships and track progress</p>
            </div>
            
            <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <Input
                        value={newClientForm.first_name}
                        onChange={(e) => setNewClientForm({ ...newClientForm, first_name: e.target.value })}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <Input
                        value={newClientForm.last_name}
                        onChange={(e) => setNewClientForm({ ...newClientForm, last_name: e.target.value })}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input
                        type="email"
                        value={newClientForm.email}
                        onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <Input
                        value={newClientForm.phone}
                        onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date of Birth</label>
                      <Input
                        type="date"
                        value={newClientForm.date_of_birth}
                        onChange={(e) => setNewClientForm({ ...newClientForm, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gender</label>
                      <Select
                        value={newClientForm.gender}
                        onValueChange={(value) => setNewClientForm({ ...newClientForm, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <Input
                      value={newClientForm.address}
                      onChange={(e) => setNewClientForm({ ...newClientForm, address: e.target.value })}
                      placeholder="Full address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
                      <Input
                        value={newClientForm.emergency_contact_name}
                        onChange={(e) => setNewClientForm({ ...newClientForm, emergency_contact_name: e.target.value })}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Emergency Contact Phone</label>
                      <Input
                        value={newClientForm.emergency_contact_phone}
                        onChange={(e) => setNewClientForm({ ...newClientForm, emergency_contact_phone: e.target.value })}
                        placeholder="Emergency contact phone"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Initial Notes</label>
                    <Textarea
                      value={newClientForm.notes}
                      onChange={(e) => setNewClientForm({ ...newClientForm, notes: e.target.value })}
                      placeholder="Initial assessment notes or observations"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddClientDialogOpen(false);
                        resetNewClientForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddClient}>
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search clients..."
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Grid */}
          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? "No clients match your search criteria"
                      : "You haven't added any clients yet"
                    }
                  </p>
                  <Button onClick={() => setIsAddClientDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => setSelectedClient(null)}
            className="mb-4"
          >
            ← Back to Clients
          </Button>
          
          {/* Client Detail View */}
          <ClientDetailView client={selectedClient} />
        </>
      )}

      {/* Progress Dialog */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Progress Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mood Score (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={progressForm.mood_score}
                  onChange={(e) => setProgressForm({ ...progressForm, mood_score: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Anxiety Score (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={progressForm.anxiety_score}
                  onChange={(e) => setProgressForm({ ...progressForm, anxiety_score: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Depression Score (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={progressForm.depression_score}
                  onChange={(e) => setProgressForm({ ...progressForm, depression_score: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Overall Wellbeing (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={progressForm.overall_wellbeing}
                  onChange={(e) => setProgressForm({ ...progressForm, overall_wellbeing: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Goals Progress</label>
              <Textarea
                value={progressForm.goals_progress}
                onChange={(e) => setProgressForm({ ...progressForm, goals_progress: e.target.value })}
                placeholder="Describe progress towards treatment goals"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={progressForm.notes}
                onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })}
                placeholder="Additional observations or notes"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsProgressDialogOpen(false);
                  resetProgressForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddProgress}>
                Add Progress Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagement;