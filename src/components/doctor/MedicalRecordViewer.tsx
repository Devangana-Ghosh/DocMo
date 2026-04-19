import React from 'react';
import { X, FileText, Pill, History, CalendarClock, FlaskConical, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Patient } from './PatientCard';
import type { Appointment, LabReport, MedicalDocument, Prescription } from '../../types/backend';
import { getLabReportPublicUrl } from '../../services/api';
interface MedicalRecordViewerProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  record: {
    appointments: Appointment[];
    prescriptions: Prescription[];
    documents: MedicalDocument[];
    labReports: LabReport[];
  };
}
export function MedicalRecordViewer({
  patient,
  isOpen,
  onClose,
  record,
}: MedicalRecordViewerProps) {
  if (!isOpen) return null;

  const recentPrescriptions = record.prescriptions.slice(0, 5);
  const recentAppointments = record.appointments.slice(0, 5);
  const recentDocuments = record.documents.slice(0, 6);
  const recentLabReports = record.labReports.slice(0, 6);

  const handleViewLabReport = async (report: LabReport) => {
    const url = await getLabReportPublicUrl(report.file_path);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div className="bg-teal-800 text-white p-6 flex justify-between items-center">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold">
              Medical Record: {patient.name}
            </h2>
            <p className="text-teal-100">ID: {patient.id}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-teal-700 p-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400" aria-label="Close modal">
            <X className="h-8 w-8" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Medications */}
                <section className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Pill className="h-6 w-6 text-teal-600" />
                    Prescriptions
                  </h3>
                  {recentPrescriptions.length === 0 ? <p className="text-gray-500">No prescriptions found.</p> : <ul className="space-y-4">
                      {recentPrescriptions.map((item) => <li key={item.id} className="pb-4 border-b border-gray-100 last:border-0">
                          <p className="font-bold text-lg">{item.medication_name}</p>
                          <p className="text-gray-600">{item.dosage} • {item.frequency} • {item.status}</p>
                        </li>)}
                    </ul>}
                </section>

                {/* Recent History */}
                <section className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="h-6 w-6 text-teal-600" />
                    Recent Visits
                  </h3>
                  {recentAppointments.length === 0 ? <p className="text-gray-500">No appointments found.</p> : <ul className="space-y-4">
                      {recentAppointments.map((item) => <li key={item.id} className="pb-4 border-b border-gray-100 last:border-0">
                          <div className="flex justify-between mb-1 gap-4">
                            <span className="font-bold truncate">{item.reason}</span>
                            <span className="text-gray-500 whitespace-nowrap">{new Date(item.appointment_date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-600">{item.appointment_type} • {item.status}</p>
                        </li>)}
                    </ul>}
                </section>
              </div>

              {/* Documents */}
              <section className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-teal-600" />
                  Documents
                </h3>
                {recentDocuments.length === 0 ? <p className="text-gray-500">No documents found.</p> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentDocuments.map((doc) => <div key={doc.id} className="flex items-center p-4 border-2 border-gray-200 rounded-lg bg-white text-left">
                        <FileText className="h-8 w-8 text-gray-400 mr-3" />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{doc.name}</p>
                          <p className="text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>)}
                  </div>}
              </section>

              <section className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FlaskConical className="h-6 w-6 text-teal-600" />
                  Lab Reports
                </h3>
                {recentLabReports.length === 0 ? <p className="text-gray-500">No lab reports found.</p> : <ul className="space-y-3">
                    {recentLabReports.map((report) => <li key={report.id} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{report.test_type}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <CalendarClock className="h-4 w-4" />
                              {new Date(report.test_date).toLocaleDateString()} • {report.status}
                            </p>
                            {report.notes ? <p className="mt-1 text-sm text-gray-700">{report.notes}</p> : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleViewLabReport(report)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </div>
                      </li>)}
                  </ul>}
              </section>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-gray-200 bg-white flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>;
}