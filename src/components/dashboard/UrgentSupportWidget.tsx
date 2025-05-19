
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UrgentSupportWidget() {
  return (
    <Card className="rounded-3xl glass-morphism p-6 flex flex-col items-center justify-between animate-fade-in relative overflow-hidden"
      style={{ background: "linear-gradient(120deg, #21A9E1 75%, #e9f6ff 100%)", minHeight: 220 }}
    >
      <div className="absolute right-0 bottom-0 w-32 opacity-60 pointer-events-none">
        {/* Place illustration here if available */}
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
  );
}
