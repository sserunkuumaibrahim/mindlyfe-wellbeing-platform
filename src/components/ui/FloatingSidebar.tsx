
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, MessageSquare, User, Book, Settings } from "lucide-react";
import classNames from "clsx";

// Sidebar nav: icons + pill glass bg, highlight active
const navItems = [
  { name: "Dashboard", icon: User, path: "/dashboard" },
  { name: "Schedule", icon: Calendar, path: "/schedule" },
  { name: "Chat", icon: MessageSquare, path: "/chat" },
  { name: "Resources", icon: Book, path: "#" },
  { name: "Settings", icon: Settings, path: "#" },
];

export default function FloatingSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 items-center">
      <div className="w-14 h-14 bg-primary/90 flex items-center justify-center rounded-2xl mb-2 shadow-lg border-4 border-white">
        <svg width={28} height={28} viewBox="0 0 30 30"><circle cx={15} cy={15} r={13} fill="#fff" /><text x="15" y="20" textAnchor="middle" fontSize="16" fill="#21A9E1" fontWeight={700} fontFamily="inter,sans-serif">M</text></svg>
      </div>
      {navItems.map((item, i) => {
        const active = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/");
        return (
          <button
            key={item.name}
            onClick={() => item.path !== "#" && navigate(item.path)}
            className={classNames(
              "transition-all duration-200 flex items-center justify-center w-13 h-13 rounded-2xl shadow-lg border-none outline-none bg-white/80 hover:scale-110",
              active
                ? "bg-primary text-white ring-4 ring-primary/20 scale-110"
                : "text-blue-300 hover:text-primary"
            )}
            aria-label={item.name}
            tabIndex={0}
            title={item.name}
            style={{ fontSize: 0 }}
          >
            <item.icon size={28} />
          </button>
        );
      })}
      <div className="flex-1" />
      {/* Settings at bottom if needed */}
    </aside>
  );
}
