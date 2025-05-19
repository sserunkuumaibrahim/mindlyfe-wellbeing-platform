
export default function ExercisesList({ data }: { data: any[] }) {
  return (
    <div className="rounded-[2rem] bg-white/60 shadow-card px-8 py-7 flex flex-col border border-[#dae7f5]">
      <div className="font-bold text-lg mb-1 text-[#233a56] font-dmsans">My exercises</div>
      <div className="text-sm text-[#b1bfd2] mb-4 font-dmsans">Exercises to help maintain good physical health and support the progress of therapy</div>
      <div className="flex flex-col gap-2">
        {data.map((ex, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl bg-white/70 px-3 py-3 shadow hover:scale-101 transition-all">
            <img src={ex.icon} alt="" className="w-8 h-8 rounded-md bg-[#f0f5fa] mr-2" />
            <div className="flex-1">
              <div className="font-medium text-[#233a56] font-dmsans mb-1">{ex.label}</div>
              <div className="relative w-36 h-2 rounded-full bg-[#edf3f9]">
                <div
                  className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#7fc6ff] to-[#277fff]"
                  style={{ width: `${ex.progress}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-[#a2b3c5] w-24 font-semibold font-dmsans">{ex.duration}</div>
            <div className="text-xs text-[#a2b3c5] w-28">{ex.category}</div>
            <div className="flex items-center gap-3 text-xs text-[#b8c9da] ml-3 font-dmsans">
              <span>✅ {ex.actions.completed}</span>
              <span>💬 {ex.actions.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
