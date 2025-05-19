
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Calendar, MessageSquare, LayoutDashboard } from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Schedule",
    icon: Calendar,
    path: "/schedule",
  },
  {
    name: "Chat",
    icon: MessageSquare,
    path: "/chat",
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}>
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="flex items-center gap-3 w-full">
                      <item.icon
                        className={
                          location.pathname === item.path
                            ? "text-primary"
                            : "text-gray-400"
                        }
                        size={22}
                      />
                      <span className="font-semibold text-base">{item.name}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
