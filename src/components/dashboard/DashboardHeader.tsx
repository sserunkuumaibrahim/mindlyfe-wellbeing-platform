
import { Button } from "@/components/ui/button";
import { Bell, CircleUser } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function DashboardHeader() {
  const { user } = useAuthStore();

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Hey, {user?.firstName || "Amanda"}! Glad to have you back{" "}
          <span className="animate-bounce inline-block">🙌</span>
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
  );
}
