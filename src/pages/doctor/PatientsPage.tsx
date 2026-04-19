import { useEffect, useState } from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { Input } from '../../components/ui/Input';
import { PatientCard, Patient } from '../../components/doctor/PatientCard';
import { MedicalRecordViewer } from '../../components/doctor/MedicalRecordViewer';
import { Search } from 'lucide-react';
import { fetchDoctorPatientRecord, fetchDoctorPatients } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment, LabReport, MedicalDocument, Prescription } from '../../types/backend';

export function PatientsPage() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{
    appointments: Appointment[];
    prescriptions: Prescription[];
    documents: MedicalDocument[];
    labReports: LabReport[];
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      if (!profile) return;

      try {
        const data = await fetchDoctorPatients(profile.id);
        const mapped: Patient[] = data.map((patient) => {
          const birthYear = patient.dob ? new Date(patient.dob).getFullYear() : new Date().getFullYear() - 30;
          const age = new Date().getFullYear() - birthYear;
          return {
            id: patient.id,
            name: patient.full_name,
            age,
            gender: patient.gender ?? 'Unknown',
            lastVisit: new Date().toLocaleDateString(),
            conditions: ['General Follow-up'],
            status: 'Active',
          };
        });

        setPatients(mapped);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load patients.');
      }
    };

    void loadPatients();
  }, [profile]);

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.conditions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())));
  const handleViewRecords = async (id: string) => {
    const patient = patients.find(p => p.id === id);
    if (!patient || !profile) {
      return;
    }

    setSelectedPatient(patient);
    setIsViewerOpen(true);
    setRecordLoading(true);
    setSelectedRecord(null);

    try {
      const data = await fetchDoctorPatientRecord(profile.id, patient.id);
      setSelectedRecord(data);
    } catch (recordError) {
      setError(recordError instanceof Error ? recordError.message : 'Failed to load medical record.');
    } finally {
      setRecordLoading(false);
    }
  };
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <DoctorNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Patients
              </h1>
              <p className="text-xl text-gray-600">
                Manage patient records and medical histories.
              </p>
            </div>
            <div className="w-full md:w-96">
              <Input label="Search Patients" placeholder="Name, ID, or Condition" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} leftIcon={<Search className="h-5 w-5 text-gray-500" />} className="mb-0" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {error && <div className="col-span-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {filteredPatients.map(patient => <PatientCard key={patient.id} patient={patient} onViewRecords={handleViewRecords} />)}
          </div>

          {filteredPatients.length === 0 && <div className="text-center py-20 bg-white rounded-xl border-2 border-gray-200 border-dashed">
              <p className="text-xl text-gray-500">
                No patients found matching "{searchTerm}"
              </p>
            </div>}
        </div>
      </main>

      {selectedPatient && selectedRecord && <MedicalRecordViewer patient={selectedPatient} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} record={selectedRecord} />}
      {selectedPatient && isViewerOpen && recordLoading && <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="rounded-lg bg-white px-6 py-4 shadow-lg text-gray-700">Loading medical record...</div>
        </div>}

      <Footer />
    </div>;
}