
export default function WellnessPage() {
  return (
    <div className="p-10">
      <h1 className="font-dmsans font-extrabold text-3xl mb-3 text-blue-700">Wellness Programs</h1>
      <div className="rounded-xl bg-white/70 p-6 shadow">
        <ul className="list-disc pl-5 text-[17px] font-dmsans text-gray-700 space-y-1">
          <li>Structured: stress, anxiety, sleep, mindfulness</li>
          <li>Custom: personal goals, tracking, milestones</li>
          <li>Progress tracking, community, guidance</li>
        </ul>
      </div>
    </div>
  );
}
