'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import { appointmentAPI, prescriptionAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const user = getUser();
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    prescriptions: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [appointmentsRes, prescriptionsRes] = await Promise.all([
        appointmentAPI.getMyAppointments(),
        prescriptionAPI.getMyPrescriptions(),
      ]);

      const appointments = appointmentsRes.data;
      const prescriptions = prescriptionsRes.data;

      setStats({
        upcoming: appointments.filter((a: any) =>
          ['pending', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date()
        ).length,
        completed: appointments.filter((a: any) => a.status === 'completed').length,
        prescriptions: prescriptions.length,
      });

      setRecentAppointments(
        appointments
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'patient' ? 'Manage your health records and appointments' : 'Manage your schedule and patients'}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-600 uppercase">Upcoming</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcoming}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {user?.role === 'patient' ? 'Appointments' : 'Appointments to review'}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <h3 className="text-sm font-medium text-gray-600 uppercase">Completed</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
                    <p className="text-sm text-gray-500 mt-1">Total appointments</p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                    <h3 className="text-sm font-medium text-gray-600 uppercase">Prescriptions</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.prescriptions}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {user?.role === 'patient' ? 'Received' : 'Issued'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
                    <Link
                      href={user?.role === 'patient' ? '/appointments' : '/schedule'}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All
                    </Link>
                  </div>

                  {recentAppointments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No appointments found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              {user?.role === 'patient' ? 'Doctor' : 'Patient'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Reason
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {recentAppointments.map((appointment) => (
                            <tr key={appointment._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {format(new Date(appointment.date), 'MMM dd, yyyy')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {appointment.startTime} - {appointment.endTime}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {user?.role === 'patient'
                                  ? `Dr. ${appointment.doctorId?.name}`
                                  : appointment.patientId?.name
                                }
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {appointment.reason}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                  {appointment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
