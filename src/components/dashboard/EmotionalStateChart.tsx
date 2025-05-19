
import { ResponsiveContainer, BarChart, XAxis, Bar } from "recharts";

export default function EmotionalStateChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="rounded-[2rem] bg-white/60 shadow-card px-8 py-8 flex flex-col border border-[#dae7f5] min-h-[269px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg font-bold font-dmsans text-[#192b44]">Emotional State</span>
        <div className="flex gap-3">
          <button className="rounded-full bg-[#ddefff] text-primary text-xs px-5 py-1.5 font-dmsans font-bold shadow-none border-0">Week</button>
          <button className="rounded-full text-[#b0bbcb] bg-[#f0f7fa] px-5 py-1.5 text-xs font-bold font-dmsans">Month</button>
          <button className="rounded-full text-[#b0bbcb] bg-[#f0f7fa] px-5 py-1.5 text-xs font-bold font-dmsans">Year</button>
        </div>
      </div>
      <div className="text-base text-[#89a0c4] pt-1 pb-2">Based on data collected during sessions with a therapist, self-tests and feedback</div>
      <div className="w-full h-[110px] mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#abbfd8" style={{ fontSize: 14 }}/>
            <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7fc6ff" />
                <stop offset="100%" stopColor="#ddefff" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
