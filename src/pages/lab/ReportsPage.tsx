import { useEffect, useMemo, useState } from 'react';
import { LabNavigation } from '../../components/LabNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ReportCard } from '../../components/lab/ReportCard';
import { Search } from 'lucide-react';
import { fetchLabReports, getLabReportPublicUrl, updateLabReportStatus } from '../../services/api';
import type { LabReport } from '../../types/backend';
import { useToast } from '../../components/ui/Toast';
import { downloadSimplePdf } from '../../lib/pdf';

export function ReportsPage() {
  const toast = useToast();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [uploadedByFilter, setUploadedByFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'patient' | 'status'>('newest');
  const [error, setError] = useState('');
  const [reviewingReport, setReviewingReport] = useState<LabReport | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchLabReports();
        setReports(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load reports.');
      }
    };

    void loadReports();
  }, []);

  const patientOptions = useMemo(() => Array.from(new Set(reports.map((report) => report.patient?.full_name).filter(Boolean) as string[])).sort(), [reports]);
  const uploaderOptions = useMemo(() => Array.from(new Set(reports.map((report) => report.uploaded_by_profile?.full_name).filter(Boolean) as string[])).sort(), [reports]);

  const filteredReports = useMemo(() => {
    const filtered = reports.filter((report) => {
      const patientName = report.patient?.full_name ?? '';
      const patientMrn = report.patient?.mrn ?? '';
      const uploaderName = report.uploaded_by_profile?.full_name ?? '';
      const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) || patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) || report.test_type.toLowerCase().includes(searchTerm.toLowerCase()) || uploaderName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || report.status === statusFilter;
      const matchesPatient = !patientFilter || patientName === patientFilter;
      const matchesUploader = !uploadedByFilter || uploaderName === uploadedByFilter;
      const matchesDate = !dateFilter || report.test_date === dateFilter || report.created_at.slice(0, 10) === dateFilter;
      return matchesSearch && matchesStatus && matchesPatient && matchesUploader && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'patient') return (a.patient?.full_name ?? '').localeCompare(b.patient?.full_name ?? '');
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [dateFilter, patientFilter, reports, searchTerm, sortBy, statusFilter, uploadedByFilter]);

  const handleView = async (report: LabReport) => {
    const url = await getLabReportPublicUrl(report.file_path);
    window.open(url, '_blank');
  };

  const handleDownload = async (report: LabReport) => {
    downloadSimplePdf(
      `${report.file_name.replace(/\.[^.]+$/, '')}.pdf`,
      'Lab Report',
      [
        `Patient: ${report.patient?.full_name ?? 'Patient'}`,
        `MRN: ${report.patient?.mrn ?? '-'}`,
        `Test Type: ${report.test_type}`,
        `Status: ${report.status}`,
        `Uploaded By: ${report.uploaded_by_profile?.full_name ?? 'Unknown'}`,
        `Test Date: ${report.test_date}`,
        `Upload Date: ${new Date(report.created_at).toLocaleString()}`,
        '',
        'Notes:',
        report.notes ?? 'None',
      ],
    );
  };

  const handleReview = async () => {
    if (!reviewingReport) return;

    try {
      const updated = await updateLabReportStatus(reviewingReport.id, 'Reviewed', reviewNote.trim() || undefined);
      setReports((current) => current.map((item) => (item.id === reviewingReport.id ? updated : item)));
      setReviewingReport(null);
      setReviewNote('');
      toast.success('Report reviewed', `${updated.patient?.full_name ?? 'Patient'} report is now reviewed.`);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Failed to mark report as reviewed.');
    }
  };

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
            <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input label="Search Reports" placeholder="Patient name, MRN, or test type" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} leftIcon={<Search className="h-5 w-5 text-gray-500" />} />
              </div>
              <Select label="Patient" options={[{ value: '', label: 'All Patients' }, ...patientOptions.map((name) => ({ value: name, label: name }))]} value={patientFilter} onChange={e => setPatientFilter(e.target.value)} />
              <Select label="Uploaded By" options={[{ value: '', label: 'All Uploaders' }, ...uploaderOptions.map((name) => ({ value: name, label: name }))]} value={uploadedByFilter} onChange={e => setUploadedByFilter(e.target.value)} />
              <Input label="Date" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
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
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredReports.length} Reports Found
            </h2>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-gray-700 font-medium">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-purple-800 focus:ring-4 focus:ring-yellow-400" aria-label="Sort reports">
                <option value="newest">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="patient">Patient Name</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map(report => <ReportCard key={report.id} report={report} onView={handleView} onDownload={handleDownload} onReview={() => setReviewingReport(report)} />)}
          </div>

          {filteredReports.length === 0 && <div className="text-center py-20 bg-white rounded-xl border-2 border-gray-200 border-dashed">
              <p className="text-xl text-gray-500">
                No reports found matching your criteria
              </p>
            </div>}
        </div>
      </main>

      {reviewingReport && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mark report as reviewed</h2>
            <p className="text-gray-600 mb-4">{reviewingReport.patient?.full_name ?? 'Patient'} • {reviewingReport.test_type}</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Review notes</label>
            <textarea
              className="w-full min-h-[120px] rounded-lg border-2 border-gray-300 p-3 focus:border-purple-800 focus:ring-4 focus:ring-yellow-400"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add findings, observations, or follow-up notes"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50" onClick={() => { setReviewingReport(null); setReviewNote(''); }}>
                Cancel
              </button>
              <button type="button" className="px-4 py-2 rounded-lg bg-purple-700 text-white font-bold hover:bg-purple-800" onClick={handleReview}>
                Save & Review
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>;
}