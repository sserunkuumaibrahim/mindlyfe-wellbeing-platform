
import { CheckCircle } from "lucide-react";

export default function EduStatWidget({ value, change }: { value: number, change: string }) {
  return (
    <div className="rounded-[2rem] bg-white/60 shadow-card px-8 py-7 flex flex-col border border-[#dae7f5] min-h-[174px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg font-bold text-[#192b44] font-dmsans">Educational Sources</span>
        <span className="ml-2 text-xs px-3 py-1 rounded-full bg-[#eaf4ff] text-[#4f9eff] font-semibold">{change}</span>
      </div>
      <div className="text-4xl font-extrabold text-[#277fff] font-dmsans leading-none">{value}</div>
      <ul className="mt-2.5 mb-1.5 space-y-2 text-base text-[#90aac4] font-dmsans">
        <li className="flex items-center gap-2">
          <CheckCircle size={18} className="text-[#badcff]" />
          Breathing and meditation techniques
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle size={18} className="text-[#badcff]" />
          Identifying sources of stress
        </li>
      </ul>
    </div>
  );
}
