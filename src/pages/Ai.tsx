
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const notifications = [
  { msg: "Time to complete your mood check-in!", type: "reminder" },
  { msg: "Your stress levels are improving!", type: "insight" },
];
export default function AiPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Smart Features</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-5">
          <h2 className="font-bold mb-2">AI Assistant</h2>
          <ul className="list-disc ml-5">
            <li>Recommendations based on your recent activities</li>
            <li>Mood analysis & insights</li>
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold mb-2">Smart Notifications</h2>
          <ul>
            {notifications.map((n, i) => (
              <li key={i} className="mb-1">
                <span className="text-blue-700 font-medium">{n.type === "reminder" ? "🔔" : "💡"}</span> {n.msg}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
