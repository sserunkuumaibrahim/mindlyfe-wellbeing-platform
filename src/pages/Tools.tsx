
import React, { useState } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
export default function ToolsPage() {
  const [entries, setEntries] = useState([
    { day: "2025-05-15", mood: "Happy", note: "Had a great workout." },
    { day: "2025-05-18", mood: "Stressed", note: "Busy at work." },
  ]);
  const [newEntry, setNewEntry] = useState({ day: "", mood: "", note: "" });

  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Self-Help Tools</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-5">
          <h2 className="font-bold mb-2">Mood Journal</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th>Date</th>
                <th>Mood</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i}>
                  <td>{entry.day}</td>
                  <td>{entry.mood}</td>
                  <td>{entry.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 mt-4">
            <input
              placeholder="Date"
              className="px-2 py-1 rounded border"
              type="date"
              value={newEntry.day}
              onChange={e => setNewEntry({ ...newEntry, day: e.target.value })}
            />
            <input
              placeholder="Mood"
              className="px-2 py-1 rounded border"
              value={newEntry.mood}
              onChange={e => setNewEntry({ ...newEntry, mood: e.target.value })}
            />
            <input
              placeholder="Note"
              className="px-2 py-1 rounded border"
              value={newEntry.note}
              onChange={e => setNewEntry({ ...newEntry, note: e.target.value })}
            />
            <button
              className="px-3 py-1 rounded bg-blue-700 text-white hover:bg-blue-800"
              onClick={() => {
                if (newEntry.day && newEntry.mood && newEntry.note) {
                  setEntries([...entries, newEntry]);
                  setNewEntry({ day: "", mood: "", note: "" });
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
