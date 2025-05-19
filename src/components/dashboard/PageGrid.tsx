
import React from "react";
export default function PageGrid({ left, right }: { left: React.ReactNode, right: React.ReactNode }) {
  return (
    <div className="w-full max-w-[1250px] px-0 flex flex-col gap-7 pb-12 pt-1">
      <div className="grid grid-cols-1 xl:grid-cols-[2.1fr_1fr] gap-8">
        <div className="flex flex-col gap-7">{left}</div>
        <div className="flex flex-col gap-6">{right}</div>
      </div>
    </div>
  );
}
