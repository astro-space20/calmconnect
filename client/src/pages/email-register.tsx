import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { emailRegistrationSchema, type EmailRegistration } from "@shared/schema";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { Link } from "wouter";

export default function EmailRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm<EmailRegistration>({
    resolver: zodResolver(emailRegistrationSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: EmailRegistration) => {
      return await apiRequest('/api/auth/register', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        setRegisteredEmail(form.getValues('email'));
        setShowVerification(true);
        toast({
          title: "Registration Successful",
          description: data.message,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmailRegistration) => {
    registerMutation.mutate(data);
  };

  if (showVerification) {
    return <EmailVerification email={registeredEmail} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/login">
            <a className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </a>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Join CalmTrack to start your wellness journey</p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Up with Email</CardTitle>
            <CardDescription>
              Create your account to access all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            {...field} 
                            placeholder="Enter your full name"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            {...field} 
                            type="email" 
                            placeholder="Enter your email"
                            className="pl-10"
                          />
                        </div>
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            {...field} 
                            type="password" 
                            placeholder="Create a strong password"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <div className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters long
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login">
                  <a className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in here
                  </a>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Email Verification Component
function EmailVerification({ email }: { email: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");

  const verifyMutation = useMutation({
    mutationFn: async (data: { email: string; verificationCode: string }) => {
      return await apiRequest('/api/auth/verify-email', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Email Verified",
          description: data.message,
        });
        setLocation("/login?verified=true");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/resend-verification', {
        method: 'POST',
        body: { email },
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Code Sent",
          description: data.message,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      verifyMutation.mutate({ email, verificationCode });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to<br />
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <Button 
              onClick={handleVerify}
              className="w-full" 
              disabled={verificationCode.length !== 6 || verifyMutation.isPending}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
              >
                {resendMutation.isPending ? "Sending..." : "Resend Code"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}