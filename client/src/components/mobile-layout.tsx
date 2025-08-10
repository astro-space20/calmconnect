import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
      {children}
    </div>
  );
}
