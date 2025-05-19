
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProgressWidgets({ progress }: { progress: any }) {
  return (
    <>
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
    </>
  );
}
