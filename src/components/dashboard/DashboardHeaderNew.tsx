
import { Bell, Search, CircleUser } from "lucide-react";

export default function DashboardHeaderNew() {
  return (
    <div className="flex items-center justify-between w-full pr-4 pt-4 pb-2 mb-3">
      <h1 className="font-dmsans font-bold text-[2.7rem] leading-tight text-slate-800 tracking-tight pl-2">
        Hey, Amanda! Glad to have you back <span className="align-middle select-none">🙌</span>
      </h1>
      <div className="flex items-center gap-4">
        <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-card mr-1 hover:bg-blue-50">
          <Search className="text-[#a5b5cb]" size={22} />
        </button>
        <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-card hover:bg-blue-50">
          <Bell className="text-[#a5b5cb]" size={22} />
        </button>
        <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-card ml-2 bg-white border-2 border-white">
          <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full object-cover" alt="Profile" />
        </div>
      </div>
    </div>
  );
}
