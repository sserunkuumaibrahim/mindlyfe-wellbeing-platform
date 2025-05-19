
import { Button } from "@/components/ui/button";
import { Activity, CalendarDays, MessageSquare, Book, User, Settings, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const navItems = [
  { icon: Activity, label: "Dashboard" },
  { icon: CalendarDays, label: "Appointments" },
  { icon: User, label: "Profile" },
  { icon: Book, label: "Resources" },
  { icon: MessageSquare, label: "Community" },
  { icon: Settings, label: "Settings" },
];

export default function DashboardSidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="w-[86px] min-w-[86px] py-6 px-2 flex flex-col gap-3 items-center bg-white/80 dark:bg-muted/80 shadow-lg glass-morphism rounded-r-3xl animate-slide-in">
      <div className="mb-8">
        <div className="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center text-xl shadow-lg hover:scale-105 transition">
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
  );
}
