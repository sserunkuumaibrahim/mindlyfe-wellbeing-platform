
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sidebarLinks } from "@/components/navigation/AppSidebarLinks";
import SidebarIconButton from "@/components/ui/SidebarIconButton";

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed top-0 left-0 h-screen z-40 px-0 flex flex-col items-center justify-between py-10 min-w-[90px] w-[90px] bg-white/90 shadow-xl border-0 rounded-3xl m-4 backdrop-blur-[8px] glass-morphism transition-all">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 w-full">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary/90 mb-2 shadow-md border-4 border-white">
          <img
            src="/lovable-uploads/b2301cde-7b47-44db-9383-36476ebb83c9.png"
            className="w-9 h-9 select-none"
            alt="Logo"
            draggable={false}
          />
        </div>
      </div>
      {/* Navigation icons */}
      <nav className="flex flex-col items-center gap-3 flex-1">
        {sidebarLinks.map((item) => (
          <SidebarIconButton
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>
      <div /> {/* Spacer for bottom */}
    </aside>
  );
}
