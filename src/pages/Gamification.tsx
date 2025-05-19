
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const badges = [
  { name: "7-Day Streak", earned: true },
  { name: "First Journal Entry", earned: true },
  { name: "Goal Crusher", earned: false },
];
export default function GamificationPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Gamification</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-4">
          <h2 className="font-bold mb-2">Badges</h2>
          <ul className="flex gap-4">
            {badges.map((b, i) => (
              <li
                key={i}
                className={`bg-${b.earned ? "green" : "gray"}-100 px-3 py-1 rounded font-semibold`}
              >
                {b.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow mb-4">
          <h2 className="font-bold mb-2">Milestones</h2>
          <ul className="list-disc ml-5">
            <li>Complete 5 daily wellness goals</li>
            <li>Participate in a community group</li>
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold mb-2">Challenges</h2>
          <ul className="list-disc ml-5">
            <li>3-day meditation streak</li>
            <li>Journal entries 3 days in a row</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
