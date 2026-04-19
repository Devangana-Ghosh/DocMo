import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabNavigation } from '../../components/LabNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { UploadPanel } from '../../components/lab/UploadPanel';
import { PatientLookup } from '../../components/lab/PatientLookup';
import type { Patient as LookupPatient } from '../../components/lab/PatientLookup';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send, CheckCircle } from 'lucide-react';
import { fetchProfilesByRole, uploadLabReport } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export function UploadReportPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<LookupPatient | null>(null);
  const [patients, setPatients] = useState<LookupPatient[]>([]);
  const [testType, setTestType] = useState('');
  const [testDate, setTestDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploaded, setIsUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const profiles = await fetchProfilesByRole('patient');
        const mapped: LookupPatient[] = profiles.map((item) => ({
          id: item.id,
          name: item.full_name,
          mrn: item.mrn ?? `MRN-${item.id.slice(0, 5)}`,
          dob: item.dob ?? '1990-01-01',
          gender: item.gender ?? 'Unknown',
        }));
        setPatients(mapped);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load patients.');
      }
    };

    void loadPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (selectedFile && selectedPatient && testType && testDate) {
      try {
        setSubmitting(true);
        await uploadLabReport({
          patientId: selectedPatient.id,
          uploadedBy: profile.id,
          file: selectedFile,
          testType,
          notes,
          testDate,
        });

        setIsUploaded(true);
        setTimeout(() => {
          setIsUploaded(false);
          setSelectedFile(null);
          setSelectedPatient(null);
          setTestType('');
          setTestDate('');
          setNotes('');
        }, 3000);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload report.');
      } finally {
        setSubmitting(false);
      }
    }
  };
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <LabNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Upload Lab Report
            </h1>
            <p className="text-xl text-gray-600">
              Upload diagnostic test results and assign to patient records.
            </p>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {isUploaded ? <div className="bg-white rounded-xl border-2 border-green-200 p-12 text-center shadow-sm">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-6 rounded-full">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Report Uploaded Successfully!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                The report has been securely uploaded and linked to{' '}
                {selectedPatient?.name}'s medical record.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setIsUploaded(false)} className="bg-purple-700 hover:bg-purple-800 border-purple-700">
                  Upload Another
                </Button>
                <Button variant="outline" onClick={() => navigate('/lab/reports')}>
                  View Reports
                </Button>
              </div>
            </div> : <form onSubmit={handleSubmit} className="space-y-8">
              <UploadPanel onFileSelect={setSelectedFile} selectedFile={selectedFile} onClearFile={() => setSelectedFile(null)} />

              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Test Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select label="Test Type" options={[{
                value: 'cbc',
                label: 'Complete Blood Count (CBC)'
              }, {
                value: 'lipid',
                label: 'Lipid Panel'
              }, {
                value: 'thyroid',
                label: 'Thyroid Function Test'
              }, {
                value: 'glucose',
                label: 'Glucose Test'
              }, {
                value: 'urinalysis',
                label: 'Urinalysis'
              }, {
                value: 'xray',
                label: 'X-Ray'
              }, {
                value: 'mri',
                label: 'MRI Scan'
              }, {
                value: 'other',
                label: 'Other'
              }]} value={testType} onChange={e => setTestType(e.target.value)} required />
                  <Input label="Test Date" type="date" value={testDate} onChange={(event) => setTestDate(event.target.value)} required />
                </div>
                <div className="mt-6">
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-800 focus:ring-4 focus:ring-yellow-400 min-h-[100px]" placeholder="Any special observations or notes about the test..." value={notes} onChange={(event) => setNotes(event.target.value)}></textarea>
                </div>
              </div>

              <PatientLookup onSelectPatient={setSelectedPatient} selectedPatient={selectedPatient} patients={patients} />

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={() => {
              setSelectedFile(null);
              setSelectedPatient(null);
              setTestType('');
              setTestDate('');
              setNotes('');
            }}>
                  Clear Form
                </Button>
                <Button type="submit" isLoading={submitting} disabled={!selectedFile || !selectedPatient || !testType || !testDate} className="bg-purple-700 hover:bg-purple-800 border-purple-700" leftIcon={<Send className="h-5 w-5" />}>
                  Upload Report
                </Button>
              </div>
            </form>}
        </div>
      </main>
      <Footer />
    </div>;
}