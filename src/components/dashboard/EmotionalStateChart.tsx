
import { ResponsiveContainer, BarChart, XAxis, Bar } from "recharts";

export default function EmotionalStateChart({ emotionalData }: { emotionalData: { name: string; value: number }[] }) {
  return (
    <div className="rounded-[32px] bg-white/70 backdrop-blur-lg shadow-xl px-8 py-7 flex flex-col min-h-[290px] border border-[#e5eaf3]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg font-bold font-dashboard text-gray-700">Emotional State</span>
        <div className="flex gap-2">
          <button className="rounded-xl bg-primary/10 text-primary text-xs px-4 py-1.5 font-bold">Week</button>
          <button className="rounded-xl text-gray-400 bg-white/40 px-4 py-1.5 text-xs font-bold">Month</button>
          <button className="rounded-xl text-gray-400 bg-white/40 px-4 py-1.5 text-xs font-bold">Year</button>
        </div>
      </div>
      <div className="text-[15px] text-[#7c8ca2] mb-2">
        Based on data collected during sessions with a therapist, self-tests and feedback
      </div>
      <div className="w-full h-[124px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={emotionalData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#a3adc2" style={{ fontSize: 14 }}/>
            <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#66b2ff" />
                <stop offset="100%" stopColor="#c8d7fa" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
