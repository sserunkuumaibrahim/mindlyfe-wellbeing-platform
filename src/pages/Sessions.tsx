
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const sessions = [
  { date: "12 May 2025", topic: "Stress Management", therapist: "Jane Doe", notes: "Breathing exercises helped." },
  { date: "18 May 2025", topic: "Sleep Therapy", therapist: "Max Worthington", notes: "Adjust bedtime habits." },
];
export default function SessionsPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Therapy Sessions</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-5">
          <h2 className="font-bold mb-2">Upcoming Sessions</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-1">Date</th>
                <th className="text-left py-1">Topic</th>
                <th className="text-left py-1">Therapist</th>
                <th className="text-left py-1">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i} className="border-b">
                  <td>{s.date}</td>
                  <td>{s.topic}</td>
                  <td>{s.therapist}</td>
                  <td className="text-xs">{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold mb-2">Session Notes</h2>
          <textarea className="w-full min-h-[60px] rounded p-2 border" placeholder="Type your notes here..."></textarea>
        </div>
      </div>
    </div>
  );
}
