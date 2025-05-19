
import React, { useState } from "react";
import AppSidebar from "@/components/layout/AppSidebar";

const questions = [
  {
    question: "How would you describe your current mood?",
    options: ["Happy", "Neutral", "Stressed", "Sad"],
  },
  {
    question: "How well have you slept in the past week?",
    options: [
      "Very well",
      "Moderately well",
      "Poorly",
      "Very poorly",
    ],
  },
];

export default function AssessmentPage() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));

  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 px-8 py-12">
        <h1 className="font-extrabold text-3xl mb-4 text-blue-700">Mental Health Assessment</h1>
        <div className="bg-white/80 rounded-xl shadow px-8 py-6 max-w-2xl">
          <h2 className="text-lg font-bold mb-2">Daily Check-In</h2>
          {questions.map((q, idx) => (
            <div key={idx} className="mb-4">
              <div className="font-medium mb-1">{q.question}</div>
              <div className="flex gap-3">
                {q.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={answers[idx] === opt}
                      onChange={() => {
                        const n = [...answers];
                        n[idx] = opt;
                        setAnswers(n);
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white/70 rounded-xl shadow px-8 py-4 mt-6">
          <h2 className="text-lg font-bold mb-2">AI Assessment Summary</h2>
          <p>
            <span className="font-medium">Your Results:</span>{" "}
            {answers.every((ans) => !!ans)
              ? "Thank you for completing today's assessment! Personalized insights and recommendations are coming soon."
              : "Please answer all questions to see your AI-powered summary."}
          </p>
        </div>
      </div>
    </div>
  );
}
