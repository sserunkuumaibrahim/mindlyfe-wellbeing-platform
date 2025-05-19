import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProgressWidgets from "@/components/dashboard/ProgressWidgets";
import UpcomingWidget from "@/components/dashboard/UpcomingWidget";
import EmotionalStateChart from "@/components/dashboard/EmotionalStateChart";
import UrgentSupportWidget from "@/components/dashboard/UrgentSupportWidget";
import ExercisesWidget from "@/components/dashboard/ExercisesWidget";
import RecentSessionsWidget from "@/components/dashboard/RecentSessionsWidget";

// Move static/mock data outside the component for performance.
const DASHBOARD_PROGRESS = {
  goalsAchieved: 14,
  goalsChange: "+15%",
  sources: 22,
  sourcesChange: "-30%",
  sessions: 6,
  sessionsChange: "+5%",
  exercises: [
    { label: "Gratitude journal", icon: "📝", progress: 98, duration: "6h 32min", category: "Positive thinking", actions: { completed: 16, comments: 3 } },
    { label: "The power of awareness", icon: "🧠", progress: 55, duration: "1h 40min", category: "Mindfulness", actions: { completed: 1, comments: 1 } },
  ],
  recentSessions: [
    { title: "Protecting personal space", therapist: "Dr. McCoy", duration: "45min" },
    { title: "Respectful relationship s3", therapist: "Darlene Robertson", duration: "1h 7min" },
    { title: "Respectful relationship s2", therapist: "Darlene Robertson", duration: "58 min" },
  ],
  upcoming: [
    { date: "22 Aug", time: "12:00", therapist: "Dr. McCoy", role: "Psychotherapist", today: true },
    { date: "24 Aug", time: "18:30", therapist: "Darlene Robertson", role: "Family therapist" },
    { date: "28 Aug", time: "12:00", therapist: "Dr. McCoy", role: "Psychotherapist" },
    { date: "30 Aug", time: "18:30", therapist: "Darlene Robertson", role: "Family therapist" },
  ],
};
const DASHBOARD_EMOTIONAL_DATA = [
  { name: "16 Aug", value: 45 },
  { name: "17 Aug", value: 50 },
  { name: "18 Aug", value: 60 },
  { name: "19 Aug", value: 80 },
  { name: "20 Aug", value: 66 },
  { name: "21 Aug", value: 72 },
  { name: "22 Aug", value: 58 },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [progress] = useState({
    goalsAchieved: 14,
    goalsChange: "+15%",
    sources: 22,
    sourcesChange: "-30%",
    sessions: 6,
    sessionsChange: "+5%",
    exercises: [
      { label: "Gratitude journal", icon: "📝", progress: 98, duration: "6h 32min", category: "Positive thinking", actions: { completed: 16, comments: 3 } },
      { label: "The power of awareness", icon: "🧠", progress: 55, duration: "1h 40min", category: "Mindfulness", actions: { completed: 1, comments: 1 } },
    ],
    recentSessions: [
      { title: "Protecting personal space", therapist: "Dr. McCoy", duration: "45min" },
      { title: "Respectful relationship s3", therapist: "Darlene Robertson", duration: "1h 7min" },
      { title: "Respectful relationship s2", therapist: "Darlene Robertson", duration: "58 min" },
    ],
    upcoming: [
      { date: "22 Aug", time: "12:00", therapist: "Dr. McCoy", role: "Psychotherapist", today: true },
      { date: "24 Aug", time: "18:30", therapist: "Darlene Robertson", role: "Family therapist" },
      { date: "28 Aug", time: "12:00", therapist: "Dr. McCoy", role: "Psychotherapist" },
      { date: "30 Aug", time: "18:30", therapist: "Darlene Robertson", role: "Family therapist" },
    ],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fbff] to-[#e9f6ff] dark:from-background dark:to-muted/10 flex flex-col md:flex-row">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col gap-6 px-2 sm:px-4 xl:px-10 py-6 sm:py-8 w-full max-w-full">
        <DashboardHeader />
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-5 fade-in">
          <ProgressWidgets progress={DASHBOARD_PROGRESS} />
          <UpcomingWidget upcoming={DASHBOARD_PROGRESS.upcoming} />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
          <EmotionalStateChart emotionalData={DASHBOARD_EMOTIONAL_DATA} />
          <UrgentSupportWidget />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 fade-in">
          <ExercisesWidget exercises={DASHBOARD_PROGRESS.exercises} />
          <RecentSessionsWidget recentSessions={DASHBOARD_PROGRESS.recentSessions} />
        </div>
      </main>
    </div>
  );
}
