
interface ScheduleItem {
  avatar: string;
  therapist: string;
  role: string;
  time: string;
  today?: boolean;
  date?: string;
}

export default function UpcomingSchedule({ data }: { data: ScheduleItem[] }) {
  return (
    <div className="rounded-[2rem] bg-white/60 shadow-card px-8 py-8 border border-[#dae7f5] min-h-[375px]">
      <div className="font-bold text-lg mb-1 text-[#182d44] font-dmsans">Upcoming</div>
      <div className="text-sm text-[#b1bfd2] mb-3 font-dmsans">Your next sessions</div>
      <div className="grid grid-cols-7 text-center mb-2 text-[15px] text-[#b1bfd2] font-semibold font-dmsans">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center mb-6">
        {[21, 22, 23, 24, 25, 26, 27].map(num => (
          <span key={num}
            className={`rounded-full w-9 h-9 mx-auto flex items-center justify-center text-[16px] font-dmsans font-bold ${
              num === 22 ? "bg-primary text-white shadow-lg animate-pulse" : "text-[#c7d9e6]"
            }`}
          >{num}</span>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {data.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <img src={s.avatar} alt={s.therapist} className="h-8 w-8 rounded-full object-cover border-2 border-[#e3eefb] bg-white" />
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold truncate text-[#233a56] font-dmsans">{s.therapist}</div>
              <div className="text-xs text-[#b1bfd2] truncate font-dmsans">{s.role}</div>
            </div>
            <div className="text-base font-semibold text-[#1d416e] font-dmsans">{s.time}</div>
            {s.today ? (
              <span className="px-3 py-0.5 text-xs rounded-xl bg-primary/15 text-primary font-semibold font-dmsans">Today</span>
            ) : (
              <span className="px-2 text-xs text-[#b1bfd2] font-dmsans">{s.date}</span>
            )}
          </div>
        ))}
      </div>
      <button className="mt-7 w-full bg-[#193956] hover:bg-primary text-white rounded-full py-3 font-bold text-base font-dmsans transition">
        Schedule a new consultation
      </button>
    </div>
  );
}
