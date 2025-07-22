
import { Play } from "lucide-react";

interface SessionRecord {
  title: string;
  therapist: string;
  duration: string;
}

export default function SessionRecords({ data }: { data: SessionRecord[] }) {
  return (
    <div className="rounded-[2rem] bg-white/60 shadow-card px-8 py-7 border border-[#dae7f5]">
      <div className="font-bold text-lg mb-1 text-[#233a56] font-dmsans">Records of recent sessions</div>
      <div className="text-sm text-[#b1bfd2] mb-4 font-dmsans">View or download recordings of your sessions for review and analysis</div>
      <div className="flex flex-col gap-3">
        {data.map((session, i) => (
          <div key={i} className="flex items-center bg-white/80 rounded-xl py-3 px-3 gap-3 shadow-sm hover:scale-101">
            <button className="rounded-full h-9 w-9 bg-primary/10 text-primary flex items-center justify-center mr-2">
              <Play size={18} />
            </button>
            <div className="flex-1">
              <div className="font-medium text-base text-[#233a56] font-dmsans">{session.title}</div>
              <div className="text-xs text-[#90aac7] font-dmsans">{session.therapist} · {session.duration}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
