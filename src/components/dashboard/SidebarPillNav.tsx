
import { LayoutDashboard, Calendar, MessageSquare, Book, Settings, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: Book, label: "Resources", path: "#" },
  { icon: Heart, label: "Wellness", path: "#" }
];

export default function SidebarPillNav() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <aside className="fixed z-50 top-0 left-0 h-screen flex flex-col bg-transparent pt-10 pl-5 select-none">
      <div className="flex flex-col items-center gap-5">
        <div className="rounded-full bg-white/80 w-[50px] h-[50px] shadow-lg flex items-center justify-center mb-2">
          <img src="https://cdn-icons-png.flaticon.com/512/4211/4211819.png" className="w-8 h-8" draggable={false} alt="App" />
        </div>
        {navItems.map((item, idx) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.label}
              className={clsx(
                "w-14 h-14 rounded-full bg-white/70 flex items-center justify-center mb-2 transition-all shadow border-none outline-none",
                active ? "bg-primary/95 text-white ring-2 ring-primary/40 scale-105" : "text-[#9ab2cf] hover:bg-blue-50 hover:text-primary"
              )}
              style={{ fontSize: 0 }}
              tabIndex={0}
              onClick={() => item.path !== "#" && navigate(item.path)}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon size={28} />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
