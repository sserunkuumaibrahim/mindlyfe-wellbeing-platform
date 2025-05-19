
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function UpcomingWidget({ upcoming }: { upcoming: any[] }) {
  return (
    <Card className="rounded-3xl glass-morphism p-6 flex flex-col animate-scale-in row-span-2">
      <div className="font-semibold text-lg mb-1">Upcoming</div>
      <div className="text-xs text-muted-foreground">Your next sessions</div>
      <div className="grid grid-cols-7 text-center mt-5 text-sm font-semibold mb-2">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center mb-4">
        {[21, 22, 23, 24, 25, 26, 27].map(num => (
          <span key={num}
            className={`rounded-full w-8 h-8 mx-auto flex items-center justify-center ${
              num === 22 ? "bg-primary text-white shadow-lg animate-pulse" : ""
            }`}
          >{num}</span>
        ))}
      </div>
      <div className="flex-1 space-y-2">
        {upcoming.map((s, i) => (
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
  );
}
