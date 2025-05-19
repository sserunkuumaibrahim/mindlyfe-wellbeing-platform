
import React from "react";

interface MetricBadgeProps {
  value: string;
  variant: "up" | "down";
}

export default function MetricBadge({ value, variant }: MetricBadgeProps) {
  return (
    <span
      className={`text-xs font-bold px-2 py-1 rounded-2xl ${
        variant === "up"
          ? "bg-green-100 text-green-600"
          : "bg-blue-100 text-blue-600"
      }`}
    >
      {value}
    </span>
  );
}
