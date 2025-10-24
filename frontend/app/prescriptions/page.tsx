'use client';

import { useEffect, useState } from 'react';
import { prescriptionAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const response = await prescriptionAPI.getMyPrescriptions();
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (prescription: any) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('MEDICAL PRESCRIPTION', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('HealthCare EHR System', 105, 28, { align: 'center' });
    doc.line(20, 32, 190, 32);

    // Doctor Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Doctor Information:', 20, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: Dr. ${prescription.doctorId?.name}`, 20, 50);
    doc.text(`Specialization: ${prescription.doctorId?.specialization}`, 20, 56);
    doc.text(`License: ${prescription.doctorId?.licenseNumber || 'N/A'}`, 20, 62);

    // Patient Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${prescription.patientId?.name}`, 20, 83);
    doc.text(`DOB: ${prescription.patientId?.dob ? format(new Date(prescription.patientId.dob), 'MMM dd, yyyy') : 'N/A'}`, 20, 89);
    doc.text(`Gender: ${prescription.patientId?.gender || 'N/A'}`, 20, 95);

    // Date
    doc.text(`Date: ${format(new Date(prescription.issuedAt), 'MMM dd, yyyy')}`, 20, 101);
    doc.line(20, 105, 190, 105);

    // Medications
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Prescribed Medications:', 20, 115);

    let yPosition = 125;
    prescription.medications.forEach((med: any, index: number) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${med.name}`, 25, yPosition);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPosition += 6;
      doc.text(`Dosage: ${med.dose}`, 30, yPosition);
      yPosition += 5;
      doc.text(`Frequency: ${med.frequency}`, 30, yPosition);
      yPosition += 5;
      doc.text(`Duration: ${med.duration}`, 30, yPosition);
      yPosition += 5;
      if (med.instructions) {
        doc.text(`Instructions: ${med.instructions}`, 30, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
    });

    // Notes
    if (prescription.notes) {
      yPosition += 5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Additional Notes:', 20, yPosition);
      yPosition += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const notes = doc.splitTextToSize(prescription.notes, 170);
      doc.text(notes, 20, yPosition);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This is a computer-generated prescription from HealthCare EHR System', 105, 280, { align: 'center' });

    doc.save(`prescription-${prescription._id}.pdf`);
  };

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
              <p className="text-gray-600 mt-2">View and download your prescriptions</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No prescriptions found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription._id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Dr. {prescription.doctorId?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {prescription.doctorId?.specialization}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {format(new Date(prescription.issuedAt), 'MMM dd')}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Medications:</p>
                        <ul className="space-y-1">
                          {prescription.medications.slice(0, 3).map((med: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600">
                              • {med.name} - {med.dose}
                            </li>
                          ))}
                          {prescription.medications.length > 3 && (
                            <li className="text-sm text-gray-500 italic">
                              +{prescription.medications.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPrescription(prescription)}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => downloadPDF(prescription)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Prescription Details</h2>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Doctor</h3>
                <p className="text-gray-700">Dr. {selectedPrescription.doctorId?.name}</p>
                <p className="text-sm text-gray-600">{selectedPrescription.doctorId?.specialization}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Issued Date</h3>
                <p className="text-gray-700">
                  {format(new Date(selectedPrescription.issuedAt), 'MMMM dd, yyyy')}
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Medications</h3>
                <div className="space-y-4">
                  {selectedPrescription.medications.map((med: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900 mb-2">{med.name}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="text-gray-600">Dose:</span> {med.dose}</p>
                        <p><span className="text-gray-600">Frequency:</span> {med.frequency}</p>
                        <p><span className="text-gray-600">Duration:</span> {med.duration}</p>
                        {med.instructions && (
                          <p className="col-span-2">
                            <span className="text-gray-600">Instructions:</span> {med.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.notes && (
                <div className="pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
                  <p className="text-gray-700">{selectedPrescription.notes}</p>
                </div>
              )}

              <button
                onClick={() => downloadPDF(selectedPrescription)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Download as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
