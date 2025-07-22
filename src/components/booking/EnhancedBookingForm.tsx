import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Clock, MapPin, Video, Phone, MessageSquare } from 'lucide-react';

interface BookingFormProps {
  therapist: {
    id: string;
    first_name: string;
    last_name: string;
  };
  onSubmit: (bookingData: BookingFormData) => void;
  onCancel: () => void;
}

export interface BookingFormData {
  therapistId: string;
  scheduledAt: string;
  sessionType: 'virtual' | 'in_person';
  durationMinutes: number;
  location?: string;
  notes?: string;
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'video_call';
  urgencyLevel?: 'low' | 'normal' | 'high' | 'urgent';
  sessionPreferences?: string;
}

export default function EnhancedBookingForm({ therapist, onSubmit, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    therapistId: therapist.id,
    scheduledAt: '',
    sessionType: 'virtual',
    durationMinutes: 60,
    location: '',
    notes: '',
    preferredContactMethod: 'email',
    urgencyLevel: 'normal',
    sessionPreferences: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.scheduledAt) {
      return;
    }

    // Convert datetime-local to ISO string
    const scheduledAt = new Date(formData.scheduledAt).toISOString();
    
    onSubmit({
      ...formData,
      scheduledAt
    });
  };

  const updateFormData = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum datetime (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book Session with {therapist.first_name} {therapist.last_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="scheduledAt" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Date & Time *
            </Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => updateFormData('scheduledAt', e.target.value)}
              min={getMinDateTime()}
              required
              className="w-full"
            />
          </div>

          {/* Session Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Session Type *</Label>
            <RadioGroup
              value={formData.sessionType}
              onValueChange={(value) => updateFormData('sessionType', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="virtual" id="virtual" />
                <Label htmlFor="virtual" className="flex items-center gap-2 cursor-pointer">
                  <Video className="h-4 w-4" />
                  Virtual Session (Online)
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="in_person" id="in_person" />
                <Label htmlFor="in_person" className="flex items-center gap-2 cursor-pointer">
                  <MapPin className="h-4 w-4" />
                  In-Person Session
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Location (only for in-person sessions) */}
          {formData.sessionType === 'in_person' && (
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Preferred Location
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="Enter preferred location or address"
                className="w-full"
              />
            </div>
          )}

          {/* Session Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Duration
            </Label>
            <Select
              value={formData.durationMinutes.toString()}
              onValueChange={(value) => updateFormData('durationMinutes', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Contact Method */}
          <div className="space-y-2">
            <Label htmlFor="contact" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Preferred Contact Method
            </Label>
            <Select
              value={formData.preferredContactMethod}
              onValueChange={(value) => updateFormData('preferredContactMethod', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="sms">SMS/Text</SelectItem>
                <SelectItem value="video_call">Video Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Urgency Level */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select
              value={formData.urgencyLevel}
              onValueChange={(value) => updateFormData('urgencyLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can wait a week or more</SelectItem>
                <SelectItem value="normal">Normal - Within a few days</SelectItem>
                <SelectItem value="high">High - Within 24 hours</SelectItem>
                <SelectItem value="urgent">Urgent - ASAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Session Preferences */}
          <div className="space-y-2">
            <Label htmlFor="preferences">Session Preferences</Label>
            <Textarea
              id="preferences"
              value={formData.sessionPreferences}
              onChange={(e) => updateFormData('sessionPreferences', e.target.value)}
              placeholder="Any preferences for the session (e.g., morning person, specific focus areas, communication style...)"
              rows={2}
              className="w-full"
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Any specific topics you'd like to discuss or special requirements..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Session Fee Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Session Fee:</span>
              <span className="text-xl font-bold">UGX 76,000</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Payment will be processed after session confirmation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Book Session
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
