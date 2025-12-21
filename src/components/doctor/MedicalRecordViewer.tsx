import React from 'react';
import { X, AlertTriangle, FileText, Pill, History } from 'lucide-react';
import { Button } from '../ui/Button';
import { Patient } from './PatientCard';
interface MedicalRecordViewerProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  hasConsent: boolean;
  onRequestConsent: () => void;
}
export function MedicalRecordViewer({
  patient,
  isOpen,
  onClose,
  hasConsent,
  onRequestConsent
}: MedicalRecordViewerProps) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div className="bg-teal-800 text-white p-6 flex justify-between items-center">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold">
              Medical Record: {patient.name}
            </h2>
            <p className="text-teal-100">ID: {patient.id} • DOB: 1985-04-12</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-teal-700 p-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400" aria-label="Close modal">
            <X className="h-8 w-8" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {!hasConsent ? <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="bg-yellow-100 p-6 rounded-full mb-6">
                <AlertTriangle className="h-16 w-16 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Patient Consent Required
              </h3>
              <p className="text-xl text-gray-600 max-w-lg mb-8">
                You do not have permission to view the full medical history for
                this patient. Request access to view records, prescriptions, and
                lab results.
              </p>
              <Button onClick={onRequestConsent} size="lg" className="bg-teal-700 hover:bg-teal-800">
                Request Access
              </Button>
            </div> : <div className="space-y-8">
              {/* Allergies & Alerts */}
              <section className="bg-white p-6 rounded-xl border-2 border-red-100 shadow-sm">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  Allergies & Critical Alerts
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-red-50 text-red-800 px-4 py-2 rounded-lg font-bold border border-red-200">
                    Penicillin (Severe)
                  </span>
                  <span className="bg-orange-50 text-orange-800 px-4 py-2 rounded-lg font-bold border border-orange-200">
                    Latex (Mild)
                  </span>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Medications */}
                <section className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Pill className="h-6 w-6 text-teal-600" />
                    Current Medications
                  </h3>
                  <ul className="space-y-4">
                    <li className="pb-4 border-b border-gray-100 last:border-0">
                      <p className="font-bold text-lg">Lisinopril 10mg</p>
                      <p className="text-gray-600">
                        1 tablet daily for hypertension
                      </p>
                    </li>
                    <li className="pb-4 border-b border-gray-100 last:border-0">
                      <p className="font-bold text-lg">Metformin 500mg</p>
                      <p className="text-gray-600">Twice daily with meals</p>
                    </li>
                  </ul>
                </section>

                {/* Recent History */}
                <section className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="h-6 w-6 text-teal-600" />
                    Recent Visits
                  </h3>
                  <ul className="space-y-4">
                    <li className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">Annual Checkup</span>
                        <span className="text-gray-500">Oct 15, 2023</span>
                      </div>
                      <p className="text-gray-600">
                        Dr. Sarah Wilson • Routine physical
                      </p>
                    </li>
                    <li className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">Urgent Care</span>
                        <span className="text-gray-500">Aug 02, 2023</span>
                      </div>
                      <p className="text-gray-600">Minor injury treatment</p>
                    </li>
                  </ul>
                </section>
              </div>

              {/* Documents */}
              <section className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-teal-600" />
                  Documents & Labs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left">
                    <FileText className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <p className="font-bold text-gray-900">Blood Panel</p>
                      <p className="text-sm text-gray-500">Oct 15, 2023</p>
                    </div>
                  </button>
                  <button className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left">
                    <FileText className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <p className="font-bold text-gray-900">ECG Report</p>
                      <p className="text-sm text-gray-500">Oct 15, 2023</p>
                    </div>
                  </button>
                </div>
              </section>
            </div>}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-gray-200 bg-white flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {hasConsent && <Button className="bg-teal-700 hover:bg-teal-800 border-teal-700">
              Add Clinical Note
            </Button>}
        </div>
      </div>
    </div>;
}