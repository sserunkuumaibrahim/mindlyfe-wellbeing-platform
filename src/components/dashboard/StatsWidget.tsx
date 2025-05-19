
type StatsWidgetProps = {
  title: string;
  value: string | number;
  changeLabel?: string;
  stats: { emoji: string; label: string }[];
  highlightColor?: string;
};

export default function StatsWidget({
  title,
  value,
  changeLabel,
  stats,
  highlightColor = "bg-blue-50 text-blue-500",
}: StatsWidgetProps) {
  return (
    <div className="rounded-3xl bg-white/80 shadow-glass px-9 py-7 flex flex-col min-h-[180px] border border-[#e6ecf7]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[1.22rem] font-bold text-gray-700 font-dmsans">{title}</span>
        {changeLabel && (
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${highlightColor}`}>{changeLabel}</span>
        )}
      </div>
      <div className="text-4xl font-extrabold text-primary font-dmsans leading-none">{value}</div>
      <ul className="mt-2 space-y-2 text-base text-[#678fb2]">
        {stats.map((stat, i) => (
          <li key={i} className="flex items-center gap-2"><span>{stat.emoji}</span> {stat.label}</li>
        ))}
      </ul>
    </div>
  );
}
