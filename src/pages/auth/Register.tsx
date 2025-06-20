
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { IndividualRegistrationForm } from "@/components/auth/IndividualRegistrationForm";
import { TherapistRegistrationForm } from "@/components/auth/TherapistRegistrationForm";
import { OrganizationRegistrationForm } from "@/components/auth/OrganizationRegistrationForm";
import { UserRole } from "@/types/user";
import { RegisterDTO } from "@/types/auth";

type RegistrationStep = 'role-selection' | 'registration' | 'verification';

export default function Register() {
  const [step, setStep] = useState<RegistrationStep>('role-selection');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string>('');
  const { register, loading, error, clearError } = useAuthStore();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('registration');
  };

  const handleRegistration = async (data: RegisterDTO) => {
    setEmail(data.email);
    try {
      await register(data);
      setStep('verification');
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleBackToRoleSelection = () => {
    setStep('role-selection');
    setSelectedRole(null);
    if (error) clearError();
  };

  const getCardTitle = () => {
    switch (step) {
      case 'role-selection':
        return 'Choose Account Type';
      case 'registration':
        return 'Create Account';
      case 'verification':
        return 'Verify Email';
      default:
        return 'Register';
    }
  };

  const renderRegistrationForm = () => {
    const commonProps = {
      onSubmit: handleRegistration,
      loading,
      error,
      onBack: handleBackToRoleSelection,
    };

    switch (selectedRole) {
      case 'individual':
        return <IndividualRegistrationForm {...commonProps} />;
      case 'therapist':
        return <TherapistRegistrationForm {...commonProps} />;
      case 'org_admin':
        return <OrganizationRegistrationForm {...commonProps} />;
      default:
        return null;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'role-selection':
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
      
      case 'registration':
        return renderRegistrationForm();
      
      case 'verification':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <p className="text-muted-foreground">
              We've sent a verification email to <strong>{email}</strong>.
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
        
        {step === 'role-selection' && (
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
