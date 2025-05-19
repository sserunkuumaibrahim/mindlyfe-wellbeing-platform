
import AppPageLayout from "@/components/ui/AppPageLayout";
import { MessageSquare } from "lucide-react";

export default function Chat() {
  return (
    <AppPageLayout>
      <div className="flex flex-col items-center pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-100 text-primary flex items-center justify-center shadow">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
        </div>
        <div className="rounded-3xl bg-white/80 shadow-xl max-w-2xl w-full min-h-[380px] py-16 flex items-center justify-center border-0 backdrop-blur-lg">
          <p className="text-gray-400 text-lg">Your secure chat session will appear here!</p>
        </div>
      </div>
    </AppPageLayout>
  );
}
