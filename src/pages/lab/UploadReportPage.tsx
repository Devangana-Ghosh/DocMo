import React, { useState } from 'react';
import { LabNavigation } from '../../components/LabNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { UploadPanel } from '../../components/lab/UploadPanel';
import { PatientLookup } from '../../components/lab/PatientLookup';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send, CheckCircle } from 'lucide-react';
export function UploadReportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [testType, setTestType] = useState('');
  const [isUploaded, setIsUploaded] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && selectedPatient && testType) {
      setIsUploaded(true);
      setTimeout(() => {
        setIsUploaded(false);
        setSelectedFile(null);
        setSelectedPatient(null);
        setTestType('');
      }, 3000);
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
                <Button variant="outline">View Reports</Button>
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
                  <Input label="Test Date" type="date" required max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="mt-6">
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-800 focus:ring-4 focus:ring-yellow-400 min-h-[100px]" placeholder="Any special observations or notes about the test..."></textarea>
                </div>
              </div>

              <PatientLookup onSelectPatient={setSelectedPatient} selectedPatient={selectedPatient} />

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={() => {
              setSelectedFile(null);
              setSelectedPatient(null);
              setTestType('');
            }}>
                  Clear Form
                </Button>
                <Button type="submit" disabled={!selectedFile || !selectedPatient || !testType} className="bg-purple-700 hover:bg-purple-800 border-purple-700" leftIcon={<Send className="h-5 w-5" />}>
                  Upload Report
                </Button>
              </div>
            </form>}
        </div>
      </main>
      <Footer />
    </div>;
}