
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlayIcon from "./PlayIcon";

export default function RecentSessionsWidget({ recentSessions }: { recentSessions: any[] }) {
  return (
    <Card className="rounded-3xl glass-morphism p-6 animate-fade-in flex flex-col">
      <div className="font-semibold text-lg mb-2">Records of recent sessions</div>
      <div className="text-muted-foreground text-sm mb-3">View or download recordings of your sessions for review and analysis</div>
      <div className="flex-1 flex flex-col gap-2">
        {recentSessions.map((session, i) => (
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
  );
}
