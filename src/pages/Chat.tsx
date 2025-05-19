import AppPageLayout from "@/components/ui/AppPageLayout";

export default function Chat() {
  return (
    <AppPageLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-4">Chat with your Therapist</h1>
        {/* For now, placeholder content */}
        <div className="rounded-xl bg-white/80 p-6 shadow max-w-lg mx-auto my-12">
          <p className="text-gray-500">
            Your secure chat session will appear here!
          </p>
        </div>
      </div>
    </AppPageLayout>
  );
}
