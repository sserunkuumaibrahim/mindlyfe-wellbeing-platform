
import { ReactNode } from "react";

/**
 * AuthLayout for authentication pages.
 * Applies a full-page linear-gradient background,
 * smoothly centers the Mindlyfe logo above the auth card,
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
        background:
          "linear-gradient(120deg, #8EBC40 0%, #B8D470 50%, #E5F2C8 100%)",
        // Green gradient using the specified CMYK color
      }}
    >
      {/* Centered Mindlyfe logo */}
      <div className="flex flex-col items-center mb-3 mt-8 animate-fade-in select-none">
        <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full shadow-lg border-4 border-white bg-white/90 overflow-hidden mb-2">
          <img
            src="/lovable-uploads/b2301cde-7b47-44db-9383-36476ebb83c9.png"
            alt="Mindlyfe Logo"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
            draggable={false}
            style={{
              filter: "drop-shadow(0 2px 12px rgba(142,188,64,0.15))",
            }}
          />
        </div>
        <span className="text-white/90 text-xs font-bold tracking-wide uppercase mt-1 select-none opacity-90">
          Live Better
        </span>
      </div>
      <main className="w-full flex-1 flex justify-center items-start md:items-center px-2">
        {children}
      </main>
      <footer className="py-4 text-center w-full text-xs text-white/80 opacity-85 backdrop-blur-sm font-medium">
        © {new Date().getFullYear()} Mindlyfe. All rights reserved.
      </footer>
    </div>
  );
}
