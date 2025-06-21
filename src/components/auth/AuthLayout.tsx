
import { ReactNode } from "react";

/**
 * AuthLayout for authentication pages.
 * Clean, modern design with subtle gradients and better visual hierarchy.
 */
interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center p-4"
      style={{
        background: "linear-gradient(135deg, #8EBC40 0%, #A5CC5A 25%, #C1DC74 75%, #E0F2B3 100%)",
      }}
    >
      {/* Centered Mindlyfe logo */}
      <div className="flex flex-col items-center mb-8 animate-fade-in select-none">
        <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full shadow-xl bg-white/95 backdrop-blur-sm border border-white/30 overflow-hidden mb-3">
          <img
            src="/lovable-uploads/b2301cde-7b47-44db-9383-36476ebb83c9.png"
            alt="Mindlyfe Logo"
            className="w-16 h-16 md:w-20 md:h-20 object-contain"
            draggable={false}
          />
        </div>
        <span className="text-white text-sm font-semibold tracking-wider uppercase opacity-90">
          Live Better
        </span>
      </div>
      
      <main className="w-full flex-1 flex justify-center items-center">
        {children}
      </main>
      
      <footer className="py-6 text-center w-full text-sm text-white/75 font-medium">
        © {new Date().getFullYear()} Mindlyfe. All rights reserved.
      </footer>
    </div>
  );
}
