import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, X, Plus, Eye, EyeOff } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { TherapistRegisterDTO } from '@/types/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const therapistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
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
  terms_accepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  privacy_accepted: z.boolean().refine(val => val === true, "You must accept the privacy policy"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type TherapistFormData = z.infer<typeof therapistSchema>;

interface TherapistRegistrationFormProps {
  onSubmit: (data: TherapistRegisterDTO) => Promise<void>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export const TherapistRegistrationForm: React.FC<TherapistRegistrationFormProps> = ({
  onSubmit,
  loading,
  error,
  onBack,
}) => {
  const [specializations, setSpecializations] = useState<string[]>(['']);
  const [languages, setLanguages] =  useState<string[]>(['']);
  const [certifications, setCertifications] = useState<string[]>(['']);
  
  // File upload states
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [otherDocuments, setOtherDocuments] = useState<File[]>([]);

  const form = useForm<TherapistFormData>({
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

  const handleFormSubmit = async (data: z.infer<typeof therapistSchema>) => {

    if (!licenseDocument || !idDocument) {
      return;
    }

    const fileToBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    try {
      const [license_document, id_document, insurance_document, ...other_documents_base64] = await Promise.all([
        fileToBase64(licenseDocument),
        fileToBase64(idDocument),
        insuranceDocument ? fileToBase64(insuranceDocument) : Promise.resolve(undefined),
        ...otherDocuments.map(fileToBase64),
      ]);

      const therapistData: TherapistRegisterDTO = {
        ...data,
        role: 'therapist',
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        license_expiry_date: data.license_expiry_date ? new Date(data.license_expiry_date) : undefined,
        insurance_expiry_date: data.insurance_expiry_date ? new Date(data.insurance_expiry_date) : undefined,
        specializations: specializations.filter(s => s.trim() !== ''),
        languages_spoken: languages.filter(l => l.trim() !== ''),
        certifications: certifications.filter(c => c.trim() !== ''),
        documents: {
          license_document,
          id_document,
          insurance_document,
          other_documents: other_documents_base64,
        },
      };

      await onSubmit(therapistData);
    } catch (error) {
      console.error("Error preparing therapist registration data:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic information about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          <FormField
            control={form.control}
            name="national_id_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>National ID Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your national ID number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="license_body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Body *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., State Board of Psychology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your license number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="license_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="insurance_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Provider</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Professional Insurance Company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="insurance_policy_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Policy Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter policy number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="insurance_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="years_experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value))}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="education_background"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education Background</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your educational background" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us about yourself and your approach to therapy" rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            <FileUpload
              label="License Document *"
              onChange={setLicenseDocument}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024}
              required
            />
            {licenseDocument && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {licenseDocument.name}
              </p>
            )}
          </div>

          <div>
            <FileUpload
              label="Insurance Document"
              onChange={setInsuranceDocument}
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
            <FileUpload
              label="ID Document *"
              onChange={setIdDocument}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024}
              required
            />
            {idDocument && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {idDocument.name}
              </p>
            )}
          </div>

          <div>
            <FileUpload
              label="Other Documents"
              onChange={(file) => file && setOtherDocuments([...otherDocuments, file])}
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

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Therapist Account'}
        </Button>
      </div>
    </form>
  </Form>
  );
};
