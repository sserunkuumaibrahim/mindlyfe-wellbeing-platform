
import React from "react";

interface StatusPillProps {
  label: string;
  highlight?: boolean;
}

export default function StatusPill({ label, highlight }: StatusPillProps) {
  return (
    <span className={`px-2 py-0.5 text-xs rounded-xl font-semibold 
      ${highlight ? "bg-primary text-white shadow-lg" : "bg-gray-100 text-gray-500"}
    `}>
      {label}
    </span>
  );
}
