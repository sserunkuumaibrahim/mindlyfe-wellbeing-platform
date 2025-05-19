
import React from "react";
import AppSidebar from "../layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 bg-gradient-to-br from-[#f7fbff] to-[#e9f6ff] dark:from-background dark:to-muted/10 px-3 md:px-8 py-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
