
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const settings = [
  { key: "Theme", value: "Light" },
  { key: "Notifications", value: "On" },
  { key: "Language", value: "English" },
];
export default function PersonalizationPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Personalization</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow">
          <h2 className="font-bold mb-2">User Preferences</h2>
          <ul className="list-disc ml-5">
            {settings.map((s, i) => (
              <li key={i}><span className="font-bold">{s.key}:</span>{" "}{s.value}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow mt-5">
          <h2 className="font-bold mb-2">Accessibility Options</h2>
          <ul className="list-disc ml-5">
            <li>High contrast mode</li>
            <li>Font size adjustment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
