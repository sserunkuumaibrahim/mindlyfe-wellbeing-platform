import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TherapistRegisterDTO, GenderType } from "@/types/auth";
import { ArrowLeft, Plus, X } from "lucide-react";

const therapistSchema = z.object({
  role: z.literal('therapist'),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_number: z.string().optional(),
  date_of_birth: z.date().optional(),
  gender: z.enum(['male', 'female']).optional(),
  country: z.string().optional(),
  preferred_language: z.string().optional(),
  national_id_number: z.string().min(1, "National ID is required"),
  license_body: z.string().min(1, "License body is required"),
  license_number: z.string().min(1, "License number is required"),
  license_expiry_date: z.date(),
  insurance_provider: z.string().min(1, "Insurance provider is required"),
  insurance_policy_number: z.string().min(1, "Insurance policy number is required"),
  insurance_expiry_date: z.date(),
  years_experience: z.number().min(0, "Years of experience must be 0 or more"),
  specializations: z.array(z.string()).min(1, "At least one specialization is required"),
  languages_spoken: z.array(z.string()).min(1, "At least one language is required"),
  education_background: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  hourly_rate: z.number().min(0).optional(),
  bio: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface TherapistRegistrationFormProps {
  onSubmit: (data: TherapistRegisterDTO) => Promise<void>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export function TherapistRegistrationForm({ onSubmit, loading, error, onBack }: TherapistRegistrationFormProps) {
  const [specializations, setSpecializations] = useState<string[]>(['']);
  const [languages, setLanguages] = useState<string[]>(['']);
  const [certifications, setCertifications] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof therapistSchema>>({
    resolver: zodResolver(therapistSchema),
    defaultValues: {
      role: 'therapist',
      specializations: [],
      languages_spoken: [],
      certifications: [],
    },
  });

  const addSpecialization = () => {
    setSpecializations([...specializations, '']);
  };

  const removeSpecialization = (index: number) => {
    const newSpecs = specializations.filter((_, i) => i !== index);
    setSpecializations(newSpecs);
    setValue('specializations', newSpecs.filter(s => s.trim()));
  };

  const updateSpecialization = (index: number, value: string) => {
    const newSpecs = [...specializations];
    newSpecs[index] = value;
    setSpecializations(newSpecs);
    setValue('specializations', newSpecs.filter(s => s.trim()));
  };

  const addLanguage = () => {
    setLanguages([...languages, '']);
  };

  const removeLanguage = (index: number) => {
    const newLangs = languages.filter((_, i) => i !== index);
    setLanguages(newLangs);
    setValue('languages_spoken', newLangs.filter(l => l.trim()));
  };

  const updateLanguage = (index: number, value: string) => {
    const newLangs = [...languages];
    newLangs[index] = value;
    setLanguages(newLangs);
    setValue('languages_spoken', newLangs.filter(l => l.trim()));
  };

  const addCertification = () => {
    setCertifications([...certifications, '']);
  };

  const removeCertification = (index: number) => {
    const newCerts = certifications.filter((_, i) => i !== index);
    setCertifications(newCerts);
    setValue('certifications', newCerts.filter(c => c.trim()));
  };

  const updateCertification = (index: number, value: string) => {
    const newCerts = [...certifications];
    newCerts[index] = value;
    setCertifications(newCerts);
    setValue('certifications', newCerts.filter(c => c.trim()));
  };

  const onFormSubmit = async (data: z.infer<typeof therapistSchema>) => {
    const formData: TherapistRegisterDTO = {
      role: 'therapist',
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      country: data.country,
      preferred_language: data.preferred_language,
      national_id_number: data.national_id_number,
      license_body: data.license_body,
      license_number: data.license_number,
      license_expiry_date: data.license_expiry_date,
      insurance_provider: data.insurance_provider,
      insurance_policy_number: data.insurance_policy_number,
      insurance_expiry_date: data.insurance_expiry_date,
      years_experience: data.years_experience,
      specializations: specializations.filter(s => s.trim()),
      languages_spoken: languages.filter(l => l.trim()),
      education_background: data.education_background,
      certifications: certifications.filter(c => c.trim()),
      hourly_rate: data.hourly_rate,
      bio: data.bio,
    };
    await onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Therapist Registration</h2>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="Enter your first name"
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="Enter your last name"
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                {...register("phone_number")}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value: GenderType) => setValue("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register("date_of_birth", { valueAsDate: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register("country")}
                placeholder="Enter your country"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Professional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="national_id_number">National ID Number *</Label>
              <Input
                id="national_id_number"
                {...register("national_id_number")}
                placeholder="Enter your national ID"
              />
              {errors.national_id_number && (
                <p className="text-sm text-destructive">{errors.national_id_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_body">License Body *</Label>
              <Input
                id="license_body"
                {...register("license_body")}
                placeholder="e.g., State Board of Psychology"
              />
              {errors.license_body && (
                <p className="text-sm text-destructive">{errors.license_body.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                {...register("license_number")}
                placeholder="Enter your license number"
              />
              {errors.license_number && (
                <p className="text-sm text-destructive">{errors.license_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_expiry_date">License Expiry Date *</Label>
              <Input
                id="license_expiry_date"
                type="date"
                {...register("license_expiry_date", { valueAsDate: true })}
              />
              {errors.license_expiry_date && (
                <p className="text-sm text-destructive">{errors.license_expiry_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_provider">Insurance Provider *</Label>
              <Input
                id="insurance_provider"
                {...register("insurance_provider")}
                placeholder="Enter insurance provider"
              />
              {errors.insurance_provider && (
                <p className="text-sm text-destructive">{errors.insurance_provider.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_policy_number">Insurance Policy Number *</Label>
              <Input
                id="insurance_policy_number"
                {...register("insurance_policy_number")}
                placeholder="Enter policy number"
              />
              {errors.insurance_policy_number && (
                <p className="text-sm text-destructive">{errors.insurance_policy_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_expiry_date">Insurance Expiry Date *</Label>
              <Input
                id="insurance_expiry_date"
                type="date"
                {...register("insurance_expiry_date", { valueAsDate: true })}
              />
              {errors.insurance_expiry_date && (
                <p className="text-sm text-destructive">{errors.insurance_expiry_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience *</Label>
              <Input
                id="years_experience"
                type="number"
                min="0"
                {...register("years_experience", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.years_experience && (
                <p className="text-sm text-destructive">{errors.years_experience.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                {...register("hourly_rate", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Specializations *</Label>
            <Button type="button" onClick={addSpecialization} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Specialization
            </Button>
          </div>
          {specializations.map((spec, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={spec}
                onChange={(e) => updateSpecialization(index, e.target.value)}
                placeholder="e.g., Anxiety, Depression, PTSD"
              />
              {specializations.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeSpecialization(index)}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {errors.specializations && (
            <p className="text-sm text-destructive">{errors.specializations.message}</p>
          )}
        </div>

        {/* Languages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Languages Spoken *</Label>
            <Button type="button" onClick={addLanguage} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </div>
          {languages.map((lang, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={lang}
                onChange={(e) => updateLanguage(index, e.target.value)}
                placeholder="e.g., English, Spanish, French"
              />
              {languages.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {errors.languages_spoken && (
            <p className="text-sm text-destructive">{errors.languages_spoken.message}</p>
          )}
        </div>

        {/* Certifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Certifications</Label>
            <Button type="button" onClick={addCertification} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>
          {certifications.map((cert, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={cert}
                onChange={(e) => updateCertification(index, e.target.value)}
                placeholder="e.g., CBT Certification, EMDR Training"
              />
              <Button
                type="button"
                onClick={() => removeCertification(index)}
                size="sm"
                variant="outline"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="education_background">Education Background</Label>
            <Textarea
              id="education_background"
              {...register("education_background")}
              placeholder="Describe your educational background..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell us about yourself and your approach to therapy..."
              rows={4}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Create Therapist Account"}
        </Button>
      </form>
    </div>
  );
}
