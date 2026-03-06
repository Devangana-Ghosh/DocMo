import React, { useState } from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { PrescriptionForm } from '../../components/doctor/PrescriptionForm';
import { Eye, FilePlus } from 'lucide-react';
import { GenerateReportModal } from '../../components/doctor/GenerateReportModal';
import { ReportData } from '../../components/doctor/ReportTemplate';

export function PrescriptionsPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState<ReportData | null>(null);

  const mockReportTemplate: ReportData = {
    patientName: '',
    patientAge: '34',
    patientGender: 'Male',
    date: '',
    doctorName: 'Dr. Sarah Jenkins',
    doctorSpecialty: 'General Practitioner',
    hospitalName: 'DocMo Medical Center',
    hospitalAddress: '123 Health Ave, Wellness City',
    diagnosis: 'Acute viral pharyngitis. Patient presents with sore throat and mild fever.',
    medicines: [],
    advice: '1. Drink plenty of warm fluids.\n2. Avoid cold drinks or foods.\n3. Take complete rest for 2-3 days.\n4. Call clinic if symptoms worsen.'
  };

  const handleGenerateReport = (rx: any) => {
    setSelectedReportData({
      ...mockReportTemplate,
      patientName: rx.patient,
      date: rx.date === 'Today' ? new Date().toLocaleDateString() : '11/08/2026',
      medicines: [
        { name: rx.med, dosage: 'Standard', frequency: 'As prescribed', duration: 'Usually 5-7 Days' },
        { name: 'Paracetamol', dosage: '500mg', frequency: 'SOS (As needed)', duration: 'For fever' }
      ]
    });
    setIsReportModalOpen(true);
  };

  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
    <SkipLink />
    <DoctorNavigation />

    <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8 print:hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Prescriptions
            </h1>
            <p className="text-xl text-gray-600">
              Issue digital prescriptions and view history.
            </p>
          </div>
          {/* Optional: A global button to generate an empty report */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Prescription */}
          <div className="lg:col-span-2">
            <PrescriptionForm />
          </div>

          {/* History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b-2 border-gray-100 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent History
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {[{
                  patient: 'John Doe',
                  med: 'Amoxicillin 500mg',
                  date: 'Today'
                }, {
                  patient: 'Jane Smith',
                  med: 'Lisinopril 10mg',
                  date: 'Yesterday'
                }, {
                  patient: 'Robert Johnson',
                  med: 'Metformin 500mg',
                  date: 'Nov 08'
                }, {
                  patient: 'Emily Davis',
                  med: 'Ibuprofen 800mg',
                  date: 'Nov 05'
                }].map((rx, i) => <div key={i} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-900">{rx.patient}</p>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {rx.date}
                    </span>
                  </div>
                  <p className="text-teal-700 font-medium mb-3">{rx.med}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1 text-sm font-bold text-gray-600 bg-white border border-gray-300 py-1.5 rounded hover:bg-gray-50 transition">
                      <Eye className="h-4 w-4" /> View
                    </button>
                    <button
                      onClick={() => handleGenerateReport(rx)}
                      className="flex-1 flex items-center justify-center gap-1 text-sm font-bold text-teal-700 bg-teal-50 border border-teal-200 py-1.5 rounded hover:bg-teal-100 shadow-sm transition">
                      <FilePlus className="h-4 w-4" /> Report
                    </button>
                  </div>
                </div>)}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                <button className="text-teal-700 font-bold hover:underline">
                  View All History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />

    <GenerateReportModal
      isOpen={isReportModalOpen}
      onClose={() => setIsReportModalOpen(false)}
      data={selectedReportData}
    />
  </div>;
}