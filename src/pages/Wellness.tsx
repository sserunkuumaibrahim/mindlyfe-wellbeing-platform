
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const programs = [
  { name: "Mindfulness Training", status: "In Progress", sessions: 4 },
  { name: "Sleep Improvement", status: "Completed", sessions: 5 },
  { name: "Stress Management", status: "Planned", sessions: 0 },
];
export default function WellnessPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Wellness Programs</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-5">
          <h2 className="font-bold mb-2">Structured Programs</h2>
          <ul className="list-disc ml-5">
            {programs.map((p, i) => (
              <li key={i}>{p.name} <span className="ml-2 text-xs text-gray-500">({p.status}) - {p.sessions} sessions</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold mb-2">Custom Wellness Goals</h2>
          <ul className="list-disc ml-5">
            <li>Practice daily gratitude</li>
            <li>Sleep by 10:00 PM</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
