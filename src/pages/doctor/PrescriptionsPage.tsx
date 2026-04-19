import { useEffect, useMemo, useRef, useState } from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { PrescriptionForm, type PrescriptionFormValues } from '../../components/doctor/PrescriptionForm';
import { Eye, FilePlus, Pencil, X } from 'lucide-react';
import { GenerateReportModal } from '../../components/doctor/GenerateReportModal';
import type { ReportData } from '../../components/doctor/ReportTemplate';
import { approvePrescriptionRefill, cancelPrescription, createPrescription, fetchDoctorPatients, fetchPrescriptionsByDoctor, updatePrescription } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Prescription, Profile } from '../../types/backend';
import { useToast } from '../../components/ui/Toast';

export function PrescriptionsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState<ReportData | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Profile[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const detailsPanelRef = useRef<HTMLElement | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'completed' | 'refill-needed' | 'cancelled'>(() => {
    return (localStorage.getItem('docmo:doctor-rx-filter') as any) ?? 'all';
  });
  const [historySort, setHistorySort] = useState<'newest' | 'oldest' | 'patient'>(() => {
    return (localStorage.getItem('docmo:doctor-rx-sort') as any) ?? 'newest';
  });

  useEffect(() => {
    localStorage.setItem('docmo:doctor-rx-filter', historyFilter);
  }, [historyFilter]);

  useEffect(() => {
    localStorage.setItem('docmo:doctor-rx-sort', historySort);
  }, [historySort]);

  useEffect(() => {
    const loadData = async () => {
      if (!profile) return;

      try {
        const [prescriptionsData, patientsData] = await Promise.all([
          fetchPrescriptionsByDoctor(profile.id),
          fetchDoctorPatients(profile.id),
        ]);
        setPrescriptions(prescriptionsData);
        setPatients(patientsData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load prescriptions.');
      }
    };

    void loadData();
  }, [profile]);

  const patientOptions = useMemo(
    () =>
      patients.map((patient) => ({
        value: patient.id,
        label: `${patient.full_name}${patient.mrn ? ` (MRN: ${patient.mrn})` : ''}`,
      })),
    [patients],
  );

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

  const handleIssuePrescription = async (values: PrescriptionFormValues) => {
    if (!profile) return;
    setSuccess('');

    try {
      if (editingPrescription) {
        const updated = await updatePrescription(editingPrescription.id, {
          patient_id: values.patientId,
          doctor_id: profile.id,
          medication_name: values.medicationName,
          medication_normalized: values.medicationNormalized,
          rxcui: values.rxcui,
          rxnorm_verified: values.rxnormVerified,
          dosage: values.dosage,
          frequency: values.frequency,
          duration: values.duration,
          instructions: values.instructions,
          status: values.status,
          refills_remaining: values.refillsRemaining,
        });

        setPrescriptions((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setSelectedPrescription(updated);
        setEditingPrescription(null);
        setSuccess('Prescription updated successfully.');
        toast.success('Prescription updated', `${updated.medication_name} for ${updated.patient?.full_name ?? 'patient'}.`);
        return;
      }

      const created = await createPrescription({
        patient_id: values.patientId,
        doctor_id: profile.id,
        medication_name: values.medicationName,
        medication_normalized: values.medicationNormalized,
        rxcui: values.rxcui,
        rxnorm_verified: values.rxnormVerified,
        dosage: values.dosage,
        frequency: values.frequency,
        duration: values.duration,
        instructions: values.instructions,
        status: values.status,
        refills_remaining: values.refillsRemaining,
      });

      setPrescriptions((current) => [created, ...current]);
      setSuccess('Prescription issued successfully.');
      toast.success('Prescription issued', `${created.medication_name} has been sent to ${created.patient?.full_name ?? 'the patient'}.`);
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : 'Failed to issue prescription.');
    }
  };

  const handleSelectPrescription = (rx: Prescription) => {
    setSelectedPrescription(rx);
    setEditingPrescription(null);
  };

  useEffect(() => {
    if (!selectedPrescription) return;

    const timeout = window.setTimeout(() => {
      detailsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      detailsPanelRef.current?.focus();
    }, 40);

    return () => window.clearTimeout(timeout);
  }, [selectedPrescription]);

  const handleEditPrescription = (rx: Prescription) => {
    setEditingPrescription(rx);
    setSelectedPrescription(rx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelPrescription = async (rx: Prescription) => {
    try {
      const updated = await cancelPrescription(rx.id);
      setPrescriptions((current) => current.map((item) => (item.id === rx.id ? updated : item)));
      setSelectedPrescription(updated);
      toast.warning('Prescription cancelled', `${updated.medication_name} is now marked as cancelled.`);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Failed to cancel prescription.');
    }
  };

  const handleApproveRefill = async (rx: Prescription) => {
    try {
      const updated = await approvePrescriptionRefill(rx.id, rx.refills_remaining);
      setPrescriptions((current) => current.map((item) => (item.id === rx.id ? updated : item)));
      setSelectedPrescription(updated);
      toast.success('Refill approved', `${updated.medication_name} has been approved.`);
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Failed to approve refill request.');
    }
  };

  const visibleHistory = useMemo(() => {
    const filtered = prescriptions.filter((item) => {
      if (historyFilter === 'all') return true;
      if (historyFilter === 'refill-needed') return item.status === 'Refill Needed';
      if (historyFilter === 'cancelled') return item.status === 'Cancelled';
      return item.status.toLowerCase() === historyFilter;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (historySort === 'patient') {
        return (a.patient?.full_name ?? '').localeCompare(b.patient?.full_name ?? '');
      }
      const aTime = new Date(a.created_at ?? 0).getTime();
      const bTime = new Date(b.created_at ?? 0).getTime();
      return historySort === 'newest' ? bTime - aTime : aTime - bTime;
    });

    return sorted;
  }, [historyFilter, historySort, prescriptions]);

  const refillRequests = useMemo(
    () =>
      prescriptions
        .filter((item) => item.status === 'Refill Needed' && item.refills_remaining > 0)
        .sort((a, b) => {
          const aTime = new Date(a.created_at ?? 0).getTime();
          const bTime = new Date(b.created_at ?? 0).getTime();
          return aTime - bTime;
        }),
    [prescriptions],
  );

  const formInitialValues = editingPrescription
    ? {
        patientId: editingPrescription.patient_id,
        medicationName: editingPrescription.medication_name,
        dosage: editingPrescription.dosage,
        frequency: editingPrescription.frequency,
        duration: editingPrescription.duration,
        instructions: editingPrescription.instructions,
        status: editingPrescription.status,
        refillsRemaining: editingPrescription.refills_remaining,
        medicationNormalized: editingPrescription.medication_normalized ?? editingPrescription.medication_name,
        rxcui: editingPrescription.rxcui ?? '',
        rxnormVerified: Boolean(editingPrescription.rxnorm_verified),
      }
    : undefined;

  const handleGenerateReport = (rx: Prescription) => {
    setSelectedReportData({
      ...mockReportTemplate,
      patientName: rx.patient?.full_name ?? 'Patient',
      date: new Date(rx.created_at ?? new Date().toISOString()).toLocaleDateString(),
      medicines: [
        { name: rx.medication_name, dosage: rx.dosage, frequency: rx.frequency, duration: rx.duration },
        { name: 'Paracetamol', dosage: '500mg', frequency: 'SOS (As needed)', duration: 'For fever' }
      ]
    });
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create New Prescription */}
            <div className="lg:col-span-2">
              {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
              <PrescriptionForm patientOptions={patientOptions} existingPrescriptions={prescriptions} onSubmitPrescription={handleIssuePrescription} initialValues={formInitialValues} submitLabel={editingPrescription ? 'Update Prescription' : 'Issue Prescription'} />

              <section className="mt-8 bg-white rounded-xl border-2 border-blue-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-blue-100 bg-blue-50 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Refill Requests</h2>
                    <p className="text-sm text-gray-600">Pending patient requests that need doctor approval.</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                    {refillRequests.length}
                  </span>
                </div>

                {refillRequests.length === 0 ? (
                  <div className="p-6 text-sm text-gray-600">No refill requests pending right now.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {refillRequests.map((rx) => (
                      <div key={rx.id} className="p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{rx.patient?.full_name ?? 'Patient'} • {rx.medication_name}</p>
                          <p className="text-sm text-gray-600">{rx.dosage} • {rx.frequency} • {rx.refills_remaining} refills available</p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <button
                            onClick={() => handleSelectPrescription(rx)}
                            className="px-3 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleApproveRefill(rx)}
                            className="px-3 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* History */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b-2 border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      Recent History
                    </h2>
                    <select
                      value={historySort}
                      onChange={(e) => setHistorySort(e.target.value as typeof historySort)}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="patient">Patient</option>
                    </select>
                  </div>
                </div>
                <div className="px-4 pt-4">
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value as typeof historyFilter)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="refill-needed">Refill needed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="divide-y divide-gray-100">
                  {visibleHistory.map((rx) => (
                    <div key={rx.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-gray-900">{rx.patient?.full_name ?? 'Patient'}</p>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {new Date(rx.created_at ?? new Date().toISOString()).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-teal-700 font-medium mb-3">{rx.medication_name}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleSelectPrescription(rx)} className="flex-1 flex items-center justify-center gap-1 text-sm font-bold text-gray-600 bg-white border border-gray-300 py-1.5 rounded hover:bg-gray-50 transition">
                          <Eye className="h-4 w-4" /> Details
                        </button>
                        <button
                          onClick={() => handleGenerateReport(rx)}
                          className="flex-1 flex items-center justify-center gap-1 text-sm font-bold text-teal-700 bg-teal-50 border border-teal-200 py-1.5 rounded hover:bg-teal-100 shadow-sm transition">
                          <FilePlus className="h-4 w-4" /> Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                  <button className="text-teal-700 font-bold hover:underline" onClick={() => setSelectedPrescription(null)}>
                    View All History
                  </button>
                </div>
              </div>
            </div>
          </div>

          {selectedPrescription && <aside ref={detailsPanelRef} tabIndex={-1} className="mt-8 bg-white rounded-xl border-2 border-teal-200 shadow-sm p-6 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Prescription Details</h2>
                <p className="text-gray-600">{selectedPrescription.patient?.full_name ?? 'Patient'} • {selectedPrescription.medication_name}</p>
              </div>
              <button className="text-gray-500 hover:text-gray-800" onClick={() => setSelectedPrescription(null)}>Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-bold text-gray-700">Dosage:</span> {selectedPrescription.dosage}</div>
              <div><span className="font-bold text-gray-700">Frequency:</span> {selectedPrescription.frequency}</div>
              <div><span className="font-bold text-gray-700">Duration:</span> {selectedPrescription.duration}</div>
              <div><span className="font-bold text-gray-700">Refills:</span> {selectedPrescription.refills_remaining}</div>
              <div><span className="font-bold text-gray-700">Status:</span> {selectedPrescription.status}</div>
              <div><span className="font-bold text-gray-700">Created:</span> {new Date(selectedPrescription.created_at ?? '').toLocaleString()}</div>
              <div><span className="font-bold text-gray-700">RxNorm:</span> {selectedPrescription.rxnorm_verified ? `Verified (RxCUI ${selectedPrescription.rxcui ?? 'N/A'})` : 'Not verified'}</div>
              {selectedPrescription.medication_normalized && <div><span className="font-bold text-gray-700">Normalized Name:</span> {selectedPrescription.medication_normalized}</div>}
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-gray-700 mb-1">Instructions</p>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedPrescription.instructions}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {selectedPrescription.status === 'Refill Needed' && selectedPrescription.refills_remaining > 0 && <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700" onClick={() => handleApproveRefill(selectedPrescription)}>
                  Approve Refill
                </button>}
              <button className="px-4 py-2 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800" onClick={() => handleEditPrescription(selectedPrescription)}>
                <Pencil className="inline h-4 w-4 mr-2" />Edit
              </button>
              {selectedPrescription.status !== 'Cancelled' && <button className="px-4 py-2 rounded-lg bg-white border-2 border-red-500 text-red-700 font-bold hover:bg-red-50" onClick={() => handleCancelPrescription(selectedPrescription)}>
                <X className="inline h-4 w-4 mr-2" />Cancel
              </button>}
            </div>
          </aside>}
        </div>
      </main>
      <Footer />

      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        data={selectedReportData}
      />
    </div>
  );
}