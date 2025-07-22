
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const formSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type FormData = z.infer<typeof formSchema>;

export default function MfaVerify() {
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Set up countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Note: This would need to be implemented in the PostgreSQL client
      // For now, we'll just navigate to dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setError("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  // Clear error when form fields change
  const handleFormChange = () => {
    setError(null);
  };

  const handleResendCode = () => {
    // In a real app, this would call an API to resend the code
    setCountdown(60);
    // Show a toast notification
  };

  return (
    <AuthLayout>
      <AuthCard 
        title="Two-Factor Authentication" 
        description="Enter the 6-digit code from your authenticator app"
      >
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} onChange={handleFormChange} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center space-y-2">
                  <FormLabel className="text-center">Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </Button>

            <div className="text-center text-sm">
              Didn't receive a code?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                disabled={countdown > 0}
                onClick={handleResendCode}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
              </Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    </AuthLayout>
  );
}
