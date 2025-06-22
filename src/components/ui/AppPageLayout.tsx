
import React from "react";
import { Navigation } from "./Navigation";

export default function AppPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3f1fa] via-[#f5fafe] to-[#fff]">
      <Navigation />
      
      {/* Main content with proper spacing for navigation */}
      <div className="md:pl-64">
        <div className="pt-16 md:pt-0">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
