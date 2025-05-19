
import React from "react";

export default function PageGrid({ left, right }: { left: React.ReactNode, right: React.ReactNode }) {
  return (
    <div className="w-full max-w-7xl px-8 flex flex-col gap-6 pb-12 pt-1">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-7">
        <div className="flex flex-col gap-7">{left}</div>
        <div className="flex flex-col gap-7">{right}</div>
      </div>
    </div>
  );
}
