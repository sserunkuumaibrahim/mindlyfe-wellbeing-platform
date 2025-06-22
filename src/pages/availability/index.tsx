import React from 'react';
import { AvailabilityManager } from '@/components/availability/AvailabilityManager';
import AppPageLayout from '@/components/ui/AppPageLayout';

export default function Availability() {
  return (
    <AppPageLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Availability Management</h1>
          <p className="text-gray-600">Set your available hours for client sessions</p>
        </div>
        <AvailabilityManager />
      </div>
    </AppPageLayout>
  );
}

