"use client";

import ProtectedAPITest from '@/app/Components/ProtectedAPITest';

export default function ProtectedAPITestPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <ProtectedAPITest />
      </div>
    </div>
  );
}
