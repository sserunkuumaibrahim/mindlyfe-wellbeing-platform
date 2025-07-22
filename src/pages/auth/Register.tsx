
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { IndividualRegistrationForm } from "@/components/auth/IndividualRegistrationForm";
import { TherapistRegistrationForm } from "@/components/auth/TherapistRegistrationForm";
import { OrganizationRegistrationForm } from "@/components/auth/OrganizationRegistrationForm";
import { UserRole } from "@/types/user";
import { toast } from '@/lib/toast';
import { IndividualRegisterDTO, TherapistRegisterDTO, OrganizationRegisterDTO } from '@/types/auth';



type RegisterData = IndividualRegisterDTO | TherapistRegisterDTO | OrganizationRegisterDTO;

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<'role' | 'register' | 'verify'>('role');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('register');
  };

  const handleIndividualRegistration = async (data: IndividualRegisterDTO) => {
    setLoading(true);
    setError('');
    
    try {
      // Extract email, password, and role
      const { email, password, role } = data;
      
      // Remove these fields from the metadata
      const { confirmPassword, ...userData } = data;
      
      // Send registration data to backend
      await signUp(email, password, role, userData);
      setStep('verify');
      toast.success('Registration successful! Please check your email for verification.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTherapistRegistration = async (data: TherapistRegisterDTO) => {
    setLoading(true);
    setError('');
    
    try {
      // Extract email, password, and role
      const { email, password, role } = data;
      
      // Remove these fields from the metadata
      const { confirmPassword, ...userData } = data;
      
      // Send registration data to backend
      await signUp(email, password, role, userData);
      setStep('verify');
      toast.success('Registration successful! Please check your email for verification.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationRegistration = async (data: OrganizationRegisterDTO) => {
    setLoading(true);
    setError('');
    
    try {
      // Extract email, password, and role
      const { email, password, role } = data;
      
      // Remove these fields from the metadata
      const { confirmPassword, ...userData } = data;
      
      // Send registration data to backend
      await signUp(email, password, role, userData);
      setStep('verify');
      toast.success('Registration successful! Please check your email for verification.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRoleSelection = () => {
    setStep('role');
    setSelectedRole(null);
    setError('');
  };

  const getCardTitle = () => {
    switch (step) {
      case 'role':
        return 'Choose Account Type';
      case 'register':
        return 'Create Account';
      case 'verify':
        return 'Verify Email';
      default:
        return 'Register';
    }
  };

  const renderRegistrationForm = () => {
    if (!selectedRole) return null;

    const commonProps = {
      loading,
      error,
      onBack: () => setStep('role'),
    };

    switch (selectedRole) {
      case 'individual':
        return <IndividualRegistrationForm {...commonProps} onSubmit={handleIndividualRegistration} />;
      case 'therapist':
        return <TherapistRegistrationForm {...commonProps} onSubmit={handleTherapistRegistration} />;
      case 'org_admin':
        return <OrganizationRegistrationForm {...commonProps} onSubmit={handleOrganizationRegistration} />;
      default:
        return null;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'role':
        return <RoleSelector onSelectRole={(role: UserRole) => setSelectedRole(role)} />;
      
      case 'register':
        return renderRegistrationForm();
      
      case 'verify':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <p className="text-muted-foreground">
              We've sent a verification email to your address.
              Please check your email and click the verification link to activate your account.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or
              </p>
              <button className="text-primary hover:underline text-sm">
                Resend verification email
              </button>
            </div>
            <Link
              to="/login"
              className="inline-block text-primary hover:underline mt-4"
            >
              Back to login
            </Link>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AuthLayout>
      <AuthCard title={getCardTitle()}>
        {renderStep()}
        
        {step === 'role' && (
          <div className="text-center text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
