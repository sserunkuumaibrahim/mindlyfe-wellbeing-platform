import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrganizationRegisterDTO, OrganizationType } from "@/types/auth";
import { ArrowLeft } from "lucide-react";

const organizationSchema = z.object({
  role: z.literal('org_admin'),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  first_name: z.string().min(1, "Representative first name is required"),
  last_name: z.string().min(1, "Representative last name is required"),
  phone_number: z.string().optional(),
  date_of_birth: z.date().optional(),
  gender: z.enum(['male', 'female']).optional(),
  country: z.string().optional(),
  preferred_language: z.string().optional(),
  organization_name: z.string().min(1, "Organization name is required"),
  organization_type: z.enum(['private_company', 'school', 'ngo', 'government', 'healthcare', 'other']),
  registration_number: z.string().min(1, "Registration number is required"),
  date_of_establishment: z.date(),
  tax_id_number: z.string().min(1, "Tax ID number is required"),
  num_employees: z.number().min(1, "Number of employees must be at least 1"),
  official_website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  representative_job_title: z.string().min(1, "Job title is required"),
  representative_national_id: z.string().min(1, "Representative national ID is required"),
  service_requirements: z.record(z.any()).optional(),
  billing_contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  billing_contact_phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface OrganizationRegistrationFormProps {
  onSubmit: (data: OrganizationRegisterDTO) => Promise<void>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export function OrganizationRegistrationForm({ onSubmit, loading, error, onBack }: OrganizationRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      role: 'org_admin',
    },
  });

  const onFormSubmit = async (data: z.infer<typeof organizationSchema>) => {
    const formData: OrganizationRegisterDTO = {
      role: 'org_admin',
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
      organization_name: data.organization_name,
      organization_type: data.organization_type,
      registration_number: data.registration_number,
      date_of_establishment: data.date_of_establishment,
      tax_id_number: data.tax_id_number,
      num_employees: data.num_employees,
      official_website: data.official_website || undefined,
      address: data.address,
      city: data.city,
      state_province: data.state_province,
      postal_code: data.postal_code,
      representative_job_title: data.representative_job_title,
      representative_national_id: data.representative_national_id,
      service_requirements: data.service_requirements,
      billing_contact_email: data.billing_contact_email || undefined,
      billing_contact_phone: data.billing_contact_phone,
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
        <h2 className="text-2xl font-bold">Organization Registration</h2>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Representative Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Representative Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Representative First Name *</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="Enter representative's first name"
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Representative Last Name *</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="Enter representative's last name"
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value: 'male' | 'female') => setValue("gender", value)}>
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
              <Label htmlFor="representative_job_title">Job Title *</Label>
              <Input
                id="representative_job_title"
                {...register("representative_job_title")}
                placeholder="e.g., CEO, HR Director, Operations Manager"
              />
              {errors.representative_job_title && (
                <p className="text-sm text-destructive">{errors.representative_job_title.message}</p>
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
              <Label htmlFor="representative_national_id">Representative National ID *</Label>
              <Input
                id="representative_national_id"
                {...register("representative_national_id")}
                placeholder="Enter national ID number"
              />
              {errors.representative_national_id && (
                <p className="text-sm text-destructive">{errors.representative_national_id.message}</p>
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
          </div>
        </div>

        {/* Organization Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Organization Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization_name">Organization Name *</Label>
              <Input
                id="organization_name"
                {...register("organization_name")}
                placeholder="Enter organization name"
              />
              {errors.organization_name && (
                <p className="text-sm text-destructive">{errors.organization_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_type">Organization Type *</Label>
              <Select onValueChange={(value: OrganizationType) => setValue("organization_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private_company">Private Company</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.organization_type && (
                <p className="text-sm text-destructive">{errors.organization_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number *</Label>
              <Input
                id="registration_number"
                {...register("registration_number")}
                placeholder="Enter registration number"
              />
              {errors.registration_number && (
                <p className="text-sm text-destructive">{errors.registration_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_establishment">Date of Establishment *</Label>
              <Input
                id="date_of_establishment"
                type="date"
                {...register("date_of_establishment", { valueAsDate: true })}
              />
              {errors.date_of_establishment && (
                <p className="text-sm text-destructive">{errors.date_of_establishment.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id_number">Tax ID Number *</Label>
              <Input
                id="tax_id_number"
                {...register("tax_id_number")}
                placeholder="Enter tax ID number"
              />
              {errors.tax_id_number && (
                <p className="text-sm text-destructive">{errors.tax_id_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_employees">Number of Employees *</Label>
              <Input
                id="num_employees"
                type="number"
                min="1"
                {...register("num_employees", { valueAsNumber: true })}
                placeholder="Enter number of employees"
              />
              {errors.num_employees && (
                <p className="text-sm text-destructive">{errors.num_employees.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="official_website">Official Website</Label>
              <Input
                id="official_website"
                type="url"
                {...register("official_website")}
                placeholder="https://www.example.com"
              />
              {errors.official_website && (
                <p className="text-sm text-destructive">{errors.official_website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register("country")}
                placeholder="Enter country"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Address Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Enter full address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state_province">State/Province</Label>
              <Input
                id="state_province"
                {...register("state_province")}
                placeholder="Enter state or province"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                {...register("postal_code")}
                placeholder="Enter postal code"
              />
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Billing Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing_contact_email">Billing Contact Email</Label>
              <Input
                id="billing_contact_email"
                type="email"
                {...register("billing_contact_email")}
                placeholder="billing@organization.com"
              />
              {errors.billing_contact_email && (
                <p className="text-sm text-destructive">{errors.billing_contact_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_contact_phone">Billing Contact Phone</Label>
              <Input
                id="billing_contact_phone"
                {...register("billing_contact_phone")}
                placeholder="Enter billing contact phone"
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Create Organization Account"}
        </Button>
      </form>
    </div>
  );
}
