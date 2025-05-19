
import { ReactNode } from "react";

/**
 * AuthLayout for authentication pages.
 * Applies a full-page linear-gradient background,
 * smoothly centers the Mindlyfe logo and auth card,
 * and gives vertical/horizontal balance.
 */
interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center"
      style={{
        background: "linear-gradient(102.3deg, #93A6FF 0%, #e2d1c3 100%)",
      }}
    >
      {/* Centered Mindlyfe logo */}
      <div className="flex flex-col items-center mb-6 mt-12 animate-fade-in">
        <img
          src="/lovable-uploads/b2301cde-7b47-44db-9383-36476ebb83c9.png"
          alt="Mindlyfe Logo"
          className="w-28 h-28 rounded-full shadow-lg border-4 border-white mb-2 bg-white/80 object-contain"
          draggable={false}
        />
        <span className="text-muted-foreground text-sm font-bold tracking-wide uppercase mt-1 select-none">
          Live Better
        </span>
      </div>

      <main className="w-full flex-1 flex justify-center items-start md:items-center px-2">
        {children}
      </main>

      <footer className="py-4 text-center w-full text-xs text-muted-foreground opacity-80 backdrop-blur-sm font-medium">
        © {new Date().getFullYear()} Mindlyfe. All rights reserved.
      </footer>
    </div>
  );
}
