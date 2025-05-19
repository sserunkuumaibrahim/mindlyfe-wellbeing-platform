import React from "react";
import AppSidebar from "../layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-[#eaf6ff] via-[#f4f7ff] to-white">
      <AppSidebar />
      <main className="flex-1 min-h-screen px-0 md:px-0 py-0 flex justify-center items-start">
        <div className="w-full max-w-7xl min-h-screen pt-6 px-7 md:px-16"
          style={{
            marginLeft: '90px' // fixed sidebar offset
          }}>
          {children}
        </div>
      </main>
    </div>
  );
}
