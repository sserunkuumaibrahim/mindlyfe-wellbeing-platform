
import { Card } from "@/components/ui/card";
import React from "react";

type InfoCardProps = {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
};

export default function InfoCard({ children, className = "", gradient }: InfoCardProps) {
  return (
    <Card
      className={`
        rounded-3xl
        shadow-2xl
        px-6 py-5
        bg-white/70 dark:bg-muted/80
        ${gradient ? "bg-gradient-to-br from-white from-60% to-[#e9f6ff]" : ""}
        glass-morphism
        ${className}
      `}
      style={
        gradient
          ? { background: "linear-gradient(120deg, #f7fbff 65%, #e9f6ff 100%)", border: 0 }
          : {}
      }
    >
      {children}
    </Card>
  );
}
