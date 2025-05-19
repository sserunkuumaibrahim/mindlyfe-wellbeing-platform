
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const goals = [
  { goal: "Sleep 8+ hours", status: "On Track" },
  { goal: "Walk 7,000+ steps", status: "Almost" },
];
export default function LifestyleManagementPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Lifestyle Management</h1>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold text-lg mb-2">Weekly Wellness Goals</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {goals.map((g, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow px-4 py-3">
                <div className="font-bold">{g.goal}</div>
                <div className={`text-xs font-medium mt-1 ${g.status === "On Track" ? "text-green-600" : "text-yellow-500"}`}>{g.status}</div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <span className="font-bold">Tip:</span> Stay hydrated for optimal focus!
          </div>
        </div>
      </div>
    </div>
  );
}
