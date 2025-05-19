
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const tracker = [
  { date: "2025-05-17", sleep: "7h", exercise: "Walk", water: "6 glasses" },
  { date: "2025-05-18", sleep: "8h", exercise: "Yoga", water: "8 glasses" },
];
export default function LifestylePage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Lifestyle Management</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow">
          <h2 className="font-bold mb-2">Health Tracking</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Sleep</th>
                <th>Exercise</th>
                <th>Water Intake</th>
              </tr>
            </thead>
            <tbody>
              {tracker.map((d, i) => (
                <tr key={i}>
                  <td>{d.date}</td>
                  <td>{d.sleep}</td>
                  <td>{d.exercise}</td>
                  <td>{d.water}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow mt-5">
          <h2 className="font-bold mb-2">Wellness Goals</h2>
          <ul className="list-disc ml-5">
            <li>Drink 8 glasses of water daily</li>
            <li>Exercise at least 3 times a week</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
