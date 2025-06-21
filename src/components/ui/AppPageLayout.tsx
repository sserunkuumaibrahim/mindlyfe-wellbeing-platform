
import React from "react";

export default function AppPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e3f1fa] via-[#f5fafe] to-[#fff] transition-all flex flex-row">
      <main className="flex-1 min-h-screen flex justify-center items-start">
        <div className="w-full max-w-4xl min-h-screen pt-12 px-0 md:px-0 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
