import { useState } from "react";
import { Shield, Heart, Brain } from "lucide-react";
import PhoneAuthForm from "@/components/phone-auth-form";
import OtpVerificationForm from "@/components/otp-verification-form";
import MobileLayout from "@/components/mobile-layout";

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [developmentOtp, setDevelopmentOtp] = useState<string>();

  const handleOtpSent = (phone: string, otpCode?: string) => {
    setPhoneNumber(phone);
    setDevelopmentOtp(otpCode);
    setStep('otp');
  };

  const handleBack = () => {
    setStep('phone');
    setPhoneNumber('');
    setDevelopmentOtp(undefined);
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-calm-blue via-calm-purple to-calm-green flex flex-col">
        {/* Header */}
        <header className="text-center pt-12 pb-8 px-6">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CalmTrack</h1>
          <p className="text-gray-600 text-sm">
            Your mental wellness companion for anxiety support
          </p>
        </header>

        {/* Features */}
        <div className="px-6 mb-8">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white bg-opacity-60 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Secure & Private</h3>
                <p className="text-xs text-gray-600">Your data is encrypted and protected</p>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-60 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent bg-opacity-20 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Evidence-Based</h3>
                <p className="text-xs text-gray-600">CBT techniques and wellness tracking</p>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-60 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary bg-opacity-20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Personalized Support</h3>
                <p className="text-xs text-gray-600">Track activities, nutrition, and progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Form */}
        <div className="flex-1 px-6 pb-8">
          {step === 'phone' ? (
            <PhoneAuthForm onOtpSent={handleOtpSent} />
          ) : (
            <OtpVerificationForm 
              phoneNumber={phoneNumber} 
              developmentOtp={developmentOtp}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-6 px-6">
          <p className="text-xs text-gray-500">
            Anxiety support • Activity tracking • Nutrition logging • CBT techniques
          </p>
        </footer>
      </div>
    </MobileLayout>
  );
}