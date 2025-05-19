
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Users, Settings } from "lucide-react";
import classNames from "clsx";

// Define nav items: Chat, Users, Settings as per requirements.
const navItems = [
  { name: "Messages", icon: MessageSquare, path: "/chat" },
  { name: "Community", icon: Users, path: "/schedule" },
  { name: "Settings", icon: Settings, path: "/dashboard" },
];

export default function FloatingSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed left-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6 bg-white/30 backdrop-blur-lg shadow-2xl rounded-full px-4 py-8 glass-morphism border border-white/50"
      style={{
        boxShadow:
          "0 8px 32px 0 rgba(31, 38, 135, 0.12), 0 1.5px 12px 0 rgba(33,169,225,0.06)",
      }}
    >
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={classNames(
              "transition-all duration-200 text-gray-500 flex items-center justify-center w-14 h-14 rounded-full relative hover:scale-110 hover:text-primary",
              active
                ? "bg-primary/90 text-white shadow-lg scale-105 ring-4 ring-primary/20"
                : "bg-white/50 backdrop-blur-lg shadow"
            )}
            aria-label={item.name}
            tabIndex={0}
            title={item.name}
            style={{
              fontSize: 0,
              border: "none",
              outline: "none",
            }}
          >
            <item.icon size={28} />
            {active && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-2 bg-blue-200 rounded-full blur-xs" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

