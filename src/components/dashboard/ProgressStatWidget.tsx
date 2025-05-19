
export default function ProgressStatWidget({ value, change, progress }:
  { value: number, change: string, progress: number }) {
  return (
    <div className="rounded-[2rem] bg-white/60 shadow-card px-8 py-7 flex flex-col border border-[#dae7f5] min-h-[174px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg font-bold text-[#192b44] font-dmsans">Progress Tracking</span>
        <span className="ml-2 text-xs px-3 py-1 rounded-full bg-[#e9fae3] text-[#6bc46e] font-semibold">{change}</span>
      </div>
      <div className="text-4xl font-extrabold text-[#277fff] font-dmsans leading-none">{value}</div>
      <div className="text-[0.97rem] text-[#8aa1be] my-0.5">Therapy goals achieved over the last 3 months</div>
      <div className="w-full h-2.5 rounded-full bg-[#f0f5fc] overflow-hidden mt-2">
        <div
          className="h-full bg-gradient-to-r from-[#cae3fe] to-[#84bbfd] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
