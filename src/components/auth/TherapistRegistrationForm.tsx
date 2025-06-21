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
import { FileUpload } from "@/components/ui/FileUpload";
import { TherapistRegisterDTO, GenderType } from "@/types/auth";
import { ArrowLeft, Plus, X, Eye, EyeOff } from "lucide-react";

const therapistSchema = z.object({
  role: z.literal('therapist'),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  first_name: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  phone_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  country: z.string().optional(),
  preferred_language: z.string().optional(),
  national_id_number: z.string().min(1, "National ID is required").max(50, "National ID must be less than 50 characters"),
  license_body: z.string().min(1, "License body is required").max(100, "License body must be less than 100 characters"),
  license_number: z.string().min(1, "License number is required").max(50, "License number must be less than 50 characters"),
  license_expiry_date: z.string({
    required_error: "License expiry date is required",
  }).refine((date) => new Date(date) > new Date(), {
    message: "License expiry date must be in the future"
  }),
  insurance_provider: z.string().min(1, "Insurance provider is required").max(100, "Insurance provider must be less than 100 characters"),
  insurance_policy_number: z.string().min(1, "Insurance policy number is required").max(50, "Insurance policy number must be less than 50 characters"),
  insurance_expiry_date: z.string({
    required_error: "Insurance expiry date is required",
  }).refine((date) => new Date(date) > new Date(), {
    message: "Insurance expiry date must be in the future"
  }),
  years_experience: z.number({
    required_error: "Years of experience is required",
    invalid_type_error: "Please enter a valid number"
  }).min(0, "Years of experience must be 0 or more").max(50, "Years of experience must be less than 50"),
  specializations: z.array(z.string().min(1, "Specialization cannot be empty")).min(1, "At least one specialization is required").max(10, "Maximum 10 specializations allowed"),
  languages_spoken: z.array(z.string().min(1, "Language cannot be empty")).min(1, "At least one language is required").max(10, "Maximum 10 languages allowed"),
  education_background: z.string().max(1000, "Education background must be less than 1000 characters").optional(),
  certifications: z.array(z.string().min(1, "Certification cannot be empty")).max(20, "Maximum 20 certifications allowed").optional(),
  hourly_rate: z.number().min(0, "Hourly rate must be positive").max(10000, "Hourly rate must be less than 10,000").optional(),
  bio: z.string().max(2000, "Bio must be less than 2000 characters").optional(),
  terms_accepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  privacy_accepted: z.boolean().refine(val => val === true, "You must accept the privacy policy"),
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // File states
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);

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
      terms_accepted: false,
      privacy_accepted: false,
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
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      gender: data.gender,
      country: data.country,
      preferred_language: data.preferred_language,
      national_id_number: data.national_id_number,
      license_body: data.license_body,
      license_number: data.license_number,
      license_expiry_date: new Date(data.license_expiry_date),
      insurance_provider: data.insurance_provider,
      insurance_policy_number: data.insurance_policy_number,
      insurance_expiry_date: new Date(data.insurance_expiry_date),
      years_experience: data.years_experience,
      specializations: specializations.filter(s => s.trim()),
      languages_spoken: languages.filter(l => l.trim()),
      education_background: data.education_background,
      certifications: certifications.filter(c => c.trim()),
      hourly_rate: data.hourly_rate,
      bio: data.bio,
      // Add document files
      licenseDocument,
      insuranceDocument,
      idDocument,
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
        <div>
          <h2 className="text-2xl font-bold">Therapist Registration</h2>
          <p className="text-muted-foreground">Join our network of licensed professionals</p>
        </div>
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
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                {...register("phone_number")}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
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

            <div className="space-y-2">
              <Label htmlFor="preferred_language">Preferred Language</Label>
              <Input
                id="preferred_language"
                {...register("preferred_language")}
                placeholder="e.g., English"
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

        {/* Document Uploads */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Required Documents</h3>
          <p className="text-sm text-muted-foreground">
            Please upload the following documents to verify your credentials
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUpload
              label="License Document"
              description="Upload a copy of your professional license"
              onChange={setLicenseDocument}
              required
            />
            
            <FileUpload
              label="Insurance Document"
              description="Upload your professional liability insurance certificate"
              onChange={setInsuranceDocument}
              required
            />
            
            <FileUpload
              label="ID Document"
              description="Upload a copy of your government-issued ID"
              onChange={setIdDocument}
              required
            />
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

        {/* Terms & Conditions */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms_accepted"
              {...register("terms_accepted")}
            />
            <Label htmlFor="terms_accepted" className="text-sm font-normal">
              I agree to the{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a> *
            </Label>
          </div>
          {errors.terms_accepted && (
            <p className="text-sm text-destructive">{errors.terms_accepted.message}</p>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="privacy_accepted"
              {...register("privacy_accepted")}
            />
            <Label htmlFor="privacy_accepted" className="text-sm font-normal">
              I agree to the{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a> *
            </Label>
          </div>
          {errors.privacy_accepted && (
            <p className="text-sm text-destructive">{errors.privacy_accepted.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Creating Account...
            </span>
          ) : (
            "Create Therapist Account"
          )}
        </Button>
      </form>
    </div>
  );
}
