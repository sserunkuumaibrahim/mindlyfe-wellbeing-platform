
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#E8F2FF] via-[#F6FBF7] to-[#F1F4FB] px-2">
      {/* Centered logo */}
      <div className="flex flex-col items-center mb-4 mt-8">
        <img
          src="/lovable-uploads/b2301cde-7b47-44db-9383-36476ebb83c9.png"
          alt="Mindlyfe Logo"
          className="w-32 h-auto mb-2 drop-shadow-sm animate-fade-in"
          draggable={false}
        />
        {/* Optional: Add tagline */}
        <span className="text-muted-foreground text-xs font-medium">Live Better</span>
      </div>

      <main className="w-full flex-1 flex items-center justify-center">
        {children}
      </main>

      <footer className="py-4 text-center w-full text-xs text-muted-foreground opacity-90">
        © {new Date().getFullYear()} Mindlyfe. All rights reserved.
      </footer>
    </div>
  );
}
