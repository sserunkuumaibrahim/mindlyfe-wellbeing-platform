
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
export default function AiAssistantPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">AI Assistant</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-5">
          <h2 className="font-bold mb-2">Personalized Recommendations</h2>
          <ul className="list-disc ml-5">
            <li>Try a guided meditation today</li>
            <li>Record a gratitude note</li>
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold mb-2">Crisis Detection</h2>
          <p>All appears well today. Keep up the healthy habits!</p>
        </div>
      </div>
    </div>
  );
}
