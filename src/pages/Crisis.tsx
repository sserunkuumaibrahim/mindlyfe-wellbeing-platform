
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const hotline = "1-800-CRISIS";
const contacts = [
  { name: "Family", phone: "123-456-7890" },
  { name: "School Counselor", phone: "098-765-4321" }
];
export default function CrisisPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-red-600">Crisis Support</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-5">
          <h2 className="font-bold mb-2">Emergency Contacts</h2>
          <ul className="ml-5">
            {contacts.map((c, i) => (
              <li key={i}><span className="font-bold">{c.name}:</span> {c.phone}</li>
            ))}
          </ul>
          <div className="mt-3 font-bold text-lg text-red-600">24/7 Hotline: {hotline}</div>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold mb-2">Quick Access to Help</h2>
          <button className="rounded px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-semibold">Get Help Now</button>
        </div>
      </div>
    </div>
  );
}
