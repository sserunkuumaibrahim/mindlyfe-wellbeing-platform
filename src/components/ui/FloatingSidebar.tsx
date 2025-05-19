import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import classNames from "clsx";
import { sidebarLinks } from "@/components/navigation/AppSidebarLinks";

// Consistent sidebar using central config
export default function FloatingSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-9 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6 items-center">
      <div className="w-16 h-16 bg-white/90 shadow-glass border-2 border-white flex items-center justify-center rounded-2xl mb-2">
        <span className="bg-gradient-to-br from-[#53a6eb] to-[#277fff] bg-clip-text text-transparent font-bold text-3xl font-dmsans">M</span>
      </div>
      {sidebarLinks.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={classNames(
              "relative transition-all flex items-center justify-center w-14 h-14 rounded-full shadow-glass ring-0 border-0 outline-none bg-white/60 hover:bg-white/80",
              active ? "bg-primary/95 text-white shadow-xl ring-2 ring-primary/40 scale-110" : "text-primary/30 hover:text-primary"
            )}
            aria-label={item.label}
            tabIndex={0}
            title={item.label}
            style={{ fontSize: 0 }}
          >
            <item.icon size={28} />
            {active && (
              <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow" />
            )}
          </button>
        );
      })}
    </aside>
  );
}
