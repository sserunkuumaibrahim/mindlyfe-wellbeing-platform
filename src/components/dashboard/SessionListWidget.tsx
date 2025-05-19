
import { PlayIcon } from "lucide-react";

type Session = { title: string; therapist: string; duration: string };
type SessionListWidgetProps = {
  title: string;
  description?: string;
  sessions: Session[];
};
export default function SessionListWidget({
  title,
  description,
  sessions,
}: SessionListWidgetProps) {
  return (
    <div className="rounded-3xl bg-white/80 shadow-glass px-9 py-8 flex flex-col min-h-[230px] border border-[#e6ecf7]">
      <div className="font-bold text-xl mb-1 text-gray-800 font-dmsans">{title}</div>
      <div className="text-base text-[#95acc4] mb-5 font-dmsans">{description}</div>
      <div className="flex-1 flex flex-col gap-3">
        {sessions.map((session, i) => (
          <div key={i} className="flex items-center bg-white/60 rounded-xl py-4 px-4 gap-4 shadow-sm hover:scale-101 transition">
            <button className="rounded-full h-10 w-10 bg-primary/10 text-primary flex items-center justify-center mr-2 hover:bg-primary/20 shadow">
              <PlayIcon size={20} />
            </button>
            <div className="flex-1">
              <div className="font-medium text-base text-gray-800 font-dmsans">{session.title}</div>
              <div className="text-xs text-[#90aac7] font-dmsans">{session.therapist} · {session.duration}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
