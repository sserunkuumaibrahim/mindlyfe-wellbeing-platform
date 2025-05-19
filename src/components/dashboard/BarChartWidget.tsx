
import { ResponsiveContainer, BarChart, XAxis, Bar } from "recharts";

type BarChartWidgetProps = {
  title: string;
  data: { name: string; value: number }[];
  tabs?: string[];
  description?: string;
};
export default function BarChartWidget({
  title,
  data,
  tabs,
  description
}: BarChartWidgetProps) {
  return (
    <div className="rounded-3xl bg-white/80 shadow-glass px-9 py-8 flex flex-col min-h-[232px] border border-[#e6ecf7]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[1.2rem] font-bold font-dmsans text-gray-700">{title}</span>
        {tabs && (
          <div className="flex gap-3">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                className={`rounded-full px-5 py-1.5 text-xs font-dmsans font-bold ${i === 0
                  ? "bg-primary/10 text-primary"
                  : "text-gray-400 bg-white/40"
                  }`}
              >{tab}</button>
            ))}
          </div>
        )}
      </div>
      {description && <div className="text-base text-[#7c8ca2] pt-1 pb-3">{description}</div>}
      <div className="w-full h-[112px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#8fa4c2" style={{ fontSize: 14 }}/>
            <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5badff" />
                <stop offset="100%" stopColor="#ceeaff" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
