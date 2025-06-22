import React from 'react';
import { EnhancedMessaging } from '@/components/messaging/EnhancedMessaging';
import AppPageLayout from '@/components/ui/AppPageLayout';

export default function Messages() {
  return (
    <AppPageLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-600">Communicate with your therapists and clients</p>
        </div>
        <EnhancedMessaging />
      </div>
    </AppPageLayout>
  );
}

