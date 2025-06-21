
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { TherapistRegisterDTO } from '@/types/auth';

const therapistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  country: z.string().optional(),
  preferred_language: z.string().optional(),
  national_id_number: z.string().min(1, 'National ID number is required'),
  license_body: z.string().min(1, 'License body is required'),
  license_number: z.string().min(1, 'License number is required'),
  license_expiry_date: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  insurance_expiry_date: z.string().optional(),
  years_experience: z.number().min(0, 'Years of experience must be 0 or greater'),
  education_background: z.string().optional(),
  bio: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type TherapistFormData = z.infer<typeof therapistSchema>;

interface TherapistRegistrationFormProps {
  onSubmit: (data: TherapistRegisterDTO) => void;
  loading?: boolean;
}

export const TherapistRegistrationForm: React.FC<TherapistRegistrationFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [specializations, setSpecializations] = useState<string[]>(['']);
  const [languages, setLanguages] =  useState<string[]>(['']);
  const [certifications, setCertifications] = useState<string[]>(['']);
  
  // File upload states
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [otherDocuments, setOtherDocuments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TherapistFormData>({
    resolver: zodResolver(therapistSchema),
    defaultValues: {
      years_experience: 0,
    },
  });

  const addSpecialization = () => {
    setSpecializations([...specializations, '']);
  };

  const removeSpecialization = (index: number) => {
    if (specializations.length > 1) {
      setSpecializations(specializations.filter((_, i) => i !== index));
    }
  };

  const updateSpecialization = (index: number, value: string) => {
    const updated = [...specializations];
    updated[index] = value;
    setSpecializations(updated);
  };

  const addLanguage = () => {
    setLanguages([...languages, '']);
  };

  const removeLanguage = (index: number) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((_, i) => i !== index));
    }
  };

  const updateLanguage = (index: number, value: string) => {
    const updated = [...languages];
    updated[index] = value;
    setLanguages(updated);
  };

  const addCertification = () => {
    setCertifications([...certifications, '']);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, value: string) => {
    const updated = [...certifications];
    updated[index] = value;
    setCertifications(updated);
  };

  const handleFormSubmit = (data: TherapistFormData) => {
    const therapistData: TherapistRegisterDTO = {
      ...data,
      role: 'therapist',
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      license_expiry_date: data.license_expiry_date ? new Date(data.license_expiry_date) : undefined,
      insurance_expiry_date: data.insurance_expiry_date ? new Date(data.insurance_expiry_date) : undefined,
      specializations: specializations.filter(s => s.trim() !== ''),
      languages_spoken: languages.filter(l => l.trim() !== ''),
      certifications: certifications.filter(c => c.trim() !== '').length > 0 
        ? certifications.filter(c => c.trim() !== '') 
        : undefined,
      
      // Add file uploads
      licenseDocument,
      insuranceDocument,
      idDocument,
      otherDocuments: otherDocuments.length > 0 ? otherDocuments : undefined,
    };

    onSubmit(therapistData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic information about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Enter your first name"
              />
              {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Enter your last name"
              />
              {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                {...register('phone_number')}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => setValue('gender', value as 'male' | 'female')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="Enter your country"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preferred_language">Preferred Language</Label>
            <Input
              id="preferred_language"
              {...register('preferred_language')}
              placeholder="e.g., English"
              defaultValue="English"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Your professional credentials and experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="national_id_number">National ID Number *</Label>
            <Input
              id="national_id_number"
              {...register('national_id_number')}
              placeholder="Enter your national ID number"
            />
            {errors.national_id_number && <p className="text-sm text-red-600">{errors.national_id_number.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="license_body">License Body *</Label>
              <Input
                id="license_body"
                {...register('license_body')}
                placeholder="e.g., State Board of Psychology"
              />
              {errors.license_body && <p className="text-sm text-red-600">{errors.license_body.message}</p>}
            </div>
            <div>
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                {...register('license_number')}
                placeholder="Enter your license number"
              />
              {errors.license_number && <p className="text-sm text-red-600">{errors.license_number.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="license_expiry_date">License Expiry Date</Label>
            <Input
              id="license_expiry_date"
              type="date"
              {...register('license_expiry_date')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="insurance_provider">Insurance Provider</Label>
              <Input
                id="insurance_provider"
                {...register('insurance_provider')}
                placeholder="e.g., Professional Insurance Company"
              />
            </div>
            <div>
              <Label htmlFor="insurance_policy_number">Insurance Policy Number</Label>
              <Input
                id="insurance_policy_number"
                {...register('insurance_policy_number')}
                placeholder="Enter policy number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="insurance_expiry_date">Insurance Expiry Date</Label>
            <Input
              id="insurance_expiry_date"
              type="date"
              {...register('insurance_expiry_date')}
            />
          </div>

          <div>
            <Label htmlFor="years_experience">Years of Experience *</Label>
            <Input
              id="years_experience"
              type="number"
              min="0"
              {...register('years_experience', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.years_experience && <p className="text-sm text-red-600">{errors.years_experience.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Specializations */}
      <Card>
        <CardHeader>
          <CardTitle>Specializations</CardTitle>
          <CardDescription>Areas of expertise in therapy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {specializations.map((specialization, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={specialization}
                onChange={(e) => updateSpecialization(index, e.target.value)}
                placeholder="e.g., Cognitive Behavioral Therapy"
                className="flex-1"
              />
              {specializations.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeSpecialization(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addSpecialization}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Specialization
          </Button>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Languages Spoken</CardTitle>
          <CardDescription>Languages you can conduct therapy in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {languages.map((language, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={language}
                onChange={(e) => updateLanguage(index, e.target.value)}
                placeholder="e.g., English"
                className="flex-1"
              />
              {languages.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeLanguage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addLanguage}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </Button>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Education, certifications, and bio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="education_background">Education Background</Label>
            <Textarea
              id="education_background"
              {...register('education_background')}
              placeholder="Describe your educational background"
              rows={3}
            />
          </div>

          <div>
            <Label>Professional Certifications</Label>
            {certifications.map((certification, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={certification}
                  onChange={(e) => updateCertification(index, e.target.value)}
                  placeholder="e.g., Certified CBT Therapist"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeCertification(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addCertification}
              className="w-full mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>

          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself and your approach to therapy"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Document Uploads</CardTitle>
          <CardDescription>Upload your professional documents for verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>License Document *</Label>
            <FileUpload
              onFileSelect={setLicenseDocument}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024} // 5MB
            />
            {licenseDocument && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {licenseDocument.name}
              </p>
            )}
          </div>

          <div>
            <Label>Insurance Document</Label>
            <FileUpload
              onFileSelect={setInsuranceDocument}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024}
            />
            {insuranceDocument && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {insuranceDocument.name}
              </p>
            )}
          </div>

          <div>
            <Label>ID Document *</Label>
            <FileUpload
              onFileSelect={setIdDocument}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024}
            />
            {idDocument && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {idDocument.name}
              </p>
            )}
          </div>

          <div>
            <Label>Other Documents</Label>
            <FileUpload
              onFileSelect={(file) => setOtherDocuments([...otherDocuments, file])}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024}
              multiple
            />
            {otherDocuments.length > 0 && (
              <div className="mt-2 space-y-1">
                {otherDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-green-600">{doc.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setOtherDocuments(otherDocuments.filter((_, i) => i !== index))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Therapist Account'}
      </Button>
    </form>
  );
};
