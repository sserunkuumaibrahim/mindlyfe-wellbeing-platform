
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const therapists = [
  { name: "Darlene Robertson", specialty: "Family therapist", lang: "EN", rating: 4.8 },
  { name: "Emily Carter", specialty: "Psychotherapist", lang: "FR", rating: 4.6 },
  { name: "Max Worthington", specialty: "Child psychologist", lang: "DE", rating: 4.7 }
];
export default function SupportPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Professional Support</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow">
          <h2 className="font-bold mb-2">Available Therapists</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {therapists.map((t, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="font-bold">{t.name}</div>
                <div className="text-sm text-blue-600">{t.specialty}</div>
                <div className="text-xs text-gray-500">Language: {t.lang}</div>
                <div className="text-yellow-500 font-medium">★ {t.rating.toFixed(1)}</div>
                <button className="mt-2 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium">Book Session</button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow mt-5">
          <h2 className="font-bold mb-2">Secure Messaging</h2>
          <p>Coming soon: Message your therapist securely here.</p>
        </div>
      </div>
    </div>
  );
}
