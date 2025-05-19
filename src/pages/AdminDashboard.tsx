
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const stats = {
  users: 529,
  therapists: 18,
  sessions: 92,
};
export default function AdminDashboardPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Admin Dashboard</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow mb-5">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.users}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.therapists}</div>
              <div className="text-sm text-gray-600">Therapists</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.sessions}</div>
              <div className="text-sm text-gray-600">Active Sessions</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <ul className="list-disc pl-5 text-[17px] font-dmsans text-gray-700">
            <li>User/account management, roles, security</li>
            <li>Content/program management, analytics</li>
            <li>Integration setup, backup, compliance reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
