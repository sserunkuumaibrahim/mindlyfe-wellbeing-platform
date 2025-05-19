
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", mood: 3 },
  { name: "Tue", mood: 2 },
  { name: "Wed", mood: 4 },
  { name: "Thu", mood: 1 },
  { name: "Fri", mood: 3 },
  { name: "Sat", mood: 4 },
  { name: "Sun", mood: 2 },
];

export default function ProgressPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-4 text-blue-700">Progress Tracking</h1>
        <div className="flex flex-col md:flex-row md:gap-7 gap-4">
          <div className="rounded-xl bg-white/80 shadow p-6 flex-1">
            <h2 className="font-bold mb-2">Mood Tracker This Week</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis ticks={[1, 2, 3, 4]} />
                <Tooltip />
                <Bar dataKey="mood" fill="#61A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-white/70 shadow p-6 flex-1">
            <h2 className="font-bold mb-2">Achievements</h2>
            <ul className="list-disc ml-5 text-[17px]">
              <li>3 days of positive mood streak</li>
              <li>Completed 5 daily check-ins</li>
              <li>Set 3 new wellness goals</li>
            </ul>
          </div>
        </div>
        <div className="rounded-xl bg-white/80 shadow p-6 mt-6 max-w-xl">
          <h2 className="font-bold mb-2">Custom Goals</h2>
          <ul className="list-disc ml-5 text-[17px]">
            <li>Meditate daily for 10 minutes</li>
            <li>Go for a 20-minute walk</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
