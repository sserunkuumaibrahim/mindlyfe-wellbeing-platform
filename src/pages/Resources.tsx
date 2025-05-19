
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const resources = [
  { title: "How to Improve Your Mood", type: "Article" },
  { title: "10-Minute Mindfulness Meditation", type: "Podcast" },
  { title: "Sleep Better Tonight", type: "Video" },
];
export default function ResourcesPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Self-Help Resources</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-5">
          <h2 className="font-bold mb-2">Content Library</h2>
          <ul className="list-disc pl-5 text-[17px]">
            {resources.map((r, i) => (
              <li key={i}>{r.title} <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded px-2">{r.type}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white/80 p-6 shadow">
          <h2 className="font-bold mb-2">Guided Meditations</h2>
          <button className="rounded px-3 py-2 bg-blue-100 hover:bg-blue-200 font-semibold">Start Meditation</button>
        </div>
      </div>
    </div>
  );
}
