
import React from "react";
import SidebarPillNav from "@/components/dashboard/SidebarPillNav";
import DashboardHeaderNew from "@/components/dashboard/DashboardHeaderNew";
import PageGrid from "@/components/dashboard/PageGrid";
import ProgressStatWidget from "@/components/dashboard/ProgressStatWidget";
import EduStatWidget from "@/components/dashboard/EduStatWidget";
import SessionStatWidget from "@/components/dashboard/SessionStatWidget";
import EmotionalStateChart from "@/components/dashboard/EmotionalStateChart";
import UrgentSupportCard from "@/components/dashboard/UrgentSupportCard";
import UpcomingSchedule from "@/components/dashboard/UpcomingSchedule";
import ExercisesList from "@/components/dashboard/ExercisesList";
import SessionRecords from "@/components/dashboard/SessionRecords";

const dashboardData = {
  progress: {
    goalsAchieved: 14,
    goalsChange: "+15%",
    sources: 22,
    sourcesChange: "-30%",
    sessions: 6,
    sessionsChange: "+5%",
    goalsProgress: 98,
    sessionsProgress: 55,
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
      icon: "/lovable-uploads/9dbea15a-597b-4b76-802f-e165c195a65e.png",
      label: "Gratitude journal",
      progress: 98,
      duration: "6h 32min",
      category: "Positive thinking",
      actions: { completed: 16, comments: 3 },
    },
    {
      icon: "/lovable-uploads/9dbea15a-597b-4b76-802f-e165c195a65e.png",
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
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#eaf2fa] via-[#e2eff8] to-[#e6f3f9] font-dmsans antialiased">
      <SidebarPillNav />
      <main className="flex-1 flex flex-col items-center pl-44 px-0">
        <DashboardHeaderNew />
        <PageGrid
          left={
            <>
              <div className="grid grid-cols-3 gap-6">
                <ProgressStatWidget
                  value={dashboardData.progress.goalsAchieved}
                  change={dashboardData.progress.goalsChange}
                  progress={dashboardData.progress.goalsProgress}
                />
                <EduStatWidget
                  value={dashboardData.progress.sources}
                  change={dashboardData.progress.sourcesChange}
                />
                <SessionStatWidget
                  value={dashboardData.progress.sessions}
                  change={dashboardData.progress.sessionsChange}
                  progress={dashboardData.progress.sessionsProgress}
                />
              </div>
              <div className="grid grid-cols-[2fr_1fr] gap-6 mt-4">
                <EmotionalStateChart data={dashboardData.emotionalData} />
                <UrgentSupportCard />
              </div>
              <div className="mt-4">
                <ExercisesList data={dashboardData.exercises} />
              </div>
            </>
          }
          right={
            <div className="flex flex-col gap-4">
              <UpcomingSchedule data={dashboardData.upcoming} />
              <SessionRecords data={dashboardData.recentSessions} />
            </div>
          }
        />
      </main>
    </div>
  );
}
