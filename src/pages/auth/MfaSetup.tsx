
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiClient } from "@/services/apiClient";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type FormData = z.infer<typeof formSchema>;

export default function MfaSetup() {
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  // Initialize MFA setup
  const initSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.mfa.enable();
      setSetupData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize MFA setup';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load setup data when component mounts
  useEffect(() => {
    initSetup();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.mfa.verify(data.code);
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear error when form fields change
  const handleFormChange = () => {
    if (error) setError(null);
  };

  return (
    <AuthLayout>
      <AuthCard 
        title="Set Up Two-Factor Authentication" 
        description="Enhance your account security with 2FA"
      >
        {success ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20 text-secondary">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium">Setup Complete</h3>
            <p className="text-muted-foreground">
              Two-factor authentication has been successfully enabled for your account.
            </p>
            <Button asChild className="w-full mt-2">
              <button onClick={() => navigate("/dashboard")}>
                Continue to Dashboard
              </button>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            
            {setupData ? (
              <>
                <div className="space-y-4 mb-6">
                  <ol className="space-y-4">
                    <li className="flex gap-2">
                      <span className="font-medium">1.</span>
                      <div>
                        <p>Download an authenticator app like Google Authenticator or Authy.</p>
                      </div>
                    </li>
                    
                    <li className="flex gap-2">
                      <span className="font-medium">2.</span>
                      <div>
                        <p>Scan this QR code with your authenticator app:</p>
                        <div className="mt-2 flex justify-center">
                          <img 
                            src={setupData.qrCode} 
                            alt="QR Code for 2FA setup" 
                            className="border rounded-lg p-2 bg-white"
                          />
                        </div>
                      </div>
                    </li>
                    
                    <li className="flex gap-2">
                      <span className="font-medium">3.</span>
                      <div>
                        <p>Or manually enter this code in your authenticator app:</p>
                        <div className="mt-1 p-2 bg-muted rounded-md font-mono text-center break-all">
                          {setupData.secret}
                        </div>
                      </div>
                    </li>
                    
                    <li className="flex gap-2">
                      <span className="font-medium">4.</span>
                      <div>
                        <p>Enter the 6-digit code from your authenticator app below to verify:</p>
                      </div>
                    </li>
                  </ol>
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

                    <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                      <AlertDescription>
                        <strong>Important:</strong> Store your backup codes in a safe place. If you lose your authenticator device, you'll need these codes to access your account.
                      </AlertDescription>
                    </Alert>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Verifying...
                        </span>
                      ) : (
                        "Complete Setup"
                      )}
                    </Button>
                  </form>
                </Form>
              </>
            ) : (
              <div className="flex justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            )}
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
