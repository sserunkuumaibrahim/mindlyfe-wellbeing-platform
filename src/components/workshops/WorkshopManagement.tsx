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
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  BookOpen,
  Video,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { WorkshopCard } from './WorkshopCard';
import { cn } from '@/lib/utils';

interface Workshop {
  id: string;
  title: string;
  description: string;
  workshop_type: 'group_therapy' | 'educational' | 'support_group' | 'skills_training';
  facilitator_id: string;
  max_participants: number;
  current_participants: number;
  price_ugx: number;
  scheduled_at: string;
  duration_minutes: number;
  location_type: 'online' | 'in_person' | 'hybrid';
  location_details?: string;
  meeting_url?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  created_at: string;
  facilitator?: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
  enrollments?: WorkshopEnrollment[];
}

interface WorkshopEnrollment {
  id: string;
  workshop_id: string;
  participant_id: string;
  enrolled_at: string;
  status: 'enrolled' | 'attended' | 'cancelled';
  participant?: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

interface WorkshopManagementProps {
  className?: string;
}

export const WorkshopManagement: React.FC<WorkshopManagementProps> = ({ className }) => {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Form state for creating/editing workshops
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workshop_type: 'educational' as const,
    max_participants: 10,
    price_ugx: 0,
    scheduled_at: '',
    duration_minutes: 60,
    location_type: 'online' as const,
    location_details: '',
    meeting_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchWorkshops();
    }
  }, [user]);

  useEffect(() => {
    filterWorkshops();
  }, [workshops, searchTerm, statusFilter, typeFilter, activeTab]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workshops')
        .select(`
          *,
          facilitator:profiles!facilitator_id(
            first_name,
            last_name,
            profile_photo_url
          ),
          enrollments:workshop_enrollments(
            id,
            participant_id,
            enrolled_at,
            status,
            participant:profiles!participant_id(
              first_name,
              last_name,
              profile_photo_url
            )
          )
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      
      const workshopsWithCounts = (data || []).map(workshop => ({
        ...workshop,
        current_participants: workshop.enrollments?.filter(
          (e: any) => e.status === 'enrolled'
        ).length || 0
      }));
      
      setWorkshops(workshopsWithCounts.map((w: any) => ({
        ...w,
        location_type: w.location_type || 'online'
      })));
    } catch (error) {
      console.error('Error fetching workshops:', error);
      toast({
        title: "Error",
        description: "Failed to load workshops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWorkshops = () => {
    let filtered = workshops;

    // Filter by active tab
    if (activeTab === 'my-workshops' && user) {
      filtered = filtered.filter(w => w.facilitator_id === user.id);
    } else if (activeTab === 'enrolled') {
      filtered = filtered.filter(w => 
        w.enrollments?.some(e => e.participant_id === user?.id && e.status === 'enrolled')
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => w.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(w => w.workshop_type === typeFilter);
    }

    setFilteredWorkshops(filtered);
  };

  const handleCreateWorkshop = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workshops')
        .insert({
          ...formData,
          facilitator_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workshop created successfully",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchWorkshops();
    } catch (error) {
      console.error('Error creating workshop:', error);
      toast({
        title: "Error",
        description: "Failed to create workshop",
        variant: "destructive",
      });
    }
  };

  const handleUpdateWorkshop = async () => {
    if (!editingWorkshop) return;

    try {
      const { error } = await supabase
        .from('workshops')
        .update(formData)
        .eq('id', editingWorkshop.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workshop updated successfully",
      });

      setEditingWorkshop(null);
      resetForm();
      fetchWorkshops();
    } catch (error) {
      console.error('Error updating workshop:', error);
      toast({
        title: "Error",
        description: "Failed to update workshop",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkshop = async (workshopId: string) => {
    if (!confirm('Are you sure you want to delete this workshop?')) return;

    try {
      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', workshopId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workshop deleted successfully",
      });

      fetchWorkshops();
    } catch (error) {
      console.error('Error deleting workshop:', error);
      toast({
        title: "Error",
        description: "Failed to delete workshop",
        variant: "destructive",
      });
    }
  };

  const handleEnrollWorkshop = async (workshopId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('workshop_enrollments')
        .insert({
          workshop_id: workshopId,
          participant_id: user.id,
          status: 'enrolled'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully enrolled in workshop",
      });

      fetchWorkshops();
    } catch (error) {
      console.error('Error enrolling in workshop:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in workshop",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      workshop_type: 'educational',
      max_participants: 10,
      price_ugx: 0,
      scheduled_at: '',
      duration_minutes: 60,
      location_type: 'online',
      location_details: '',
      meeting_url: ''
    });
  };

  const openEditDialog = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description,
      workshop_type: workshop.workshop_type as any,
      max_participants: workshop.max_participants,
      price_ugx: workshop.price_ugx,
      scheduled_at: workshop.scheduled_at.slice(0, 16), // Format for datetime-local input
      duration_minutes: workshop.duration_minutes,
      location_type: workshop.location_type as any,
      location_details: workshop.location_details || '',
      meeting_url: workshop.meeting_url || ''
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(price);
  };

  const WorkshopForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Workshop title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Workshop description"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <Select
            value={formData.workshop_type}
            onValueChange={(value: string) => setFormData({ ...formData, workshop_type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="educational">Educational</SelectItem>
              <SelectItem value="group_therapy">Group Therapy</SelectItem>
              <SelectItem value="support_group">Support Group</SelectItem>
              <SelectItem value="skills_training">Skills Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Location Type</label>
          <Select
            value={formData.location_type}
            onValueChange={(value: string) => setFormData({ ...formData, location_type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in_person">In Person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Max Participants</label>
          <Input
            type="number"
            value={formData.max_participants}
            onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
            min="1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Price (UGX)</label>
          <Input
            type="number"
            value={formData.price_ugx}
            onChange={(e) => setFormData({ ...formData, price_ugx: parseInt(e.target.value) })}
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <Input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
            min="15"
            step="15"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Scheduled Date & Time</label>
        <Input
          type="datetime-local"
          value={formData.scheduled_at}
          onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
        />
      </div>
      
      {formData.location_type === 'online' && (
        <div>
          <label className="block text-sm font-medium mb-1">Meeting URL</label>
          <Input
            value={formData.meeting_url}
            onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
            placeholder="https://meet.google.com/..."
          />
        </div>
      )}
      
      {formData.location_type !== 'online' && (
        <div>
          <label className="block text-sm font-medium mb-1">Location Details</label>
          <Input
            value={formData.location_details}
            onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
            placeholder="Address or location details"
          />
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false);
            setEditingWorkshop(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={editingWorkshop ? handleUpdateWorkshop : handleCreateWorkshop}
        >
          {editingWorkshop ? 'Update' : 'Create'} Workshop
        </Button>
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
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
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
          <h1 className="text-3xl font-bold">Workshops</h1>
          <p className="text-gray-600">Manage and participate in therapy workshops</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workshop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workshop</DialogTitle>
            </DialogHeader>
            <WorkshopForm />
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
                  placeholder="Search workshops..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="group_therapy">Group Therapy</SelectItem>
                  <SelectItem value="support_group">Support Group</SelectItem>
                  <SelectItem value="skills_training">Skills Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Workshops</TabsTrigger>
          <TabsTrigger value="my-workshops">My Workshops</TabsTrigger>
          <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredWorkshops.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No workshops found</h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'my-workshops' 
                      ? "You haven't created any workshops yet"
                      : activeTab === 'enrolled'
                      ? "You're not enrolled in any workshops"
                      : "No workshops match your search criteria"
                    }
                  </p>
                  {activeTab === 'my-workshops' && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Workshop
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkshops.map((workshop) => (
                <div key={workshop.id} className="relative">
                  <WorkshopCard
                    workshop={workshop}
                    onEnroll={handleEnrollWorkshop}
                    showEnrollButton={!workshop.enrollments?.some(
                      e => e.participant_id === user?.id && e.status === 'enrolled'
                    )}
                  />
                  
                  {/* Edit/Delete buttons for workshop owner */}
                  {workshop.facilitator_id === user?.id && (
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditDialog(workshop)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteWorkshop(workshop.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Workshop Dialog */}
      <Dialog open={!!editingWorkshop} onOpenChange={(open) => !open && setEditingWorkshop(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Workshop</DialogTitle>
          </DialogHeader>
          <WorkshopForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkshopManagement;