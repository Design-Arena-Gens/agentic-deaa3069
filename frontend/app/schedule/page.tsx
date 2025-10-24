'use client';

import { useEffect, useState } from 'react';
import { appointmentAPI, prescriptionAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    medications: [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }],
    notes: '',
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentAPI.getMyAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      loadAppointments();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleAddVisitNotes = async () => {
    if (!selectedAppointment) return;
    const notes = prompt('Enter visit notes:');
    if (notes) {
      try {
        await appointmentAPI.addVisitNotes(selectedAppointment._id, notes);
        setSelectedAppointment(null);
        loadAppointments();
      } catch (error) {
        alert('Failed to add visit notes');
      }
    }
  };

  const addMedication = () => {
    setPrescriptionData({
      ...prescriptionData,
      medications: [
        ...prescriptionData.medications,
        { name: '', dose: '', frequency: '', duration: '', instructions: '' },
      ],
    });
  };

  const removeMedication = (index: number) => {
    setPrescriptionData({
      ...prescriptionData,
      medications: prescriptionData.medications.filter((_, i) => i !== index),
    });
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      await prescriptionAPI.create({
        appointmentId: selectedAppointment._id,
        ...prescriptionData,
      });
      setShowPrescriptionModal(false);
      setPrescriptionData({
        medications: [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }],
        notes: '',
      });
      setSelectedAppointment(null);
      alert('Prescription created successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create prescription');
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
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
              <p className="text-gray-600 mt-2">Manage your appointments and patients</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                {appointments.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No appointments scheduled
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Patient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Reason
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                          <tr key={appointment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {format(new Date(appointment.date), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.patientId?.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.patientId?.phone}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {appointment.reason}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              {appointment.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                                  className="text-green-600 hover:text-green-800 font-medium"
                                >
                                  Confirm
                                </button>
                              )}
                              {appointment.status === 'confirmed' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      handleAddVisitNotes();
                                    }}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Add Notes
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setShowPrescriptionModal(true);
                                    }}
                                    className="text-purple-600 hover:text-purple-800 font-medium"
                                  >
                                    Prescribe
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                                    className="text-green-600 hover:text-green-800 font-medium"
                                  >
                                    Complete
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setSelectedAppointment(appointment)}
                                className="text-gray-600 hover:text-gray-800 font-medium"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedAppointment && !showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Patient Information</h3>
                <p className="text-gray-700"><strong>Name:</strong> {selectedAppointment.patientId?.name}</p>
                <p className="text-gray-700"><strong>Phone:</strong> {selectedAppointment.patientId?.phone}</p>
                <p className="text-gray-700"><strong>DOB:</strong> {selectedAppointment.patientId?.dob ? format(new Date(selectedAppointment.patientId.dob), 'MMM dd, yyyy') : 'N/A'}</p>
                <p className="text-gray-700"><strong>Gender:</strong> {selectedAppointment.patientId?.gender || 'N/A'}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Medical History</h3>
                <p className="text-gray-700">{selectedAppointment.patientId?.medicalHistory || 'No medical history recorded'}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Appointment</h3>
                <p className="text-gray-700"><strong>Date:</strong> {format(new Date(selectedAppointment.date), 'MMMM dd, yyyy')}</p>
                <p className="text-gray-700"><strong>Time:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                <p className="text-gray-700"><strong>Reason:</strong> {selectedAppointment.reason}</p>
              </div>

              {selectedAppointment.visitNotes && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Visit Notes</h3>
                  <p className="text-gray-700">{selectedAppointment.visitNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Prescription</h2>
            <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Medications</h3>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add Medication
                  </button>
                </div>
                {prescriptionData.medications.map((med, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medication Name
                        </label>
                        <input
                          type="text"
                          required
                          value={med.name}
                          onChange={(e) => {
                            const newMeds = [...prescriptionData.medications];
                            newMeds[index].name = e.target.value;
                            setPrescriptionData({ ...prescriptionData, medications: newMeds });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dose</label>
                        <input
                          type="text"
                          required
                          value={med.dose}
                          onChange={(e) => {
                            const newMeds = [...prescriptionData.medications];
                            newMeds[index].dose = e.target.value;
                            setPrescriptionData({ ...prescriptionData, medications: newMeds });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <input
                          type="text"
                          required
                          value={med.frequency}
                          onChange={(e) => {
                            const newMeds = [...prescriptionData.medications];
                            newMeds[index].frequency = e.target.value;
                            setPrescriptionData({ ...prescriptionData, medications: newMeds });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input
                          type="text"
                          required
                          value={med.duration}
                          onChange={(e) => {
                            const newMeds = [...prescriptionData.medications];
                            newMeds[index].duration = e.target.value;
                            setPrescriptionData({ ...prescriptionData, medications: newMeds });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => {
                            const newMeds = [...prescriptionData.medications];
                            newMeds[index].instructions = e.target.value;
                            setPrescriptionData({ ...prescriptionData, medications: newMeds });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {index > 0 && (
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  value={prescriptionData.notes}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
