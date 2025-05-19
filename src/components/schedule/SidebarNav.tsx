
import { Calendar, MessageSquare, LayoutDashboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Schedule", icon: Calendar, path: "/schedule" },
  { name: "Chat", icon: MessageSquare, path: "/chat" },
];

export default function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="flex flex-col items-center gap-2 pt-8 bg-transparent h-full w-20 z-20">
      <div className="w-14 h-14 bg-primary/80 flex items-center justify-center rounded-2xl shadow mb-6">
        <img
          src="/lovable-uploads/b2301cde-7b47-44db-9383-36476ebb83c9.png"
          alt="Mindlyfe"
          className="w-9 h-9"
          draggable={false}
        />
      </div>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-2xl mb-2 transition-all",
              isActive
                ? "bg-primary text-white shadow-md scale-105"
                : "bg-white/80 text-zinc-400 hover:text-primary hover:bg-blue-50"
            )}
            aria-label={item.name}
          >
            <item.icon size={26} />
          </button>
        );
      })}
    </aside>
  );
}
