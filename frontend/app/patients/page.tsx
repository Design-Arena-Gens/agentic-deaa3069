'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function PatientsPage() {
  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
              <p className="text-gray-600 mt-2">View patient information through appointments</p>
            </div>
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              Patient details are available in the Schedule section
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
