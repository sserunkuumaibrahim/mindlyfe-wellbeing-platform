
import React from "react";

interface Progress {
  goalsChange: string;
  goalsAchieved: number;
  goalsProgress: number;
  sourcesChange: string;
  sources: number;
  sessionsChange: string;
  sessions: number;
  sessionsProgress: number;
}

export default function ProgressWidgets({ progress }: { progress: Progress }) {
  return (
    <>
      <div className="rounded-[32px] bg-white/70 backdrop-blur-lg shadow-xl px-8 py-7 flex flex-col min-h-[168px] border border-[#e5eaf3]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-700 font-dashboard">Progress Tracking</span>
          <span className="text-xs font-bold px-3 py-[3px] bg-green-100 text-green-600 rounded-[16px]">{progress.goalsChange}</span>
        </div>
        <div className="text-4xl font-extrabold text-primary font-dashboard">{progress.goalsAchieved}</div>
        <div className="text-sm text-[#7c8ca2] mb-2">Therapy goals achieved over the last 3 months</div>
        <div className="w-full h-3 rounded-xl bg-[#e6f0fa] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#aee2ff] to-[#62b6fd] rounded-xl transition-all duration-500" style={{ width: `${progress.goalsProgress}%` }} />
        </div>
      </div>
      <div className="rounded-[32px] bg-white/70 backdrop-blur-lg shadow-xl px-8 py-7 flex flex-col min-h-[168px] border border-[#e5eaf3]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-700 font-dashboard">Educational Sources</span>
          <span className="text-xs font-bold px-3 py-[3px] bg-blue-100 text-blue-600 rounded-[16px]">{progress.sourcesChange}</span>
        </div>
        <div className="text-4xl font-extrabold text-primary font-dashboard">{progress.sources}</div>
        <ul className="mt-1 space-y-1 text-[15px] text-[#5479a7]">
          <li className="flex items-center gap-2"><span className="text-lg">🧘</span> Breathing and meditation techniques</li>
          <li className="flex items-center gap-2"><span className="text-lg">🔎</span> Identifying sources of stress</li>
        </ul>
      </div>
      <div className="rounded-[32px] bg-white/70 backdrop-blur-lg shadow-xl px-8 py-7 flex flex-col min-h-[168px] border border-[#e5eaf3]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-700 font-dashboard">Therapeutic Sessions</span>
          <span className="text-xs font-bold px-3 py-[3px] bg-green-100 text-green-600 rounded-[16px]">{progress.sessionsChange}</span>
        </div>
        <div className="text-4xl font-extrabold text-primary font-dashboard">{progress.sessions}</div>
        <div className="text-sm text-[#7c8ca2] mb-2">Sessions were held this month</div>
        <div className="w-full h-3 rounded-xl bg-[#e6f0fa] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#d8fff6] to-[#a4f3e3] rounded-xl transition-all duration-500" style={{ width: `${progress.sessionsProgress}%` }} />
        </div>
      </div>
    </>
  );
}
