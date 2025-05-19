
export default function UrgentSupportCard() {
  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-[#59caff] via-[#7fdcff] to-[#d6f2ff] px-8 py-8 shadow-card flex flex-col border border-[#b4e3fa] min-h-[269px] relative overflow-hidden">
      <div className="font-bold text-white text-lg font-dmsans mb-2">Urgent Support</div>
      <div className="text-white/90 text-base font-dmsans mb-5 max-w-xs">
        Quick access to crisis hotlines when you need immediate help
      </div>
      <button className="rounded-full border border-white bg-transparent hover:bg-white/15 text-white font-bold text-base px-6 py-2 mb-1 font-dmsans transition shadow">
        Get help now
      </button>
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=600&q=80"
        alt="Lotus"
        className="absolute right-0 bottom-0 w-40 h-20 object-contain opacity-90 select-none pointer-events-none"
        style={{ filter: "drop-shadow(0 6px 16px rgba(40,153,252,0.14))" }}
      />
    </div>
  );
}
