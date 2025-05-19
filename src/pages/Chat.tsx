
import AppPageLayout from "@/components/ui/AppPageLayout";
import { MessageSquare } from "lucide-react";

export default function Chat() {
  return (
    <AppPageLayout>
      <div className="flex flex-col items-center pt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-blue-100 text-primary shadow-lg flex items-center justify-center">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Messages
          </h1>
        </div>
        <div className="rounded-3xl shadow-2xl bg-white/60 border border-white/40 backdrop-blur-2xl max-w-xl w-full min-h-[370px] flex items-center justify-center py-16 glass-morphism">
          <p className="text-gray-400 text-lg">
            Your secure chat session will appear here!
          </p>
        </div>
      </div>
    </AppPageLayout>
  );
}
