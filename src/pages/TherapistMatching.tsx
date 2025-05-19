
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const mockTherapists = [
  { name: "Jane Williams", specialty: "CBT Specialist", available: true, languages: ["EN", "ES"] },
  { name: "Martin P.", specialty: "Anxiety, Mindfulness", available: false, languages: ["EN"] },
  { name: "Sofia Lee", specialty: "Relationship therapy", available: true, languages: ["FR", "ENG"] },
];
export default function TherapistMatchingPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Therapist Matching</h1>
        <div className="bg-white/80 rounded-xl p-6 shadow">
          <h2 className="font-bold mb-3">Recommended Therapists</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Name</th>
                <th className="text-left py-1">Specialty</th>
                <th className="text-center py-1">Available</th>
                <th className="text-left py-1">Languages</th>
              </tr>
            </thead>
            <tbody>
              {mockTherapists.map((t, i) => (
                <tr key={i}>
                  <td className="font-medium">{t.name}</td>
                  <td>{t.specialty}</td>
                  <td className="text-center">
                    {t.available ? <span className="text-green-600">Yes</span> : <span className="text-red-500">No</span>}
                  </td>
                  <td>{t.languages.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow mt-5">
          <h2 className="font-bold mb-2">Book a Consultation</h2>
          <button className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 font-semibold">Book Video Call</button>
        </div>
      </div>
    </div>
  );
}
