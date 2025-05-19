
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const admins = [
  { name: "Admin User", role: "System Admin" },
  { name: "Therapist Jane", role: "Therapist" }
];
export default function AdminPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Admin Panel</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-4">
          <h2 className="font-bold mb-2">User Management</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => (
                <tr key={i}>
                  <td>{a.name}</td>
                  <td>{a.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold mb-2">System Settings</h2>
          <ul className="list-disc ml-5">
            <li>Backup Management</li>
            <li>Integration Setup</li>
            <li>Compliance Monitoring</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
