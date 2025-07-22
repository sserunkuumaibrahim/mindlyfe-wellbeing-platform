
import { PlayIcon } from "lucide-react";

interface Session {
  title: string;
  therapist: string;
  duration: string;
}

export default function RecentSessionsWidget({ recentSessions }: { recentSessions: Session[] }) {
  return (
    <div className="rounded-[32px] bg-white/70 backdrop-blur-lg shadow-xl px-8 py-6 flex flex-col min-h-[260px] border border-[#e5eaf3]">
      <div className="font-bold text-lg mb-1 text-gray-700 font-dashboard">Records of recent sessions</div>
      <div className="text-xs text-[#92a2bf] mb-4">View or download recordings of your sessions for review and analysis</div>
      <div className="flex-1 flex flex-col gap-2">
        {recentSessions.map((session, i) => (
          <div key={i} className="flex items-center bg-white/80 rounded-xl py-3 px-3 gap-3 shadow-sm hover:scale-101">
            <button className="rounded-full h-9 w-9 bg-primary/10 text-primary flex items-center justify-center mr-2">
              <PlayIcon size={20} />
            </button>
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">{session.title}</div>
              <div className="text-xs text-[#92a2bf]">{session.therapist} · {session.duration}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
