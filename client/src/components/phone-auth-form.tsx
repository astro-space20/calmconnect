import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneAuthSchema, type PhoneAuth } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

interface PhoneAuthFormProps {
  onOtpSent: (phoneNumber: string, otpCode?: string) => void;
}

export default function PhoneAuthForm({ onOtpSent }: PhoneAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<PhoneAuth>({
    resolver: zodResolver(phoneAuthSchema),
  });

  const onSubmit = async (data: PhoneAuth) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "OTP Sent!",
          description: "Please check your phone for the verification code.",
        });
        onOtpSent(data.phoneNumber, result.otpCode); // For development
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      const response = await fetch('/api/auth/guest-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        await login(result.token, result.user);
        toast({
          title: "Guest Session Created",
          description: "You can now explore the app as a guest user.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create guest session",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-gray-800">Welcome to CalmTrack</CardTitle>
        <p className="text-gray-600 text-sm">Enter your phone number to get started</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              {...register("phoneNumber")}
              type="tel"
              placeholder="+1234567890"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +1 for US)
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-bg hover:opacity-90"
            disabled={isLoading || isGuestLoading}
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
          </Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGuestLogin}
            disabled={isLoading || isGuestLoading}
          >
            {isGuestLoading ? "Creating Guest Session..." : "Continue as Guest"}
          </Button>
          
          <p className="text-xs text-gray-500 mt-3 text-center">
            Guest mode lets you try the app without phone verification. Your data will be temporary.
          </p>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}