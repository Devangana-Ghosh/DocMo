import React from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { PrescriptionForm } from '../../components/doctor/PrescriptionForm';
import { FileText, Download, Eye } from 'lucide-react';
export function PrescriptionsPage() {
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <DoctorNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Prescriptions
            </h1>
            <p className="text-xl text-gray-600">
              Issue digital prescriptions and view history.
            </p>
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
                }].map((rx, i) => <div key={i} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-gray-900">{rx.patient}</p>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {rx.date}
                        </span>
                      </div>
                      <p className="text-teal-700 font-medium mb-3">{rx.med}</p>
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-1 text-sm font-bold text-gray-600 bg-white border border-gray-300 py-1.5 rounded hover:bg-gray-50">
                          <Eye className="h-4 w-4" /> View
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1 text-sm font-bold text-teal-700 bg-teal-50 border border-teal-200 py-1.5 rounded hover:bg-teal-100">
                          <Download className="h-4 w-4" /> PDF
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
    </div>;
}