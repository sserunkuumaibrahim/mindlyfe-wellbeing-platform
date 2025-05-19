
export default function AssessmentPage() {
  return (
    <div className="p-10">
      <h1 className="font-dmsans font-extrabold text-3xl mb-3 text-blue-700">Mental Health Assessment</h1>
      <div className="space-y-4">
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold text-lg">Initial Assessment</h2>
          <ul className="list-disc pl-5 mt-1 text-[17px] font-dmsans text-gray-700 space-y-1">
            <li>Comprehensive mental health questionnaire</li>
            <li>Personalized assessment (mood, stress, sleep, activities, interactions)</li>
            <li>AI-powered analysis & recommendations</li>
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow">
          <h2 className="font-bold text-lg">Progress Tracking</h2>
          <ul className="list-disc pl-5 mt-1 text-[17px] font-dmsans text-gray-700 space-y-1">
            <li>Daily mood tracking</li>
            <li>Weekly/monthly reports & reviews</li>
            <li>Goal setting & achievement milestones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
