import React from "react";
import AppPageLayout from "@/components/ui/AppPageLayout";
import StatCard from "@/components/ui/StatCard";
import PillBadge from "@/components/ui/PillBadge";
import { Progress } from "@/components/ui/progress";

const PROGRESS = {
  goals: 14,
  goalsChange: "+15%",
  sources: 22,
  sourcesChange: "-30%",
  sessions: 6,
  sessionsChange: "+5%",
  goalsProgress: 71,
  sessionsProgress: 73,
};

export default function Dashboard() {
  return (
    <AppPageLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your wellness dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatCard
          title="Progress Tracking"
          value={PROGRESS.goals}
          description="Therapy goals achieved over the last 3 months"
          badge={<PillBadge label={PROGRESS.goalsChange} color="green" />}
          progress={PROGRESS.goalsProgress}
        />
        <StatCard
          title="Educational Sources"
          value={PROGRESS.sources}
          badge={<PillBadge label={PROGRESS.sourcesChange} color="blue" />}
        >
          <ul className="mt-1 space-y-1 text-sm">
            <li className="flex items-center gap-2"><span>🧘</span> Breathing and meditation techniques</li>
            <li className="flex items-center gap-2"><span>🔎</span> Identifying sources of stress</li>
          </ul>
        </StatCard>
        <StatCard
          title="Therapeutic Sessions"
          value={PROGRESS.sessions}
          description="Sessions were held this month"
          badge={<PillBadge label={PROGRESS.sessionsChange} color="green" />}
          progress={PROGRESS.sessionsProgress}
        />
      </div>
      
    </AppPageLayout>
  );
}
