import React, { useState } from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { Input } from '../../components/ui/Input';
import { PatientCard, Patient } from '../../components/doctor/PatientCard';
import { MedicalRecordViewer } from '../../components/doctor/MedicalRecordViewer';
import { Search } from 'lucide-react';
const MOCK_PATIENTS: Patient[] = [{
  id: '1',
  name: 'John Doe',
  age: 45,
  gender: 'Male',
  lastVisit: 'Oct 12, 2023',
  conditions: ['Hypertension', 'Diabetes'],
  status: 'Active'
}, {
  id: '2',
  name: 'Jane Smith',
  age: 32,
  gender: 'Female',
  lastVisit: 'Sep 28, 2023',
  conditions: ['Asthma'],
  status: 'Active'
}, {
  id: '3',
  name: 'Robert Johnson',
  age: 58,
  gender: 'Male',
  lastVisit: 'Aug 15, 2023',
  conditions: ['Arthritis'],
  status: 'Inactive'
}, {
  id: '4',
  name: 'Emily Davis',
  age: 24,
  gender: 'Female',
  lastVisit: 'Nov 01, 2023',
  conditions: ['Migraine'],
  status: 'Active'
}];
export function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const filteredPatients = MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.conditions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())));
  const handleViewRecords = (id: string) => {
    const patient = MOCK_PATIENTS.find(p => p.id === id);
    if (patient) {
      setSelectedPatient(patient);
      setIsViewerOpen(true);
      setHasConsent(false); // Reset consent for demo
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
            {filteredPatients.map(patient => <PatientCard key={patient.id} patient={patient} onViewRecords={handleViewRecords} />)}
          </div>

          {filteredPatients.length === 0 && <div className="text-center py-20 bg-white rounded-xl border-2 border-gray-200 border-dashed">
              <p className="text-xl text-gray-500">
                No patients found matching "{searchTerm}"
              </p>
            </div>}
        </div>
      </main>

      {selectedPatient && <MedicalRecordViewer patient={selectedPatient} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} hasConsent={hasConsent} onRequestConsent={() => setHasConsent(true)} />}

      <Footer />
    </div>;
}