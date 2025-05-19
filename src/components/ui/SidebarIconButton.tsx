
import React from "react";
import classNames from "clsx";

interface SidebarIconButtonProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}
export default function SidebarIconButton({ icon: Icon, label, active, onClick }: SidebarIconButtonProps) {
  return (
    <button
      className={classNames(
        "flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow hover:scale-105 group relative",
        active
          ? "bg-primary text-white drop-shadow-xl scale-110 ring-4 ring-primary/30"
          : "bg-white/80 text-slate-400 hover:text-primary hover:bg-blue-50"
      )}
      aria-label={label}
      onClick={onClick}
      tabIndex={0}
      title={label}
    >
      <Icon size={28} />
      {/* Active Indicator */}
      {active && (
        <span className="absolute left-2 right-2 bottom-2 h-1 rounded bg-white/80 bg-blur" />
      )}
    </button>
  );
}
