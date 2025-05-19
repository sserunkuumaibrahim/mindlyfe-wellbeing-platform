
export default function UrgentSupportWidget() {
  return (
    <div className="rounded-[32px] bg-gradient-to-br from-[#21a9e1] via-[#46bdec] to-[#e9f6ff] px-8 py-7 shadow-xl flex flex-col min-h-[290px] border border-[#e5eaf3] overflow-hidden relative">
      <div className="absolute right-0 bottom-0 w-40 opacity-90 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=300&q=80" alt="Lotus" className="w-36 h-24 object-contain opacity-80" />
      </div>
      <div className="font-bold text-white text-lg">Urgent Support</div>
      <div className="text-white/90 text-sm mt-2 mb-4 max-w-xs">
        Quick access to crisis hotlines when you need immediate help
      </div>
      <button className="mt-2 rounded-xl border border-white/60 bg-white/10 text-white w-full font-bold shadow hover:bg-white/20 transition text-base py-2">
        Get help now
      </button>
    </div>
  );
}
