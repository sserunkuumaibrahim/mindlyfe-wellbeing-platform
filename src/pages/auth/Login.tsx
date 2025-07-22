
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from '@/lib/toast';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await signIn(data.email, data.password);
      // If we get here, sign in was successful
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      // Handle the error thrown by signIn
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = () => {
    if (error) setError(null);
  };

  return (
    <AuthLayout>
      <AuthCard 
        title="Welcome Back" 
        description="Sign in to your Mindlyfe account to continue"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} onChange={handleFormChange} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="name@example.com" 
                      className="h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-white/70"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-white/70 pr-12"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-2">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium text-gray-600 cursor-pointer">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-xl border border-blue-100">
                <p className="font-semibold mb-1">Development Test Credentials:</p>
                <p><strong>Email:</strong> demo@mindlyfe.org</p>
                <p><strong>Password:</strong> MindLyfe2024!</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" /> Sign In
                </span>
              )}
            </Button>

            <div className="text-center text-sm pt-4">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </AuthCard>
    </AuthLayout>
  );
}
