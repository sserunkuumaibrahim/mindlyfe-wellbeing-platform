
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const weeks = [
  { label: "Week 1", value: 3 },
  { label: "Week 2", value: 2 },
  { label: "Week 3", value: 4 },
  { label: "Week 4", value: 4 },
];
export default function ProgressTrackingPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Progress Tracking</h1>
        <div className="rounded-xl bg-white/70 p-6 shadow space-y-4">
          <h2 className="font-bold text-lg">Monthly Wellness Review</h2>
          <div className="flex gap-4">
            {weeks.map((w, idx) => (
              <div key={idx} className="bg-blue-100 p-4 rounded-lg text-center shadow flex-1">
                <div className="font-bold text-lg">{w.label}</div>
                <div className="text-2xl text-blue-600">{w.value}/5</div>
                <div className="text-xs">Wellness Score</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/80 p-6 mt-6 shadow">
          <h2 className="font-bold mb-2">Milestones</h2>
          <ul className="list-disc ml-5 font-dmsans text-gray-700">
            <li>Completed 4 weekly check-ins</li>
            <li>Started a gratitude journal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
