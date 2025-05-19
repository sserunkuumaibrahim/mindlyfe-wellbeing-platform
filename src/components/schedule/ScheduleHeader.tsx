
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScheduleHeader({ userAvatar }: { userAvatar?: string }) {
  return (
    <div className="flex items-center justify-between px-2 py-5 md:py-7 gap-6">
      <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">Schedule</h1>
      <div className="flex-1 mx-4">
        <div className="flex items-center bg-white/80 rounded-full px-4 py-2 shadow-inner max-w-xl w-full relative">
          <Search className="text-zinc-400 mr-3" size={20} />
          <input
            className="flex-1 bg-transparent outline-none text-zinc-700 placeholder:text-zinc-400 text-sm"
            placeholder="Search"
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button size="icon" variant="ghost" className="rounded-full">
          <span className="relative">
            <svg className="text-primary" width="23" height="23" fill="none"><circle cx="12" cy="12" r="10" stroke="#277fff" strokeWidth="2" /></svg>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </span>
        </Button>
        <img
          src={userAvatar || "/lovable-uploads/b2301cde-7b47-44db-9383-36476ebb83c9.png"}
          alt="User"
          className="w-9 h-9 rounded-full object-cover border-2 border-white"
        />
      </div>
    </div>
  );
}
