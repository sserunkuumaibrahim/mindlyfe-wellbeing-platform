
import React from "react";
import { cn } from "@/lib/utils";

interface PillBadgeProps {
  label: string;
  color?: "primary" | "green" | "blue" | "gray";
}

const colorMap = {
  primary: "bg-primary/80 text-white",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-600",
  gray: "bg-gray-100 text-gray-600",
};

export default function PillBadge({ label, color = "primary" }: PillBadgeProps) {
  return (
    <span
      className={cn(
        "text-xs font-semibold px-3 py-1 rounded-full shadow",
        colorMap[color]
      )}
    >
      {label}
    </span>
  );
}
