import { Button } from "@/components/ui/button";
import { Bell, CircleUser } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function DashboardHeader() {
  // Only use mock data for dashboard display, fully independent of auth
  const userName = "Amanda";

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 w-full mb-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
          Hey, {userName}! Glad to have you back{" "}
          <span className="animate-bounce inline-block">🙌</span>
        </h1>
      </div>
      <div className="flex items-center gap-4 mt-2 sm:mt-0 self-end">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80 fade-in" aria-label="Notifications">
          <Bell className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80 fade-in" aria-label="Profile">
          <CircleUser className="h-7 w-7 text-primary" />
        </Button>
      </div>
    </header>
  );
}
