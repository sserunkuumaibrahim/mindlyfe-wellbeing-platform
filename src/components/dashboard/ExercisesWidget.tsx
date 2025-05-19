
export default function ExercisesWidget({ exercises }: { exercises: any[] }) {
  return (
    <div className="rounded-[32px] bg-white/70 backdrop-blur-lg shadow-xl px-8 py-7 flex flex-col border border-[#e5eaf3]">
      <div className="font-bold text-lg mb-2 text-gray-700 font-dashboard">My exercises</div>
      <div className="text-sm text-[#92a2bf] mb-4">Exercises to help maintain good physical health and support the progress of therapy</div>
      <div className="space-y-4">
        {exercises.map((ex, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-white/80 px-4 py-4 shadow hover:scale-101">
            <span className="text-2xl select-none">{ex.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{ex.label}</div>
              <div className="relative w-32 h-2 rounded bg-[#e6f0fa] mt-1 mb-1">
                <div
                  className="absolute top-0 left-0 h-2 rounded bg-gradient-to-r from-[#aee2ff] to-[#62b6fd]"
                  style={{ width: `${ex.progress}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-600 w-20 font-semibold">{ex.duration}</div>
            <div className="text-xs text-gray-600 font-semibold w-28">{ex.category}</div>
            <div className="flex items-center gap-3 text-xs text-[#a3adc2] ml-4 font-semibold">
              <span>✅ {ex.actions.completed}</span>
              <span>💬 {ex.actions.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
