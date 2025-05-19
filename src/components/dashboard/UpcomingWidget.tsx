
export default function UpcomingWidget({ upcoming }: { upcoming: any[] }) {
  return (
    <div className="rounded-[32px] bg-white/70 backdrop-blur-lg shadow-xl px-8 py-6 flex flex-col min-h-[360px] border border-[#e5eaf3]">
      <div className="font-bold text-lg mb-1 text-gray-700 font-dashboard">Upcoming</div>
      <div className="text-xs text-[#92a2bf] mb-4">Your next sessions</div>
      <div className="grid grid-cols-7 text-center mb-2 text-[15px] text-[#8293ad] font-semibold">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center mb-4">
        {[21, 22, 23, 24, 25, 26, 27].map(num => (
          <span key={num}
            className={`rounded-full w-8 h-8 mx-auto flex items-center justify-center text-[15px] font-bold ${
              num === 22 ? "bg-primary text-white shadow-lg animate-pulse" : "text-[#b0bedb]"
            }`}
          >{num}</span>
        ))}
      </div>
      <div className="flex-1 space-y-1">
        {upcoming.map((s, i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <img src={s.avatar} alt={s.therapist} className="h-9 w-9 rounded-full object-cover border-2 border-primary bg-white"/>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate text-gray-800">{s.therapist}</div>
              <div className="text-xs text-[#96a3bc] truncate">{s.role}</div>
            </div>
            <div className="text-sm font-semibold text-gray-700">{s.time}</div>
            {s.today ? (
              <span className="px-2 py-0.5 text-xs rounded-xl bg-primary/10 text-primary font-semibold">Today</span>
            ) : (
              <span className="px-1 text-xs text-gray-400">{s.date}</span>
            )}
          </div>
        ))}
      </div>
      <button className="mt-4 w-full bg-primary text-white rounded-xl hover:bg-primary/90 py-3 font-bold text-base transition">
        Schedule a new consultation
      </button>
    </div>
  );
}
