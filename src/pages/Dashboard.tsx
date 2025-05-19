
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Activity,
  CalendarDays,
  MessageSquare,
  Book,
  User,
  Settings,
  Bell,
  CircleUser,
  Plus,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartLegend, ChartTooltip } from "@/components/ui/chart";
import { useState } from "react";

const navItems = [
  { icon: Activity, label: "Dashboard" },
  { icon: CalendarDays, label: "Appointments" },
  { icon: User, label: "Profile" },
  { icon: Book, label: "Resources" },
  { icon: MessageSquare, label: "Community" },
  { icon: Settings, label: "Settings" },
];

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  // Placeholder data for charts and widgets
  const [progress] = useState({
    goalsAchieved: 14,
    goalsChange: "+15%",
    sources: 22,
    sourcesChange: "-30%",
    sessions: 6,
    sessionsChange: "+5%",
    exercises: [
      {
        label: "Gratitude journal",
        icon: "📝",
        progress: 98,
        duration: "6h 32min",
        category: "Positive thinking",
        actions: { completed: 16, comments: 3 },
      },
      {
        label: "The power of awareness",
        icon: "🧠",
        progress: 55,
        duration: "1h 40min",
        category: "Mindfulness",
        actions: { completed: 1, comments: 1 },
      },
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

  // Mock chart data
  const emotionalData = [
    { name: "16 Aug", value: 45 },
    { name: "17 Aug", value: 50 },
    { name: "18 Aug", value: 60 },
    { name: "19 Aug", value: 80 },
    { name: "20 Aug", value: 66 },
    { name: "21 Aug", value: 72 },
    { name: "22 Aug", value: 58 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fbff] to-[#e9f6ff] dark:from-background dark:to-muted/10 flex">
      {/* Glassy Vertical Sidebar */}
      <nav className="w-[86px] min-w-[86px] py-6 px-2 flex flex-col gap-3 items-center bg-white/80 dark:bg-muted/80 shadow-lg glass-morphism rounded-r-3xl animate-slide-in">
        <div className="mb-8">
          <div className="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center text-xl shadow-lg hover:scale-105 transition">{/* Logo/HB */}
            <span className="font-bold">M</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 items-center flex-1">
          {navItems.map(({ icon: Icon, label }, idx) => (
            <Button
              key={label}
              variant="ghost"
              size="icon"
              className={`w-14 h-14 rounded-full hover-scale shadow-lg relative ${idx === 0 ? "bg-primary/90 text-white" : "bg-background/70"} transition`}
              aria-label={label}
              tabIndex={0}
            >
              <Icon size={28} />
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full mt-8"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          aria-label="Sign Out"
        >
          <Loader size={22} />
        </Button>
      </nav>

      {/* Main Area */}
      <main className="flex-1 flex flex-col gap-7 px-4 xl:px-10 py-8 transition-all">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Hey, {user?.firstName || "Amanda"}! Glad to have you back <span className="animate-bounce inline-block">🙌</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80 fade-in" aria-label="Notifications">
              <Bell className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80 fade-in" aria-label="Profile">
              <CircleUser className="h-7 w-7 text-primary" />
            </Button>
          </div>
        </header>

        {/* Row 1: Progress Widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 fade-in">
          <Card className="rounded-3xl glass-morphism p-6 flex flex-col gap-3 animate-scale-in">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Progress Tracking</span>
              <span className="text-xs py-1 px-2 rounded-xl bg-green-100 text-green-600">{progress.goalsChange}</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-primary">{progress.goalsAchieved}</div>
            <div className="text-sm text-muted-foreground mb-2">Therapy goals achieved over the last 3 months</div>
            <Progress value={71} className="h-2 rounded bg-muted" />
          </Card>
          <Card className="rounded-3xl glass-morphism p-6 flex flex-col gap-3 animate-scale-in">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Educational Sources</span>
              <span className="text-xs py-1 px-2 rounded-xl bg-blue-100 text-blue-600">{progress.sourcesChange}</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-primary">{progress.sources}</div>
            <ul className="mt-1 space-y-1">
              <li className="flex items-center gap-2 text-sm"><span className="text-lg">🧘</span> Breathing and meditation techniques</li>
              <li className="flex items-center gap-2 text-sm"><span className="text-lg">🔎</span> Identifying sources of stress</li>
            </ul>
          </Card>
          <Card className="rounded-3xl glass-morphism p-6 flex flex-col gap-3 animate-scale-in">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Therapeutic Sessions</span>
              <span className="text-xs py-1 px-2 rounded-xl bg-green-100 text-green-600">{progress.sessionsChange}</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-primary">{progress.sessions}</div>
            <div className="text-sm text-muted-foreground mb-2">Sessions were held this month</div>
            <Progress value={73} className="h-2 rounded bg-muted" />
          </Card>
          {/* Upcoming Widget */}
          <Card className="rounded-3xl glass-morphism p-6 flex flex-col animate-scale-in row-span-2">
            <div className="font-semibold text-lg mb-1">Upcoming</div>
            <div className="text-xs text-muted-foreground">Your next sessions</div>
            <div className="grid grid-cols-7 text-center mt-5 text-sm font-semibold mb-2">
              {["Mo","Tu","We","Th","Fr","Sa","Su"].map(day=>(
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 text-center mb-4">
              {[21,22,23,24,25,26,27].map(num => (
                <span key={num}
                  className={`rounded-full w-8 h-8 mx-auto flex items-center justify-center ${
                    num===22 ? 'bg-primary text-white shadow-lg animate-pulse' : ''
                  }`}
                >{num}</span>
              ))}
            </div>
            <div className="flex-1 space-y-2">
              {progress.upcoming.map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-b from-primary/70 to-primary/20 flex items-center justify-center border-2 border-primary">
                    <User className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{s.therapist}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.role}</div>
                  </div>
                  <div className="text-sm font-semibold">{s.time}</div>
                  {s.today ? (
                    <span className="px-2 py-0.5 text-xs rounded-xl bg-primary/20 text-primary font-semibold">Today</span>
                  ) : (
                    <span className="px-1 text-xs text-gray-500">{s.date}</span>
                  )}
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full bg-primary text-white rounded-xl hover:bg-primary/90">
              Schedule a new consultation
            </Button>
          </Card>
        </div>

        {/* Row 2: Main Graphs/Widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Emotional State chart */}
          <Card className="rounded-3xl glass-morphism p-6 xl:col-span-2 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold">Emotional State</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl">Week</Button>
                <Button variant="ghost" size="sm" className="rounded-xl">Month</Button>
                <Button variant="ghost" size="sm" className="rounded-xl">Year</Button>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              Based on data collected during sessions with a therapist, self-tests and feedback
            </p>
            <div className="w-full h-[180px]">
              <ChartContainer config={{
                mood: { label: "Mood", color: "#21A9E1" }
              }}>
                {({ ResponsiveContainer, BarChart, XAxis, Bar, Tooltip }) => (
                  <ResponsiveContainer>
                    <BarChart data={emotionalData}>
                      <XAxis dataKey="name" />
                      <Bar dataKey="value" fill="#21A9E1" radius={[8,8,0,0]} />
                      <Tooltip content={<ChartTooltip />} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartContainer>
            </div>
          </Card>
          {/* Urgent Support Widget */}
          <Card className="rounded-3xl glass-morphism p-6 flex flex-col items-center justify-between animate-fade-in relative overflow-hidden" style={{ background: "linear-gradient(120deg, #21A9E1 75%, #e9f6ff 100%)", minHeight: 220 }}>
            <div className="absolute right-0 bottom-0 w-32 opacity-60 pointer-events-none">
              {/* Stock lotus/illustration: place a nice image if available */}
              {/* <img src="/lotus.png" alt="Lotus" /> */}
            </div>
            <div>
              <div className="font-semibold text-white text-lg">Urgent Support</div>
              <p className="text-white/90 text-sm mt-2 mb-4 max-w-xs">
                Quick access to crisis hotlines when you need immediate help
              </p>
              <Button className="mt-2 rounded-xl bg-white text-primary w-full font-bold shadow hover:bg-gray-100 animate-pulse">
                Get help now
              </Button>
            </div>
          </Card>
        </div>

        {/* Row 3: Exercises & Records */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 fade-in">
          {/* My Exercises */}
          <Card className="rounded-3xl glass-morphism p-6 animate-fade-in xl:col-span-2">
            <div className="font-semibold text-lg mb-2">My exercises</div>
            <div className="text-muted-foreground text-sm mb-4">Exercises to help maintain good physical health and support the progress of therapy</div>
            <div className="space-y-4">
              {progress.exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-white/60 px-4 py-3 shadow-sm hover:scale-101">
                  <span className="text-2xl">{ex.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{ex.label}</div>
                    <Progress value={ex.progress} className="h-2 mt-1 w-32 rounded bg-muted" />
                  </div>
                  <div className="text-sm text-muted-foreground">{ex.duration}</div>
                  <div className="text-sm">{ex.category}</div>
                  <div className="flex items-center gap-3 text-sm ml-4">
                    <span>✅ {ex.actions.completed}</span>
                    <span>💬 {ex.actions.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {/* Records of Recent Sessions */}
          <Card className="rounded-3xl glass-morphism p-6 animate-fade-in flex flex-col">
            <div className="font-semibold text-lg mb-2">Records of recent sessions</div>
            <div className="text-muted-foreground text-sm mb-3">View or download recordings of your sessions for review and analysis</div>
            <div className="flex-1 flex flex-col gap-2">
              {progress.recentSessions.map((session, i) => (
                <div key={i} className="flex items-center bg-white/60 rounded-xl py-2 px-3">
                  <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 bg-primary/10 text-primary hover:bg-primary/20 mr-2">
                    <PlayIcon />
                  </Button>
                  <div>
                    <div className="font-medium text-sm">{session.title}</div>
                    <div className="text-xs text-muted-foreground">{session.therapist} · {session.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="10" fill="#21A9E1" fillOpacity="0.18"/>
      <path d="M8.5 7.5V12.5L13 10L8.5 7.5Z" fill="#21A9E1"/>
    </svg>
  );
}
