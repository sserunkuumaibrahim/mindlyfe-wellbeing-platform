
export default function PersonalizationPage() {
  return (
    <div className="p-10">
      <h1 className="font-dmsans font-extrabold text-3xl mb-3 text-blue-700">Personalization</h1>
      <div className="rounded-xl bg-white/70 p-6 shadow">
        <ul className="list-disc pl-5 text-[17px] font-dmsans text-gray-700 space-y-1">
          <li>User preferences, themes, accessibility</li>
          <li>Adaptive content, goal recommendations</li>
          <li>Language selection, notification settings</li>
        </ul>
      </div>
    </div>
  );
}
