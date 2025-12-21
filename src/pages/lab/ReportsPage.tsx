import React, { useState } from 'react';
import { LabNavigation } from '../../components/LabNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ReportCard, LabReport } from '../../components/lab/ReportCard';
import { Search } from 'lucide-react';
const MOCK_REPORTS: LabReport[] = [{
  id: '1',
  patientName: 'John Doe',
  patientMRN: 'MRN-1024',
  testType: 'Complete Blood Count',
  fileName: 'CBC_JohnDoe_Nov2023.pdf',
  uploadDate: 'Nov 10, 2023',
  status: 'Completed'
}, {
  id: '2',
  patientName: 'Jane Smith',
  patientMRN: 'MRN-1025',
  testType: 'Lipid Panel',
  fileName: 'Lipid_JaneSmith_Nov2023.pdf',
  uploadDate: 'Nov 10, 2023',
  status: 'Reviewed'
}, {
  id: '3',
  patientName: 'Robert Johnson',
  patientMRN: 'MRN-1026',
  testType: 'Thyroid Function',
  fileName: 'Thyroid_RobertJ_Nov2023.pdf',
  uploadDate: 'Nov 09, 2023',
  status: 'Completed'
}, {
  id: '4',
  patientName: 'Emily Davis',
  patientMRN: 'MRN-1027',
  testType: 'X-Ray Chest',
  fileName: 'XRay_EmilyD_Nov2023.pdf',
  uploadDate: 'Nov 09, 2023',
  status: 'Pending'
}, {
  id: '5',
  patientName: 'Michael Chen',
  patientMRN: 'MRN-1028',
  testType: 'Urinalysis',
  fileName: 'Urine_MichaelC_Nov2023.pdf',
  uploadDate: 'Nov 08, 2023',
  status: 'Completed'
}, {
  id: '6',
  patientName: 'Sarah Wilson',
  patientMRN: 'MRN-1029',
  testType: 'MRI Brain',
  fileName: 'MRI_SarahW_Nov2023.pdf',
  uploadDate: 'Nov 08, 2023',
  status: 'Reviewed'
}];
export function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const filteredReports = MOCK_REPORTS.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || report.patientMRN.toLowerCase().includes(searchTerm.toLowerCase()) || report.testType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <LabNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Report History
              </h1>
              <p className="text-xl text-gray-600">
                View and manage uploaded lab reports.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Input label="Search Reports" placeholder="Patient name, MRN, or test type" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} leftIcon={<Search className="h-5 w-5 text-gray-500" />} />
              </div>
              <Select label="Filter by Status" options={[{
              value: '',
              label: 'All Statuses'
            }, {
              value: 'Pending',
              label: 'Pending'
            }, {
              value: 'Completed',
              label: 'Completed'
            }, {
              value: 'Reviewed',
              label: 'Reviewed'
            }]} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} />
            </div>
          </div>

          {/* Results */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredReports.length} Reports Found
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">Sort by:</span>
              <select className="bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-purple-800 focus:ring-4 focus:ring-yellow-400" aria-label="Sort reports">
                <option>Most Recent</option>
                <option>Patient Name</option>
                <option>Test Type</option>
                <option>Status</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => <ReportCard key={report.id} report={report} />)}
          </div>

          {filteredReports.length === 0 && <div className="text-center py-20 bg-white rounded-xl border-2 border-gray-200 border-dashed">
              <p className="text-xl text-gray-500">
                No reports found matching your criteria
              </p>
            </div>}
        </div>
      </main>
      <Footer />
    </div>;
}