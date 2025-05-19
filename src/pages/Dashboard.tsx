
import React from "react";
import FloatingSidebar from "@/components/ui/FloatingSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PageGrid from "@/components/dashboard/PageGrid";
import ProgressWidget from "@/components/dashboard/ProgressWidget";
import StatsWidget from "@/components/dashboard/StatsWidget";
import BarChartWidget from "@/components/dashboard/BarChartWidget";
import UrgentSupportWidget from "@/components/dashboard/UrgentSupportWidget";
import UpcomingWidget from "@/components/dashboard/UpcomingWidget";
import ExercisesWidget from "@/components/dashboard/ExercisesWidget";
import SessionListWidget from "@/components/dashboard/SessionListWidget";

const dashboardData = {
  progress: {
    goalsAchieved: 14,
    goalsChange: "+15%",
    sources: 22,
    sourcesChange: "-30%",
    sessions: 6,
    sessionsChange: "+5%",
    goalsProgress: 71,
    sessionsProgress: 73,
  },
  emotionalData: [
    { name: "16 Aug", value: 40 },
    { name: "17 Aug", value: 50 },
    { name: "18 Aug", value: 55 },
    { name: "19 Aug", value: 80 },
    { name: "20 Aug", value: 75 },
    { name: "21 Aug", value: 90 },
    { name: "22 Aug", value: 55 },
  ],
  exercises: [
    {
      icon: "📝",
      label: "Gratitude journal",
      progress: 98,
      duration: "6h 32min",
      category: "Positive thinking",
      actions: { completed: 16, comments: 3 },
    },
    {
      icon: "🧠",
      label: "The power of awareness",
      progress: 55,
      duration: "1h 40min",
      category: "Mindfulness",
      actions: { completed: 1, comments: 1 },
    },
  ],
  upcoming: [
    {
      therapist: "Dr. McCoy",
      role: "Psychotherapist",
      time: "12:00",
      date: "Today",
      today: true,
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    {
      therapist: "Darlene Robertson",
      role: "Family therapist",
      time: "18:30",
      date: "24 Aug",
      today: false,
      avatar: "https://randomuser.me/api/portraits/women/40.jpg",
    },
    {
      therapist: "Dr. McCoy",
      role: "Psychotherapist",
      time: "12:00",
      date: "28 Aug",
      today: false,
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    {
      therapist: "Darlene Robertson",
      role: "Family therapist",
      time: "18:30",
      date: "30 Aug",
      today: false,
      avatar: "https://randomuser.me/api/portraits/women/40.jpg",
    },
  ],
  recentSessions: [
    {
      title: "Protecting personal space",
      therapist: "Dr. McCoy",
      duration: "45min"
    },
    {
      title: "Respectful relationship s3",
      therapist: "Darlene Robertson",
      duration: "1h 7min"
    },
    {
      title: "Respectful relationship s2",
      therapist: "Darlene Robertson",
      duration: "58 min"
    },
  ],
};

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ecf4fb] via-[#e7f1fa] to-[#e3eafb] flex font-dmsans antialiased">
      <FloatingSidebar />
      <main className="flex-1 flex flex-col items-center px-0">
        {/* Header */}
        <div className="w-full max-w-7xl px-8 pt-8">
          <DashboardHeader />
        </div>
        {/* Main Dashboard Grid */}
        <PageGrid
          left={
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                <ProgressWidget
                  title="Progress Tracking"
                  value={dashboardData.progress.goalsAchieved}
                  changeLabel={dashboardData.progress.goalsChange}
                  progressPercent={dashboardData.progress.goalsProgress}
                  description="Therapy goals achieved over the last 3 months"
                  highlightColor="bg-green-100 text-green-600"
                />
                <StatsWidget
                  title="Educational Sources"
                  value={dashboardData.progress.sources}
                  changeLabel={dashboardData.progress.sourcesChange}
                  stats={[
                    { emoji: "🧘", label: "Breathing and meditation techniques" },
                    { emoji: "🔎", label: "Identifying sources of stress" }
                  ]}
                  highlightColor="bg-blue-50 text-blue-500"
                />
                <ProgressWidget
                  title="Therapeutic Sessions"
                  value={dashboardData.progress.sessions}
                  changeLabel={dashboardData.progress.sessionsChange}
                  progressPercent={dashboardData.progress.sessionsProgress}
                  description="Sessions were held this month"
                  highlightColor="bg-green-50 text-green-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-7">
                <BarChartWidget
                  title="Emotional State"
                  data={dashboardData.emotionalData}
                  description="Based on data collected during sessions with a therapist, self-tests and feedback"
                  tabs={["Week", "Month", "Year"]}
                />
                <UrgentSupportWidget />
              </div>
              <ExercisesWidget exercises={dashboardData.exercises} />
            </>
          }
          right={
            <>
              <UpcomingWidget upcoming={dashboardData.upcoming} />
              <SessionListWidget
                title="Records of recent sessions"
                description="View or download recordings of your sessions for review and analysis"
                sessions={dashboardData.recentSessions}
              />
            </>
          }
        />
      </main>
    </div>
  );
}
