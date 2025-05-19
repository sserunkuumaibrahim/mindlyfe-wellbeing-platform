
import React from "react";

interface AvatarTextProps {
  src?: string;
  initials?: string;
  name: string;
  subText?: string;
  size?: number;
}

export default function AvatarText({ src, initials, name, subText, size = 38 }: AvatarTextProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full bg-muted/60 flex items-center justify-center font-bold"
        style={{
          width: size,
          height: size,
          background: src ? "none" : "#F3F6FA",
          border: "2px solid #fff",
          boxShadow: "0 2px 8px 0 rgba(150,171,212,0.15)"
        }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover rounded-full"
            style={{ minWidth: size }}
          />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0">
        <div className="font-semibold leading-tight text-sm truncate">{name}</div>
        {subText && <div className="text-xs text-gray-500 truncate">{subText}</div>}
      </div>
    </div>
  );
}
