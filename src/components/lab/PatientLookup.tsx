import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import i18n from '../../i18n';
export interface Patient {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  gender: string;
}
interface PatientLookupProps {
  onSelectPatient: (patient: Patient) => void;
  selectedPatient: Patient | null;
  patients: Patient[];
}
export function PatientLookup({
  onSelectPatient,
  selectedPatient,
  patients,
}: PatientLookupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient);
    setShowResults(false);
    setSearchTerm('');
  };
  return <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Assign to Patient
      </h3>

      {selectedPatient ? <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200 text-purple-800 font-bold text-2xl">
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {selectedPatient.name}
                </p>
                <p className="text-gray-600">{selectedPatient.mrn}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => onSelectPatient(null as unknown as Patient)} className="text-gray-700 border-gray-300">
              Change
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
              <p className="font-bold text-gray-900">{selectedPatient.dob}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Gender</p>
              <p className="font-bold text-gray-900">
                {selectedPatient.gender}
              </p>
            </div>
          </div>
        </div> : <div className="relative">
          <Input label={i18n.t('labUpload.searchPatient', { defaultValue: 'Search Patient' })} placeholder={i18n.t('labUpload.searchPatientPlaceholder', { defaultValue: 'Enter name or MRN...' })} value={searchTerm} onChange={e => {
        setSearchTerm(e.target.value);
        setShowResults(true);
      }} leftIcon={<Search className="h-5 w-5 text-gray-500" />} />

          {showResults && searchTerm && <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {filteredPatients.length > 0 ? filteredPatients.map(patient => <button key={patient.id} onClick={() => handleSelect(patient)} className="w-full p-4 flex items-center gap-4 hover:bg-purple-50 border-b border-gray-100 last:border-0 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-purple-500">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-gray-900">{patient.name}</p>
                      <p className="text-gray-600">
                        {patient.mrn} • {patient.dob}
                      </p>
                    </div>
                  </button>) : <div className="p-8 text-center text-gray-500">
                  {i18n.t('labUpload.noPatientsFound', { search: searchTerm, defaultValue: 'No patients found matching "{{search}}"' })}
                </div>}
            </div>}
        </div>}
    </div>;
}