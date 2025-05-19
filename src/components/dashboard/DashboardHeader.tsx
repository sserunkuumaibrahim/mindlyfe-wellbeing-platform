
import { Bell, CircleUser } from "lucide-react";

export default function DashboardHeader() {
  const userName = "Amanda";
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full mb-2">
      <div>
        <h1 className="text-4xl font-bold leading-snug text-slate-800 mb-1 font-dashboard tracking-tight">
          Hey, {userName}! Glad to have you back <span className="animate-bounce inline-block">🙌</span>
        </h1>
      </div>
      <div className="flex items-center gap-4 mt-2 sm:mt-0">
        <button className="rounded-full w-14 h-14 flex items-center justify-center bg-white/80 hover:bg-white/90 shadow-lg transition-colors">
          <Bell className="h-7 w-7 text-primary" />
        </button>
        <button className="rounded-full w-14 h-14 flex items-center justify-center bg-white/80 shadow-lg hover:bg-white/90 transition-colors">
          <CircleUser className="h-8 w-8 text-blue-300" />
        </button>
      </div>
    </header>
  );
}
