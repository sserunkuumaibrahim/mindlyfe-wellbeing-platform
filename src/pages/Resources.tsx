
export default function ResourcesPage() {
  return (
    <div className="p-10">
      <h1 className="font-dmsans font-extrabold text-3xl mb-3 text-blue-700">Self-Help Resources</h1>
      <div className="grid gap-4">
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold text-lg mb-1">Content Library</h2>
          <ul className="list-disc pl-5 text-[17px] font-dmsans text-gray-700">
            <li>Articles, meditations, exercises, podcasts, tutorials</li>
            <li>Searchable educational content</li>
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold text-lg mb-1">Interactive Tools</h2>
          <ul className="list-disc pl-5 text-[17px] font-dmsans text-gray-700">
            <li>Mood & gratitude journals, habit trackers</li>
            <li>Thought diary, sleep/exercise planner</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
