
import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  badge?: React.ReactNode;
  progress?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  description,
  badge,
  progress,
  className,
  children,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl glass-morphism p-6 flex flex-col gap-1 min-h-[156px] shadow-xl bg-white/80 dark:bg-muted/90 border border-white/30",
        className
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-lg text-gray-700">{title}</span>
        {badge}
      </div>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-4xl font-extrabold text-primary">{value}</span>
      </div>
      {children ? (
        children
      ) : (
        <>
          {description && (
            <div className="text-sm text-gray-500 mb-1">{description}</div>
          )}
          {typeof progress === "number" && (
            <div className="w-full h-2 rounded bg-muted mt-1 overflow-hidden">
              <div
                className="h-full rounded bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
