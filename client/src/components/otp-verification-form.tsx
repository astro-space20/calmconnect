import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpVerifySchema, type OtpVerify } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

interface OtpVerificationFormProps {
  phoneNumber: string;
  developmentOtp?: string;
  onBack: () => void;
}

export default function OtpVerificationForm({ 
  phoneNumber, 
  developmentOtp, 
  onBack 
}: OtpVerificationFormProps) {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const { login } = useAuth();

  const { handleSubmit } = useForm<OtpVerify>({
    resolver: zodResolver(otpVerifySchema),
  });

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (developmentOtp && process.env.NODE_ENV === 'development') {
      const otpArray = developmentOtp.split('');
      setOtpValues(otpArray);
      toast({
        title: "Development Mode",
        description: `OTP auto-filled: ${developmentOtp}`,
      });
    }
  }, [developmentOtp, toast]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasteData = value.slice(0, 6);
      const newOtpValues = [...otpValues];
      for (let i = 0; i < pasteData.length && index + i < 6; i++) {
        newOtpValues[index + i] = pasteData[i];
      }
      setOtpValues(newOtpValues);
      
      // Focus on the next empty input or the last one
      const nextEmptyIndex = newOtpValues.findIndex((val, idx) => idx > index && val === '');
      const targetIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + pasteData.length, 5);
      inputRefs.current[targetIndex]?.focus();
    } else {
      // Handle single character input
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      // Move to next input if value entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async () => {
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otpCode,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You're now logged in to CalmTrack.",
        });
        login(result.token, result.user);
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Invalid or expired OTP",
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

  const maskedPhone = phoneNumber.replace(/(.{3}).*(.{4})/, '$1****$2');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-gray-800">Verify Your Phone</CardTitle>
        <p className="text-gray-600 text-sm">
          We sent a 6-digit code to {maskedPhone}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label className="block text-center mb-3">Enter Verification Code</Label>
            <div className="flex justify-center space-x-2">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-bg hover:opacity-90"
            disabled={isLoading || otpValues.some(val => !val)}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="text-center space-y-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onBack}
              disabled={isLoading}
              className="text-sm"
            >
              Change Phone Number
            </Button>
            
            <p className="text-xs text-gray-500">
              Didn't receive the code? Check your messages or try again.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}